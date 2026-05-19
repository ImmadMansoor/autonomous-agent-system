import os
import json
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev (http://localhost:5173, etc)
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
    }

@app.get("/menu", response_model=list[schemas.MenuItem])
def read_menu(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
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

@app.post("/agent/run/{signal_event_id}")
def run_agent(signal_event_id: int, db: Session = Depends(get_db)):
    run_id = agent.run_agent_pipeline(signal_event_id, db)
    if not run_id:
        raise HTTPException(status_code=404, detail="Signal event not found")
    return {"status": "success", "agent_run_id": run_id}

@app.get("/agent/runs/{run_id}", response_model=schemas.AgentRun)
def get_run(run_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, models.AgentRun, "Run not found", id=run_id)

@app.get("/agent/runs/{run_id}/trace", response_model=list[schemas.AgentTrace])
def get_trace(run_id: int, db: Session = Depends(get_db)):
    traces = db.query(models.AgentTrace).filter(models.AgentTrace.agent_run_id == run_id).all()
    return traces

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
