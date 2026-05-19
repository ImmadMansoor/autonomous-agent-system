import json
from sqlalchemy.orm import Session
import models
from pydantic import BaseModel, Field
from typing import List, Dict, Any

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
    result = {"status": "success", "channel": "slack", "message": message, "severity": severity}
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
    result = {"status": "success", "channel": "email", "message": message, "items": affected_items}
    log_tool_trace(db, run_id, "create_customer_notice", {"message": message, "affected_items": affected_items}, result)
    return result

def estimate_revenue_impact(db: Session, run_id: int, action_plan: dict):
    # More believable ROI math
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
    result = {"status": "success", "action": "crisis_mode_activated", "delay_mins": delay_mins, "message": message}
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

# Validation Schemas for Tools
class UpdateMenuAvailabilitySchema(BaseModel):
    item_id: str
    available: bool
    reason: str

class AdjustItemPriceSchema(BaseModel):
    item_id: str
    new_price: float
    reason: str

class SetItemPromotionSchema(BaseModel):
    item_id: str
    promoted: bool
    reason: str

class ExtendPrepTimeSchema(BaseModel):
    item_id: str
    minutes: int
    reason: str

class CreateApprovalSchema(BaseModel):
    action_type: str
    payload: dict
    reason: str

class SendStaffAlertSchema(BaseModel):
    message: str
    severity: str

class CreateCustomerNoticeSchema(BaseModel):
    message: str
    affected_items: List[str]

class EstimateRevenueImpactSchema(BaseModel):
    action_plan: dict

class CrisisResponseSchema(BaseModel):
    delay_mins: int
    message: str

TOOL_SCHEMAS = {
    "update_menu_availability": UpdateMenuAvailabilitySchema,
    "adjust_item_price": AdjustItemPriceSchema,
    "set_item_promotion": SetItemPromotionSchema,
    "extend_prep_time": ExtendPrepTimeSchema,
    "create_approval": CreateApprovalSchema,
    "send_staff_alert": SendStaffAlertSchema,
    "create_customer_notice": CreateCustomerNoticeSchema,
    "estimate_revenue_impact": EstimateRevenueImpactSchema,
    "crisis_response": CrisisResponseSchema
}
