import json
import os
import traceback
from sqlalchemy.orm import Session
from datetime import datetime
import models
import tools
from weather import fetch_weather_context
from llm_adapter import GeminiPlanner, DeterministicPlanner
from schemas import PlannedAction

CRISIS_KEYWORDS = [
    "strike", "hartal", "flood", "sailaab", "disaster", "emergency",
    "blocked", "protest", "riot", "curfew", "lockdown", "earthquake", "fire",
]
PUBLIC_STRESS_KEYWORDS = [
    "heat", "heatwave", "garmi", "44c", "42c", "40c", "marathon", "runner",
    "flood", "strike", "hartal", "blocked", "emergency", "protest",
]

def log_trace(db: Session, run_id: int, step: str, message: str):
    trace = models.AgentTrace(
        agent_run_id=run_id,
        step=step,
        message=message
    )
    db.add(trace)
    db.commit()

def action_needs_approval(action, before_state: dict) -> bool:
    if not action:
        return False

    if action.tool == "adjust_item_price":
        item_id = action.args.get("item_id")
        new_price = float(action.args.get("new_price", 0))
        item = before_state.get(item_id, {})
        base_price = float(item.get("price", 0))
        return bool(base_price and new_price > base_price * 1.15)

    return action.tool == "crisis_response"

def is_upward_price_action(action, before_state: dict) -> bool:
    if not action or action.tool != "adjust_item_price":
        return False
    item_id = action.args.get("item_id")
    item = before_state.get(item_id, {})
    try:
        base_price = float(item.get("price", 0))
        new_price = float(action.args.get("new_price", 0))
    except (TypeError, ValueError):
        return False
    return bool(base_price and new_price > base_price)

def promotion_guardrail(action, before_state: dict):
    if not is_upward_price_action(action, before_state):
        return action
    item_id = action.args.get("item_id")
    return PlannedAction(
        tool="set_item_promotion",
        args={
            "item_id": item_id,
            "promoted": True,
            "reason": "Public-stress pricing guardrail: promote the item instead of raising price.",
        },
    )

def apply_policy_overrides(db: Session, run_id: int, raw_signal: str, before_state: dict, plan):
    raw = raw_signal.lower()
    crisis_detected = any(keyword in raw for keyword in CRISIS_KEYWORDS)
    public_stress_detected = any(keyword in raw for keyword in PUBLIC_STRESS_KEYWORDS)
    risky_action = action_needs_approval(plan.primary_action, before_state) or any(
        action_needs_approval(action, before_state) for action in plan.secondary_actions
    )

    if public_stress_detected:
        before_primary = plan.primary_action
        before_secondary = list(plan.secondary_actions)
        guarded_items = []
        if is_upward_price_action(before_primary, before_state):
            guarded_items.append(before_primary.args.get("item_id"))
        guarded_items.extend(
            action.args.get("item_id") for action in before_secondary if is_upward_price_action(action, before_state)
        )
        plan.primary_action = promotion_guardrail(plan.primary_action, before_state)
        plan.secondary_actions = [promotion_guardrail(action, before_state) for action in plan.secondary_actions]
        price_guard_triggered = is_upward_price_action(before_primary, before_state) or any(
            is_upward_price_action(action, before_state) for action in before_secondary
        )
        if price_guard_triggered:
            log_trace(
                db,
                run_id,
                "policy_guard",
                "Public-stress pricing guardrail applied: upward price action converted to promotion.",
            )
            item_text = ", ".join(sorted(set(filter(None, guarded_items)))) or "affected item"
            guardrail_recommendation = f"Promote {item_text} instead of raising price during public-stress demand."
            plan.recommended_actions = [guardrail_recommendation] + [
                recommendation for recommendation in plan.recommended_actions
                if "price" not in recommendation.lower() and "raise" not in recommendation.lower()
            ]
            plan.insight = f"{plan.insight or plan.reason} Public-stress pricing guardrail converted the upward price action into a promotion."
            if isinstance(plan.simulated_execution, dict):
                plan.simulated_execution["after"] = guardrail_recommendation
            risky_action = action_needs_approval(plan.primary_action, before_state) or any(
                action_needs_approval(action, before_state) for action in plan.secondary_actions
            )

    if plan.requires_approval and not crisis_detected and not risky_action:
        plan.requires_approval = False
        log_trace(
            db,
            run_id,
            "policy_guard",
            "Approval flag cleared: signal is operational, not a crisis or unsafe price action.",
        )

    if crisis_detected:
        plan.requires_approval = True

    return plan

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
    weather_context = fetch_weather_context()
    log_trace(db, agent_run.id, "observe", f"Weather context: {weather_context.get('summary')}")
    if weather_context.get("risks"):
        log_trace(db, agent_run.id, "reasoning", f"Weather risks: {', '.join(weather_context['risks'])}")

    # Planning phase
    log_trace(db, agent_run.id, "interpret", "Analyzing signal...")

    plan = None
    planner_used = "unknown"
    if os.environ.get("GEMINI_API_KEY"):
        try:
            planner = GeminiPlanner()
            plan = planner.plan(signal.raw_text, before_state, weather_context)
            planner_used = "gemini"
            log_trace(db, agent_run.id, "interpret", "Gemini 2.5 Flash semantic planner produced structured plan.")
        except Exception as e:
            planner_used = "safety_fallback"
            log_trace(db, agent_run.id, "interpret", f"Semantic planner unavailable ({type(e).__name__}); safety fallback planner selected.")
            planner = DeterministicPlanner()
            plan = planner.plan(signal.raw_text, before_state, weather_context)
    else:
        planner_used = "safety_fallback"
        log_trace(db, agent_run.id, "interpret", "No API key; safety fallback planner selected.")
        planner = DeterministicPlanner()
        plan = planner.plan(signal.raw_text, before_state, weather_context)

    plan = apply_policy_overrides(db, agent_run.id, signal.raw_text, before_state, plan)

    # Log extracted facts as reasoning chain
    for i, fact in enumerate(plan.extracted_facts):
        log_trace(db, agent_run.id, "reasoning", f"[Step {i+1}] {fact}")

    for i, step in enumerate(plan.workplan):
        log_trace(db, agent_run.id, "workplan", f"[Task {i+1}] {step}")
    if plan.insight:
        log_trace(db, agent_run.id, "insight", plan.insight)
    if plan.impact_analysis:
        log_trace(db, agent_run.id, "impact_analysis", plan.impact_analysis)
    for i, recommendation in enumerate(plan.recommended_actions):
        log_trace(db, agent_run.id, "recommendation", f"[Action {i+1}] {recommendation}")

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

    if plan.requires_approval:
        pending_approval = db.query(models.Approval).filter(
            models.Approval.agent_run_id == agent_run.id,
            models.Approval.status == "pending"
        ).first()
        if not pending_approval:
            tools.create_approval(
                db,
                agent_run.id,
                action_type="crisis_response",
                payload={"delay_mins": 40, "message": "Manager review required before customer-facing crisis changes."},
                reason="Crisis/high-risk signal requires human approval."
            )

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
