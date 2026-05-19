import json
import os
import urllib.error
import urllib.request
from sqlalchemy.orm import Session
import models

WEBHOOK_TIMEOUT_SECONDS = 6

def post_json(url: str, payload: dict):
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=WEBHOOK_TIMEOUT_SECONDS) as response:
        body = response.read().decode("utf-8", errors="replace")
        return {"status_code": response.status, "body": body[:500]}

def dispatch_external_event(db: Session, run_id: int, event_type: str, payload: dict):
    webhook_url = os.environ.get("MAKE_WEBHOOK_URL")
    if not webhook_url:
        return {"status": "skipped", "reason": "MAKE_WEBHOOK_URL not configured"}

    event_payload = {
        "source": "menumind",
        "event_type": event_type,
        "agent_run_id": run_id,
        "payload": payload,
    }

    try:
        response = post_json(webhook_url, event_payload)
        result = {"status": "sent", "target": "make", **response}
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        result = {"status": "failed", "target": "make", "message": str(exc)}

    log_tool_trace(db, run_id, "make_webhook", event_payload, result)
    return result

def get_menu_state(db: Session) -> dict:
    items = db.query(models.MenuItem).all()
    return {item.id: {
        "name": item.name,
        "price": item.current_price,
        "available": item.is_available,
        "promoted": item.is_promoted,
        "stock": item.stock_level,
        "prep_time": item.prep_time_min
    } for item in items}

def get_item(db: Session, item_id: str):
    return db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()

def log_tool_trace(db: Session, run_id: int, tool_name: str, tool_input: dict, tool_output: dict):
    trace = models.AgentTrace(
        agent_run_id=run_id,
        step="tool_call",
        message=f"Executed tool: {tool_name}",
        tool_name=tool_name,
        tool_input_json=json.dumps(tool_input),
        tool_output_json=json.dumps(tool_output)
    )
    db.add(trace)
    db.commit()

def update_menu_availability(db: Session, run_id: int, item_id: str, available: bool, reason: str):
    item = get_item(db, item_id)
    if not item:
        return {"status": "error", "message": f"Item {item_id} not found."}
    
    item.is_available = bool(available)
    db.commit()
    result = {"status": "success", "item_id": item_id, "available": item.is_available, "reason": reason}
    log_tool_trace(db, run_id, "update_menu_availability", {"item_id": item_id, "available": available}, result)
    return result

def adjust_item_price(db: Session, run_id: int, item_id: str, new_price: float, reason: str):
    item = get_item(db, item_id)
    if not item:
        return {"status": "error", "message": f"Item {item_id} not found."}
    
    if new_price < 0:
        return {"status": "error", "message": "Price cannot be negative."}

    # Price increase above 15% must be converted to approval
    if new_price > item.base_price * 1.15:
        return {"status": "error", "message": "Price increase >15% requires approval."}
        
    item.current_price = float(new_price)
    db.commit()
    result = {"status": "success", "item_id": item_id, "new_price": new_price, "reason": reason}
    log_tool_trace(db, run_id, "adjust_item_price", {"item_id": item_id, "new_price": new_price}, result)
    return result

def set_item_promotion(db: Session, run_id: int, item_id: str, promoted: bool, reason: str):
    item = get_item(db, item_id)
    if not item:
        return {"status": "error", "message": f"Item {item_id} not found."}
    
    item.is_promoted = bool(promoted)
    db.commit()
    result = {"status": "success", "item_id": item_id, "promoted": item.is_promoted, "reason": reason}
    log_tool_trace(db, run_id, "set_item_promotion", {"item_id": item_id, "promoted": promoted}, result)
    return result

def extend_prep_time(db: Session, run_id: int, item_id: str, minutes: int, reason: str):
    item = get_item(db, item_id)
    if not item:
        return {"status": "error", "message": f"Item {item_id} not found."}
    
    try:
        minutes = int(minutes)
    except:
        return {"status": "error", "message": "Minutes must be an integer."}

    if minutes < 0 or minutes > 60:
        return {"status": "error", "message": "Prep time extension bounded between 0 and 60 mins."}

    item.prep_time_min += minutes
    db.commit()
    result = {"status": "success", "item_id": item_id, "new_prep_time": item.prep_time_min, "reason": reason}
    log_tool_trace(db, run_id, "extend_prep_time", {"item_id": item_id, "minutes": minutes}, result)
    return result

def create_approval(db: Session, run_id: int, action_type: str, payload: dict, reason: str):
    approval = models.Approval(
        agent_run_id=run_id,
        action_type=action_type,
        payload_json=json.dumps(payload),
        reason=reason,
        status="pending"
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    result = {"status": "success", "approval_id": approval.id, "reason": reason}
    log_tool_trace(db, run_id, "create_approval", {"action_type": action_type, "payload": payload}, result)
    return result

def send_staff_alert(db: Session, run_id: int, message: str, severity: str):
    notification = models.Notification(
        agent_run_id=run_id,
        channel="slack_staff",
        recipient="kitchen_team",
        message=message,
        status="sent"
    )
    db.add(notification)
    db.commit()
    external = dispatch_external_event(
        db,
        run_id,
        "staff_alert",
        {"channel": "slack_staff", "message": message, "severity": severity},
    )
    result = {"status": "success", "channel": "slack", "message": message, "severity": severity, "external": external}
    log_tool_trace(db, run_id, "send_staff_alert", {"message": message, "severity": severity}, result)
    return result

def create_customer_notice(db: Session, run_id: int, message: str, affected_items: list):
    notification = models.Notification(
        agent_run_id=run_id,
        channel="email_customer",
        recipient="affected_users",
        message=message,
        status="sent"
    )
    db.add(notification)
    db.commit()
    external = dispatch_external_event(
        db,
        run_id,
        "customer_notice",
        {"channel": "customer_notice", "message": message, "affected_items": affected_items},
    )
    result = {"status": "success", "channel": "email", "message": message, "items": affected_items, "external": external}
    log_tool_trace(db, run_id, "create_customer_notice", {"message": message, "affected_items": affected_items}, result)
    return result

def estimate_revenue_impact(db: Session, run_id: int, action_plan: dict):
    projection = action_plan.get("revenue_projection") or {}
    if projection.get("estimated_profit_pkr") is not None:
        result = {
            "estimated_impact": float(projection.get("estimated_profit_pkr") or 0),
            "currency": "PKR",
            "reason": "Strategic intelligence projection based on demand lift, menu fit, stock/prep readiness, and margin proxy.",
            "details": projection,
        }
        log_tool_trace(db, run_id, "estimate_revenue_impact", {"action_plan": action_plan}, result)
        return result

    # Fallback ROI math for older plans without strategic intelligence.
    primary = action_plan.get("primary_action", {})
    if primary:
        tool = primary.get("tool", "")
        if tool == "update_menu_availability" and primary.get("args", {}).get("available") == False:
            impact = -450.0 * 5  # assuming 5 lost orders of 450 PKR
            return {"estimated_impact": impact, "currency": "PKR", "reason": "Lost orders from unavailable item"}
        elif tool == "adjust_item_price":
            price = primary.get("args", {}).get("new_price", 0)
            impact = price * 10
            return {"estimated_impact": impact, "currency": "PKR", "reason": "Estimated sales volume at new price"}
    result = {"estimated_impact": 0.0, "currency": "PKR"}
    log_tool_trace(db, run_id, "estimate_revenue_impact", {"action_plan": action_plan}, result)
    return result

def crisis_response(db: Session, run_id: int, delay_mins: int, message: str):
    notification = models.Notification(
        agent_run_id=run_id,
        channel="all_customers",
        recipient="active_orders",
        message=f"CRISIS RESPONSE ACTIVE: {message}. Estimated delay: {delay_mins} mins.",
        status="sent"
    )
    db.add(notification)
    db.commit()
    external = dispatch_external_event(
        db,
        run_id,
        "crisis_response",
        {"delay_mins": delay_mins, "message": message},
    )
    result = {"status": "success", "action": "crisis_mode_activated", "delay_mins": delay_mins, "message": message, "external": external}
    log_tool_trace(db, run_id, "crisis_response", {"delay_mins": delay_mins, "message": message}, result)
    return result

# Explicit Tool Registry
TOOL_REGISTRY = {
    "update_menu_availability": update_menu_availability,
    "adjust_item_price": adjust_item_price,
    "set_item_promotion": set_item_promotion,
    "extend_prep_time": extend_prep_time,
    "create_approval": create_approval,
    "send_staff_alert": send_staff_alert,
    "create_customer_notice": create_customer_notice,
    "estimate_revenue_impact": estimate_revenue_impact,
    "crisis_response": crisis_response
}
