from sqlalchemy import Boolean, Column, Float, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    base_price = Column(Float)
    current_price = Column(Float)
    is_available = Column(Boolean, default=True)
    is_promoted = Column(Boolean, default=False)
    stock_level = Column(Integer, default=100)
    margin_pct = Column(Float)
    prep_time_min = Column(Integer)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class SignalEvent(Base):
    __tablename__ = "signal_events"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    source_type = Column(String)
    raw_text = Column(Text)
    status = Column(String, default="pending", index=True)
    confidence = Column(Float, nullable=True)
    impact_score = Column(Integer, nullable=True)

class AgentRun(Base):
    __tablename__ = "agent_runs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    signal_event_id = Column(Integer, index=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    final_decision = Column(Text, nullable=True)
    requires_approval = Column(Boolean, default=False)
    status = Column(String, default="running") # running, completed, requires_approval, failed, partial
    revenue_impact_estimate = Column(Float, nullable=True)
    before_state_json = Column(Text, nullable=True)
    after_state_json = Column(Text, nullable=True)

class AgentTrace(Base):
    __tablename__ = "agent_trace"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    agent_run_id = Column(Integer, index=True)
    step = Column(String)
    message = Column(Text)
    tool_name = Column(String, nullable=True)
    tool_input_json = Column(Text, nullable=True)
    tool_output_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    agent_run_id = Column(Integer, index=True)
    action_type = Column(String)
    payload_json = Column(Text)
    reason = Column(Text)
    status = Column(String, default="pending", index=True) # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    agent_run_id = Column(Integer, index=True)
    channel = Column(String)
    recipient = Column(String)
    message = Column(Text)
    status = Column(String, default="sent")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserAccount(Base):
    __tablename__ = "user_accounts"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    cafe_name = Column(String, nullable=True)
    role = Column(String, default="owner")
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuthSession(Base):
    __tablename__ = "auth_sessions"
    token = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserSetting(Base):
    __tablename__ = "user_settings"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, unique=True, index=True)
    notifications_json = Column(Text, nullable=True)
    ai_preferences_json = Column(Text, nullable=True)
    security_json = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
