import json
import os
import traceback
from sqlalchemy.orm import Session
from datetime import datetime
import models
import tools
from llm_adapter import GeminiPlanner, DeterministicPlanner

def log_trace(db: Session, run_id: int, step: str, message: str):
    trace = models.AgentTrace(
        agent_run_id=run_id,
        step=step,
        message=message
    )
    db.add(trace)
    db.commit()

def execute_action(db: Session, run_id: int, action, requires_approval: bool):
    if not action:
        return
    tool_name = action.tool
    tool_args = action.args
    
    if tool_name not in tools.TOOL_REGISTRY:
        log_trace(db, run_id, "tool_call", f"Failed: Unknown tool {tool_name}")
        return {"status": "error", "message": f"Unknown tool {tool_name}"}

    safe_tools = ["create_approval", "send_staff_alert", "create_customer_notice", "estimate_revenue_impact"]
    
    if requires_approval and tool_name not in safe_tools:
        log_trace(db, run_id, "tool_call", f"Action {tool_name} held for approval.")
        # Convert risky action to approval payload
        tools.create_approval(db, run_id, action_type=tool_name, payload=tool_args, reason="Held by approval guard")
        return {"status": "held"}
        
    result = tools.TOOL_REGISTRY[tool_name](db, run_id, **tool_args)
    if result.get("status") == "error":
        log_trace(db, run_id, "tool_call", f"Tool {tool_name} failed: {result.get('message')}")
    return result

def run_agent_pipeline(signal_event_id: int, db: Session):
    signal = db.query(models.SignalEvent).filter(models.SignalEvent.id == signal_event_id).first()
    if not signal:
        return
    
    agent_run = models.AgentRun(signal_event_id=signal.id, status="running")
    db.add(agent_run)
    db.commit()
    db.refresh(agent_run)
    
    # Snapshot before state
    before_state = tools.get_menu_state(db)
    agent_run.before_state_json = json.dumps(before_state)
    db.commit()

    log_trace(db, agent_run.id, "observe", f"Ingested signal: {signal.raw_text}")

    # Planning phase
    log_trace(db, agent_run.id, "interpret", "Analyzing signal...")

    plan = None
    planner_used = "unknown"
    if os.environ.get("GEMINI_API_KEY"):
        try:
            planner = GeminiPlanner()
            plan = planner.plan(signal.raw_text, before_state)
            planner_used = "gemini"
            log_trace(db, agent_run.id, "interpret", "Gemini 2.5 Flash semantic planner produced structured plan.")
        except Exception as e:
            planner_used = "deterministic"
            log_trace(db, agent_run.id, "interpret", f"Semantic planner unavailable ({type(e).__name__}); deterministic safety planner selected.")
            planner = DeterministicPlanner()
            plan = planner.plan(signal.raw_text, before_state)
    else:
        planner_used = "deterministic"
        log_trace(db, agent_run.id, "interpret", "No API key; deterministic safety planner selected.")
        planner = DeterministicPlanner()
        plan = planner.plan(signal.raw_text, before_state)

    # Log extracted facts as reasoning chain
    for i, fact in enumerate(plan.extracted_facts):
        log_trace(db, agent_run.id, "reasoning", f"[Step {i+1}] {fact}")

    signal.confidence = plan.confidence
    signal.impact_score = plan.impact_score
    db.commit()

    log_trace(db, agent_run.id, "impact", f"Impact Score: {plan.impact_score}/10. Confidence: {plan.confidence}")
    if plan.requires_approval:
        log_trace(db, agent_run.id, "policy_guard", "Enforcing ethical guardrail / high risk. Requires human approval.")
    else:
        log_trace(db, agent_run.id, "policy_guard", "Action is within safe bounds. Proceeding.")
        
    plan_dict = plan.dict() if hasattr(plan, "dict") else plan.model_dump()
    log_trace(db, agent_run.id, "plan", f"Formulated execution plan: {json.dumps(plan_dict)}")

    # Execute plan safely
    run_failed = False
    if plan.primary_action:
        res = execute_action(db, agent_run.id, plan.primary_action, plan.requires_approval)
        if res and res.get("status") == "error":
            run_failed = True

    for sec_action in plan.secondary_actions:
        res = execute_action(db, agent_run.id, sec_action, plan.requires_approval)
        if res and res.get("status") == "error":
            run_failed = True

    # Estimate ROI
    roi = tools.estimate_revenue_impact(db, agent_run.id, plan_dict)
    agent_run.revenue_impact_estimate = roi.get("estimated_impact", 0.0)
    
    if run_failed:
        agent_run.status = "failed"
        log_trace(db, agent_run.id, "verify", "One or more tools failed to execute.")
    else:
        agent_run.status = "requires_approval" if plan.requires_approval else "completed"
        log_trace(db, agent_run.id, "verify", "All tools executed successfully or held for approval.")
    
    # Snapshot after state
    after_state = tools.get_menu_state(db)
    agent_run.after_state_json = json.dumps(after_state)

    agent_run.completed_at = datetime.utcnow()
    agent_run.final_decision = json.dumps(plan_dict)
    agent_run.requires_approval = plan.requires_approval
    signal.status = "processed"
    
    log_trace(db, agent_run.id, "final", f"Agent run finished with status: {agent_run.status}")
    db.commit()
    return agent_run.id
