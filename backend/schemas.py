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
    signal_summary: Optional[str] = None
    insight: Optional[str] = None
    impact_analysis: Optional[str] = None
    recommended_actions: List[str] = Field(default_factory=list)
    workplan: List[str] = Field(default_factory=list)
    simulated_execution: Optional[dict] = None
    extracted_facts: List[str] = Field(default_factory=list)
    strategic_advice: Optional[str] = None
    audience_personas: List[dict] = Field(default_factory=list)
    demand_forecast: Optional[dict] = None
    staffing_plan: Optional[dict] = None
    competitor_strategy: Optional[dict] = None
    revenue_projection: Optional[dict] = None
    campaign_plan: Optional[dict] = None
    bundle_recommendations: List[dict] = Field(default_factory=list)
    clarifying_questions: List[str] = Field(default_factory=list)
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

class WeatherContext(BaseModel):
    available: bool
    source: str
    location: str
    summary: str
    risks: List[str] = Field(default_factory=list)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    current: Optional[dict] = None
    daily: Optional[dict] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    fullName: str
    cafeName: Optional[str] = None
    email: str
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    fullName: str
    cafeName: Optional[str] = None
    role: str = "owner"
    phone: Optional[str] = None
    location: Optional[str] = None

class AuthResponse(BaseModel):
    user: UserProfile
    token: str
