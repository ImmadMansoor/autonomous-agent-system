from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MenuItemBase(BaseModel):
    name: str
    category: str
    base_price: float
    current_price: float
    is_available: bool = True
    is_promoted: bool = False
    stock_level: int
    margin_pct: float
    prep_time_min: int

class MenuItemCreate(MenuItemBase):
    id: str

class MenuItem(MenuItemBase):
    id: str
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class SignalEventCreate(BaseModel):
    source_type: str
    raw_text: str

class SignalEvent(SignalEventCreate):
    id: int
    created_at: datetime
    status: str
    confidence: Optional[float] = None
    impact_score: Optional[int] = None
    class Config:
        from_attributes = True

class PlannedAction(BaseModel):
    tool: str
    args: dict

class AgentPlan(BaseModel):
    confidence: float = Field(..., ge=0.0, le=1.0)
    impact_score: int = Field(..., ge=0, le=10)
    requires_approval: bool
    extracted_facts: List[str] = Field(default_factory=list)
    primary_action: Optional[PlannedAction] = None
    secondary_actions: List[PlannedAction] = Field(default_factory=list)
    reason: str

class AgentTrace(BaseModel):
    id: int
    agent_run_id: int
    step: str
    message: str
    tool_name: Optional[str] = None
    tool_input_json: Optional[str] = None
    tool_output_json: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class AgentRun(BaseModel):
    id: int
    signal_event_id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    final_decision: Optional[str] = None
    requires_approval: bool
    status: str
    revenue_impact_estimate: Optional[float] = None
    before_state_json: Optional[str] = None
    after_state_json: Optional[str] = None
    class Config:
        from_attributes = True

class Approval(BaseModel):
    id: int
    agent_run_id: int
    action_type: str
    payload_json: str
    reason: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class Notification(BaseModel):
    id: int
    agent_run_id: int
    channel: str
    recipient: str
    message: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
