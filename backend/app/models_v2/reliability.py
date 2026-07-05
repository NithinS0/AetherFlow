from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class SystemEvent(Base, TimestampMixin):
    __tablename__ = "system_events"
    event_type = Column(String, index=True)
    severity = Column(String)
    payload = Column(JSON)

class RecoveryEvent(Base, TimestampMixin):
    __tablename__ = "recovery_events"
    event_id = Column(UUID(as_uuid=True), ForeignKey("system_events.id", ondelete="CASCADE"))
    recovery_action = Column(String)
    status = Column(String)

class FailureHistory(Base, TimestampMixin):
    __tablename__ = "failure_history"
    component = Column(String)
    error_message = Column(String)

class RecoveryHistory(Base, TimestampMixin):
    __tablename__ = "recovery_history"
    component = Column(String)
    time_to_recover_ms = Column(String)

class ChaosRun(Base, TimestampMixin):
    __tablename__ = "chaos_runs"
    scenario = Column(String)
    status = Column(String)
    
    results = relationship("ChaosResult", back_populates="run", cascade="all, delete-orphan")

class ChaosResult(Base, TimestampMixin):
    __tablename__ = "chaos_results"
    run_id = Column(UUID(as_uuid=True), ForeignKey("chaos_runs.id", ondelete="CASCADE"))
    findings = Column(JSON)
    
    run = relationship("ChaosRun", back_populates="results")

class SystemMetric(Base, TimestampMixin):
    __tablename__ = "system_metrics"
    metric_name = Column(String, index=True)
    value = Column(String)
