import os
import json
import hashlib
import secrets
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import models, schemas, agent, tools
from database import engine, get_db
from llm_adapter import GEMINI_MODEL, GEMINI_TIMEOUT_SECONDS
from weather import DEFAULT_LATITUDE, DEFAULT_LOCATION, DEFAULT_LONGITUDE, fetch_weather_context

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Create database tables
models.Base.metadata.create_all(bind=engine)

DATABASE_INDEXES = [
    ("idx_signal_events_status", "signal_events", "status"),
    ("idx_signal_events_created_at", "signal_events", "created_at"),
    ("idx_agent_runs_signal_event_id", "agent_runs", "signal_event_id"),
    ("idx_agent_trace_agent_run_id", "agent_trace", "agent_run_id"),
    ("idx_approvals_agent_run_id", "approvals", "agent_run_id"),
    ("idx_approvals_status", "approvals", "status"),
    ("idx_notifications_agent_run_id", "notifications", "agent_run_id"),
    ("idx_user_accounts_email", "user_accounts", "email"),
    ("idx_auth_sessions_user_id", "auth_sessions", "user_id"),
]


def ensure_indexes():
    with engine.begin() as connection:
        for index_name, table_name, column_name in DATABASE_INDEXES:
            connection.execute(text(f"CREATE INDEX IF NOT EXISTS {index_name} ON {table_name} ({column_name})"))


ensure_indexes()

app = FastAPI(title="MenuMind Autonomous Agent API")

SCENARIOS = [
    {"id": 1, "name": "Supply Shock", "raw_text": "Assalam-o-Alaikum mian saab, gari ka axle toot gaya hai mandi k paas. Aaj chicken delivery nahi hosakti."},
    {"id": 2, "name": "Heatwave Demand Shift", "raw_text": "OpenWeather: Islamabad 44C, extreme heat advisory. Garmi bohat hai."},
    {"id": 3, "name": "Competitor Price Attack", "raw_text": "Cafe across the street dropped premium burgers to 350 PKR for lunch."},
    {"id": 4, "name": "Crisis Guardrail", "raw_text": "Faizabad blocked due to strike (hartal), deliveries frozen across sectors."},
    {"id": 5, "name": "Contradiction Test", "raw_text": "Supplier says chicken is unavailable, but inventory buffer shows enough stock."},
]

MENU_SEED = [
    ("chicken_wrap", "Chicken Wrap", "Food", 450.0, 0.35, 10, 50),
    ("beef_wrap", "Beef Wrap", "Food", 550.0, 0.45, 12, 30),
    ("club_sandwich", "Club Sandwich Meal", "Food", 600.0, 0.40, 15, 40),
    ("iced_lemonade", "Iced Mint Lemonade", "Cold Beverage", 250.0, 0.60, 5, 100),
    ("hot_coffee", "Hot Brew Coffee", "Hot Beverage", 300.0, 0.70, 5, 100),
]

HISTORY_TABLES = [models.SignalEvent, models.AgentRun, models.AgentTrace, models.Approval, models.Notification]
DEFAULT_NOTIFICATIONS = {
    "pushNotifications": True,
    "emailNotifications": True,
    "smsAlerts": False,
    "approvalAlerts": True,
    "inventoryAlerts": True,
    "weeklyDigest": True,
}
DEFAULT_AI_PREFERENCES = {
    "autoApproveThreshold": 70,
    "riskTolerance": "balanced",
    "decisionSpeed": "fast",
    "humanOverride": True,
    "explainDecisions": True,
    "learnFromFeedback": True,
}
DEFAULT_SECURITY = {"twoFactorEnabled": False, "lastPasswordChange": "Never"}

def get_or_404(db: Session, model, detail: str, **filters):
    row = db.query(model).filter_by(**filters).first()
    if not row:
        raise HTTPException(status_code=404, detail=detail)
    return row

def get_pending_approval(db: Session, approval_id: int):
    approval = get_or_404(db, models.Approval, "Approval not found", id=approval_id)
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Approval already {approval.status}")
    return approval

def hash_password(password: str, salt: Optional[str] = None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000).hex()
    return f"{salt}:{digest}"

def verify_password(password: str, password_hash: str):
    try:
        salt, expected = password_hash.split(":", 1)
    except ValueError:
        return False
    return secrets.compare_digest(hash_password(password, salt).split(":", 1)[1], expected)

def serialize_user(user: models.UserAccount):
    return {
        "id": str(user.id),
        "email": user.email,
        "fullName": user.full_name,
        "cafeName": user.cafe_name,
        "role": user.role,
        "phone": user.phone,
        "location": user.location,
    }

def create_session(db: Session, user: models.UserAccount):
    token = secrets.token_urlsafe(32)
    db.add(models.AuthSession(token=token, user_id=user.id))
    db.commit()
    return token

def current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    token = authorization.split(" ", 1)[1].strip()
    if token == "demo-token":
        user = db.query(models.UserAccount).filter_by(email="demo@menumind.ai").first()
        if not user:
            user = models.UserAccount(
                email="demo@menumind.ai",
                password_hash=hash_password(secrets.token_urlsafe(16)),
                full_name="MenuMind Demo Owner",
                cafe_name="MenuMind Cafe",
                role="owner",
                location=DEFAULT_LOCATION,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            get_or_create_settings(db, user.id)
        return user
    session = db.query(models.AuthSession).filter_by(token=token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    user = db.query(models.UserAccount).filter_by(id=session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def optional_user_from_authorization(authorization: Optional[str], db: Session):
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    if token == "demo-token":
        return db.query(models.UserAccount).filter_by(email="demo@menumind.ai").first()
    session = db.query(models.AuthSession).filter_by(token=token).first()
    if not session:
        return None
    return db.query(models.UserAccount).filter_by(id=session.user_id).first()

def load_ai_preferences_for_request(authorization: Optional[str], db: Session):
    user = optional_user_from_authorization(authorization, db)
    if not user:
        return normalize_ai_preferences(DEFAULT_AI_PREFERENCES)
    settings = get_or_create_settings(db, user.id)
    return normalize_ai_preferences(load_json(settings.ai_preferences_json, DEFAULT_AI_PREFERENCES))

def get_or_create_settings(db: Session, user_id: int):
    row = db.query(models.UserSetting).filter_by(user_id=user_id).first()
    if row:
        return row
    row = models.UserSetting(
        user_id=user_id,
        notifications_json=json.dumps(DEFAULT_NOTIFICATIONS),
        ai_preferences_json=json.dumps(DEFAULT_AI_PREFERENCES),
        security_json=json.dumps(DEFAULT_SECURITY),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

def load_json(value: Optional[str], fallback: dict):
    if not value:
        return dict(fallback)
    try:
        return {**fallback, **json.loads(value)}
    except json.JSONDecodeError:
        return dict(fallback)

def normalize_ai_preferences(preferences: dict):
    current = dict(preferences)
    try:
        threshold = float(current.get("autoApproveThreshold", DEFAULT_AI_PREFERENCES["autoApproveThreshold"]))
    except (TypeError, ValueError):
        threshold = DEFAULT_AI_PREFERENCES["autoApproveThreshold"]
    if 0 < threshold <= 1:
        threshold *= 100
    current["autoApproveThreshold"] = max(0, min(100, round(threshold)))
    current["decisionSpeed"] = str(current.get("decisionSpeed") or "fast").lower()
    return current

def seeded_menu(chicken_stock: int):
    rows = []
    for item_id, name, category, price, margin, prep_time, stock in MENU_SEED:
        rows.append(models.MenuItem(
            id=item_id, name=name, category=category, base_price=price, current_price=price,
            is_available=True, is_promoted=False,
            stock_level=chicken_stock if item_id == "chicken_wrap" else stock,
            margin_pct=margin, prep_time_min=prep_time,
        ))
    return rows

def ensure_demo_menu(db: Session):
    if db.query(models.MenuItem).count() == 0:
        db.add_all(seeded_menu(chicken_stock=50))
        db.commit()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    has_key = bool(os.environ.get("GEMINI_API_KEY"))
    return {
        "status": "ok",
        "message": "MenuMind API is running!",
        "planner": "gemini" if has_key else "safety_fallback",
        "model": GEMINI_MODEL if has_key else None,
        "timeout_seconds": GEMINI_TIMEOUT_SECONDS,
        "make_webhook": "configured" if os.environ.get("MAKE_WEBHOOK_URL") else "not_configured",
    }

@app.on_event("startup")
def seed_demo_data_on_startup():
    db = next(get_db())
    try:
        ensure_demo_menu(db)
        
        # Ensure demo user exists with password "demo"
        user = db.query(models.UserAccount).filter_by(email="demo@menumind.ai").first()
        if not user:
            user = models.UserAccount(
                email="demo@menumind.ai",
                password_hash=hash_password("demo"),
                full_name="MenuMind Demo Owner",
                cafe_name="MenuMind Cafe",
                role="owner",
                location=DEFAULT_LOCATION,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            get_or_create_settings(db, user.id)
    finally:
        db.close()

@app.post("/auth/signup", response_model=schemas.AuthResponse)
def signup(payload: schemas.SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    if db.query(models.UserAccount).filter_by(email=email).first():
        raise HTTPException(status_code=409, detail="Email already exists")
    user = models.UserAccount(
        email=email,
        password_hash=hash_password(payload.password),
        full_name=payload.fullName.strip(),
        cafe_name=payload.cafeName,
        role="owner",
        location=DEFAULT_LOCATION,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    get_or_create_settings(db, user.id)
    token = create_session(db, user)
    return {"user": serialize_user(user), "token": token}

@app.post("/auth/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    if email == "demo@menumind.ai":
        if payload.password != "demo":
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user = db.query(models.UserAccount).filter_by(email="demo@menumind.ai").first()
        if not user:
            user = models.UserAccount(
                email="demo@menumind.ai",
                password_hash=hash_password("demo"),
                full_name="MenuMind Demo Owner",
                cafe_name="MenuMind Cafe",
                role="owner",
                location=DEFAULT_LOCATION,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            get_or_create_settings(db, user.id)
        return {"user": serialize_user(user), "token": "demo-token"}

    user = db.query(models.UserAccount).filter_by(email=email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_session(db, user)
    return {"user": serialize_user(user), "token": token}

@app.get("/auth/profile", response_model=schemas.UserProfile)
def profile(user: models.UserAccount = Depends(current_user)):
    return serialize_user(user)

@app.get("/settings/profile", response_model=schemas.UserProfile)
def get_profile(user: models.UserAccount = Depends(current_user)):
    return serialize_user(user)

@app.put("/settings/profile", response_model=schemas.UserProfile)
def update_profile(payload: dict, user: models.UserAccount = Depends(current_user), db: Session = Depends(get_db)):
    if "fullName" in payload:
        user.full_name = str(payload["fullName"])
    if "cafeName" in payload:
        user.cafe_name = payload["cafeName"]
    if "phone" in payload:
        user.phone = payload["phone"]
    if "role" in payload:
        user.role = str(payload["role"])
    if "location" in payload:
        user.location = payload["location"]
    db.commit()
    db.refresh(user)
    return serialize_user(user)

@app.get("/settings/notifications")
def get_notification_settings(user: models.UserAccount = Depends(current_user), db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user.id)
    return load_json(settings.notifications_json, DEFAULT_NOTIFICATIONS)

@app.put("/settings/notifications")
def update_notification_settings(payload: dict, user: models.UserAccount = Depends(current_user), db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user.id)
    current = load_json(settings.notifications_json, DEFAULT_NOTIFICATIONS)
    current.update(payload)
    settings.notifications_json = json.dumps(current)
    db.commit()
    return current

@app.get("/settings/ai-preferences")
def get_ai_preferences(user: models.UserAccount = Depends(current_user), db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user.id)
    return normalize_ai_preferences(load_json(settings.ai_preferences_json, DEFAULT_AI_PREFERENCES))

@app.put("/settings/ai-preferences")
def update_ai_preferences(payload: dict, user: models.UserAccount = Depends(current_user), db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user.id)
    current = load_json(settings.ai_preferences_json, DEFAULT_AI_PREFERENCES)
    current.update(payload)
    current = normalize_ai_preferences(current)
    settings.ai_preferences_json = json.dumps(current)
    db.commit()
    return current

@app.get("/settings/security")
def get_security_settings(user: models.UserAccount = Depends(current_user), db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user.id)
    return load_json(settings.security_json, DEFAULT_SECURITY)

@app.post("/settings/security/password")
def change_password(payload: dict, user: models.UserAccount = Depends(current_user), db: Session = Depends(get_db)):
    current = payload.get("currentPassword", "")
    new_password = payload.get("newPassword", "")
    if not verify_password(current, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    user.password_hash = hash_password(new_password)
    settings = get_or_create_settings(db, user.id)
    security = load_json(settings.security_json, DEFAULT_SECURITY)
    security["lastPasswordChange"] = datetime.utcnow().isoformat()
    settings.security_json = json.dumps(security)
    db.commit()
    return {"success": True}

@app.post("/settings/security/2fa")
def toggle_2fa(payload: dict, user: models.UserAccount = Depends(current_user), db: Session = Depends(get_db)):
    settings = get_or_create_settings(db, user.id)
    security = load_json(settings.security_json, DEFAULT_SECURITY)
    security["twoFactorEnabled"] = bool(payload.get("enabled"))
    settings.security_json = json.dumps(security)
    db.commit()
    return security

@app.get("/menu", response_model=list[schemas.MenuItem])
def read_menu(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    ensure_demo_menu(db)
    items = db.query(models.MenuItem).offset(skip).limit(limit).all()
    return items

@app.get("/weather/context", response_model=schemas.WeatherContext)
def get_weather_context(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    location: Optional[str] = None,
):
    return fetch_weather_context(
        latitude=latitude or DEFAULT_LATITUDE,
        longitude=longitude or DEFAULT_LONGITUDE,
        location_name=location or DEFAULT_LOCATION,
    )

@app.post("/signals", response_model=schemas.SignalEvent)
def create_signal(signal: schemas.SignalEventCreate, db: Session = Depends(get_db)):
    db_signal = models.SignalEvent(**signal.model_dump() if hasattr(signal, "model_dump") else signal.dict())
    db.add(db_signal)
    db.commit()
    db.refresh(db_signal)
    return db_signal

@app.get("/signals", response_model=list[schemas.SignalEvent])
def list_signals(limit: int = 25, db: Session = Depends(get_db)):
    return db.query(models.SignalEvent).order_by(models.SignalEvent.id.desc()).limit(limit).all()

@app.post("/agent/run/{signal_event_id}")
def run_agent(
    signal_event_id: int,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    ensure_demo_menu(db)
    ai_preferences = load_ai_preferences_for_request(authorization, db)
    run_id = agent.run_agent_pipeline(signal_event_id, db, ai_preferences=ai_preferences)
    if not run_id:
        raise HTTPException(status_code=404, detail="Signal event not found")
    return {"status": "success", "agent_run_id": run_id}

@app.get("/agent/runs/{run_id}", response_model=schemas.AgentRun)
def get_run(run_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, models.AgentRun, "Run not found", id=run_id)

@app.get("/agent/runs", response_model=list[schemas.AgentRun])
def list_runs(limit: int = 25, db: Session = Depends(get_db)):
    return db.query(models.AgentRun).order_by(models.AgentRun.id.desc()).limit(limit).all()

@app.get("/agent/runs/{run_id}/trace")
def get_trace(run_id: int, db: Session = Depends(get_db)):
    traces = db.query(models.AgentTrace).filter(models.AgentTrace.agent_run_id == run_id).all()
    return [
        {
            "id": trace.id,
            "agent_run_id": trace.agent_run_id,
            "step": trace.step or "agent",
            "message": trace.message or "",
            "tool_name": trace.tool_name,
            "tool_input_json": trace.tool_input_json,
            "tool_output_json": trace.tool_output_json,
            "created_at": trace.created_at or datetime.utcnow(),
        }
        for trace in traces
    ]

@app.get("/menu/before-after/{run_id}")
def get_before_after(run_id: int, db: Session = Depends(get_db)):
    run = get_or_404(db, models.AgentRun, "Run not found", id=run_id)
    before = json.loads(run.before_state_json) if run.before_state_json else {}
    after = json.loads(run.after_state_json) if run.after_state_json else {}
    
    changes = []
    for item_id, before_item in before.items():
        after_item = after.get(item_id)
        if not after_item:
            continue
        
        for field, before_val in before_item.items():
            after_val = after_item.get(field)
            if before_val != after_val:
                changes.append({
                    "item_id": item_id,
                    "field": field,
                    "before": before_val,
                    "after": after_val
                })
                
    return {
        "run_id": run.id,
        "before": before,
        "after": after,
        "changes": changes
    }

@app.get("/approvals", response_model=list[schemas.Approval])
def get_approvals(run_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Approval)
    if run_id is not None:
        query = query.filter(models.Approval.agent_run_id == run_id)
    if status:
        query = query.filter(models.Approval.status == status)
    return query.order_by(models.Approval.id.desc()).all()

@app.post("/approvals/{approval_id}/approve")
def approve_action(approval_id: int, db: Session = Depends(get_db)):
    approval = get_pending_approval(db, approval_id)
    tool_name = approval.action_type
    if tool_name in tools.TOOL_REGISTRY:
        payload = json.loads(approval.payload_json) if approval.payload_json else {}
        tools.TOOL_REGISTRY[tool_name](db, approval.agent_run_id, **payload)
        
    approval.status = "approved"
    approval.resolved_at = datetime.utcnow()
    
    run = db.query(models.AgentRun).filter_by(id=approval.agent_run_id).first()
    if run:
        run.status = "completed"
        agent.log_trace(db, run.id, "approval_execution", f"Action {tool_name} approved and executed by user.")
        
    db.commit()
    return {"status": "success", "message": "Action approved and executed"}

@app.post("/approvals/{approval_id}/reject")
def reject_action(approval_id: int, db: Session = Depends(get_db)):
    approval = get_pending_approval(db, approval_id)
    approval.status = "rejected"
    approval.resolved_at = datetime.utcnow()
    
    run = db.query(models.AgentRun).filter_by(id=approval.agent_run_id).first()
    if run:
        run.status = "completed"
        agent.log_trace(db, run.id, "approval_execution", f"Action {approval.action_type} rejected by user.")
        
    db.commit()
    return {"status": "success", "message": "Action rejected"}

@app.get("/notifications", response_model=list[schemas.Notification])
def get_notifications(run_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Notification)
    if run_id is not None:
        query = query.filter(models.Notification.agent_run_id == run_id)
    return query.order_by(models.Notification.id.desc()).all()

@app.get("/audit-log")
def audit_log(page: int = 1, pageSize: int = 10, action: Optional[str] = None, db: Session = Depends(get_db)):
    page = max(page, 1)
    pageSize = max(min(pageSize, 100), 1)
    query = db.query(models.AgentTrace)
    if action and action != "all":
        query = query.filter(models.AgentTrace.step == action)
    total = query.count()
    traces = (
        query.order_by(models.AgentTrace.id.desc())
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .all()
    )
    entries = []
    for trace in traces:
        run = db.query(models.AgentRun).filter_by(id=trace.agent_run_id).first()
        entries.append({
            "id": str(trace.id),
            "action": trace.step,
            "signalType": "Menu Signal",
            "title": trace.step.replace("_", " ").title(),
            "confidence": 80,
            "details": trace.message,
            "timestamp": trace.created_at,
            "createdAt": trace.created_at,
            "context": {
                "agentRunId": trace.agent_run_id,
                "runStatus": run.status if run else "unknown",
            },
        })
    return {
        "entries": entries,
        "totalCount": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": max(1, (total + pageSize - 1) // pageSize),
    }

@app.get("/audit-log/{entry_id}")
def audit_log_entry(entry_id: int, db: Session = Depends(get_db)):
    trace = get_or_404(db, models.AgentTrace, "Audit entry not found", id=entry_id)
    return {
        "id": str(trace.id),
        "action": trace.step,
        "signalType": "Menu Signal",
        "title": trace.step.replace("_", " ").title(),
        "confidence": 80,
        "details": trace.message,
        "timestamp": trace.created_at,
        "createdAt": trace.created_at,
    }

@app.get("/analytics/throughput")
def analytics_throughput(db: Session = Depends(get_db)):
    runs = db.query(models.AgentRun).order_by(models.AgentRun.id.desc()).limit(12).all()
    return [
        {
            "id": str(run.id),
            "label": run.started_at.strftime("%H:%M") if run.started_at else f"Run {run.id}",
            "value": db.query(models.AgentTrace).filter_by(agent_run_id=run.id).count(),
            "timestamp": run.started_at,
        }
        for run in reversed(runs)
    ]

@app.get("/analytics/signals")
def analytics_signals(db: Session = Depends(get_db)):
    rows = db.query(models.SignalEvent).all()
    counts = {}
    for row in rows:
        counts[row.source_type or "unknown"] = counts.get(row.source_type or "unknown", 0) + 1
    return [{"id": source, "source": source, "count": count} for source, count in counts.items()]

@app.get("/analytics/recommendations")
def analytics_recommendations(db: Session = Depends(get_db)):
    runs = db.query(models.AgentRun).order_by(models.AgentRun.id.desc()).limit(10).all()
    recommendations = []
    for run in runs:
        plan = json.loads(run.final_decision) if run.final_decision else {}
        for idx, text_value in enumerate(plan.get("recommended_actions", [])[:3]):
            recommendations.append({
                "id": f"{run.id}-{idx}",
                "signalType": "Menu Signal",
                "title": plan.get("signal_summary") or "Agent recommendation",
                "confidence": round(float(plan.get("confidence", 0.8)) * 100),
                "recommendation": text_value,
                "description": plan.get("insight") or text_value,
                "status": run.status,
            })
    return recommendations

@app.post("/analytics/recommendations/{recommendation_id}/execute")
def execute_recommendation(recommendation_id: str):
    return {"id": recommendation_id, "status": "executed"}

@app.post("/analytics/recommendations/{recommendation_id}/dismiss")
def dismiss_recommendation(recommendation_id: str):
    return {"id": recommendation_id, "status": "dismissed"}

@app.get("/analytics/interpretation")
def analytics_interpretation(db: Session = Depends(get_db)):
    run = db.query(models.AgentRun).order_by(models.AgentRun.id.desc()).first()
    if not run or not run.final_decision:
        return {"summary": "No agent run yet. Submit a signal to generate live analytics.", "insights": []}
    plan = json.loads(run.final_decision)
    return {
        "summary": plan.get("insight") or plan.get("reason") or "Agent completed a run.",
        "insights": [
            {"label": "Demand Forecast", "value": "High" if plan.get("impact_score", 0) >= 7 else "Medium", "confidence": round(float(plan.get("confidence", 0.8)) * 100)},
            {"label": "Approval Gate", "value": "Required" if plan.get("requires_approval") else "Not required", "confidence": 90},
            {"label": "Primary Action", "value": (plan.get("primary_action") or {}).get("tool", "none"), "confidence": 88},
        ],
    }

@app.get("/signals/scenarios")
def get_scenarios():
    return SCENARIOS

@app.post("/demo/reset")
def reset_demo(chicken_stock: int = 50, clear_history: bool = True, db: Session = Depends(get_db)):
    db.query(models.MenuItem).delete()
    if clear_history:
        for table in HISTORY_TABLES:
            db.query(table).delete()
    db.commit()

    db.add_all(seeded_menu(chicken_stock))
    db.commit()
    return {"status": "success", "message": f"Demo data reset with chicken_stock={chicken_stock}."}
