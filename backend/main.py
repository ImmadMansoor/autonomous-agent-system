from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, agent
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MenuMind Autonomous Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev (http://localhost:5173, etc)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "MenuMind API is running!"}

@app.get("/menu", response_model=list[schemas.MenuItem])
def read_menu(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.MenuItem).offset(skip).limit(limit).all()
    return items

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
    run = db.query(models.AgentRun).filter(models.AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

@app.get("/agent/runs/{run_id}/trace", response_model=list[schemas.AgentTrace])
def get_trace(run_id: int, db: Session = Depends(get_db)):
    traces = db.query(models.AgentTrace).filter(models.AgentTrace.agent_run_id == run_id).all()
    return traces

@app.get("/menu/before-after/{run_id}")
def get_before_after(run_id: int, db: Session = Depends(get_db)):
    import json
    run = db.query(models.AgentRun).filter(models.AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
        
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
def get_approvals(db: Session = Depends(get_db)):
    return db.query(models.Approval).all()

@app.post("/approvals/{approval_id}/approve")
def approve_action(approval_id: int, db: Session = Depends(get_db)):
    import json
    from datetime import datetime
    import tools
    import agent
    
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
        
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Approval already {approval.status}")
        
    tool_name = approval.action_type
    if tool_name in tools.TOOL_REGISTRY:
        payload = json.loads(approval.payload_json) if approval.payload_json else {}
        tools.TOOL_REGISTRY[tool_name](db, approval.agent_run_id, **payload)
        
    approval.status = "approved"
    approval.resolved_at = datetime.utcnow()
    
    run = db.query(models.AgentRun).filter(models.AgentRun.id == approval.agent_run_id).first()
    if run:
        run.status = "completed"
        agent.log_trace(db, run.id, "approval_execution", f"Action {tool_name} approved and executed by user.")
        
    db.commit()
    return {"status": "success", "message": "Action approved and executed"}

@app.post("/approvals/{approval_id}/reject")
def reject_action(approval_id: int, db: Session = Depends(get_db)):
    from datetime import datetime
    import agent
    
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
        
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Approval already {approval.status}")
        
    approval.status = "rejected"
    approval.resolved_at = datetime.utcnow()
    
    run = db.query(models.AgentRun).filter(models.AgentRun.id == approval.agent_run_id).first()
    if run:
        run.status = "completed"
        agent.log_trace(db, run.id, "approval_execution", f"Action {approval.action_type} rejected by user.")
        
    db.commit()
    return {"status": "success", "message": "Action rejected"}

@app.get("/notifications", response_model=list[schemas.Notification])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(models.Notification).all()

@app.get("/signals/scenarios")
def get_scenarios():
    return [
        {"id": 1, "name": "Supply Shock", "raw_text": "Assalam-o-Alaikum mian saab, gari ka axle toot gaya hai mandi k paas. Aaj chicken delivery nahi hosakti."},
        {"id": 2, "name": "Heatwave Demand Shift", "raw_text": "OpenWeather: Islamabad 44C, extreme heat advisory. Garmi bohat hai."},
        {"id": 3, "name": "Competitor Price Attack", "raw_text": "Cafe across the street dropped premium burgers to 350 PKR for lunch."},
        {"id": 4, "name": "Crisis Guardrail", "raw_text": "Faizabad blocked due to strike (hartal), deliveries frozen across sectors."},
        {"id": 5, "name": "Contradiction Test", "raw_text": "Supplier says chicken is unavailable, but inventory buffer shows enough stock."}
    ]

@app.post("/demo/reset")
def reset_demo(chicken_stock: int = 50, clear_history: bool = True, db: Session = Depends(get_db)):
    # Clear menu
    db.query(models.MenuItem).delete()
    
    if clear_history:
        db.query(models.SignalEvent).delete()
        db.query(models.AgentRun).delete()
        db.query(models.AgentTrace).delete()
        db.query(models.Approval).delete()
        db.query(models.Notification).delete()
        
    db.commit()

    # Seed mock menu
    mock_items = [
        models.MenuItem(id="chicken_wrap", name="Chicken Wrap", category="Food", base_price=450.0, current_price=450.0, is_available=True, is_promoted=False, stock_level=chicken_stock, margin_pct=0.35, prep_time_min=10),
        models.MenuItem(id="beef_wrap", name="Beef Wrap", category="Food", base_price=550.0, current_price=550.0, is_available=True, is_promoted=False, stock_level=30, margin_pct=0.45, prep_time_min=12),
        models.MenuItem(id="club_sandwich", name="Club Sandwich Meal", category="Food", base_price=600.0, current_price=600.0, is_available=True, is_promoted=False, stock_level=40, margin_pct=0.40, prep_time_min=15),
        models.MenuItem(id="iced_lemonade", name="Iced Mint Lemonade", category="Cold Beverage", base_price=250.0, current_price=250.0, is_available=True, is_promoted=False, stock_level=100, margin_pct=0.60, prep_time_min=5),
        models.MenuItem(id="hot_coffee", name="Hot Brew Coffee", category="Hot Beverage", base_price=300.0, current_price=300.0, is_available=True, is_promoted=False, stock_level=100, margin_pct=0.70, prep_time_min=5)
    ]
    db.add_all(mock_items)
    db.commit()
    return {"status": "success", "message": f"Demo data reset with chicken_stock={chicken_stock}."}
