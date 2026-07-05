from sqlalchemy import Column, String, ForeignKey, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Worker(Base, TimestampMixin):
    __tablename__ = "workers"
    name = Column(String, nullable=False, unique=True)
    status = Column(String, default="offline", index=True) # online, offline, busy, dead
    
    group_id = Column(UUID(as_uuid=True), ForeignKey("worker_groups.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    heartbeats = relationship("WorkerHeartbeat", back_populates="worker", cascade="all, delete-orphan")
    events = relationship("WorkerEvent", back_populates="worker", cascade="all, delete-orphan")
    capabilities = relationship("WorkerCapability", back_populates="worker", cascade="all, delete-orphan")

class WorkerGroup(Base, TimestampMixin):
    __tablename__ = "worker_groups"
    name = Column(String, nullable=False, unique=True)

class WorkerCapability(Base, TimestampMixin):
    __tablename__ = "worker_capabilities"
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"))
    capability_name = Column(String, nullable=False)
    
    worker = relationship("Worker", back_populates="capabilities")

class WorkerHeartbeat(Base, TimestampMixin):
    __tablename__ = "worker_heartbeats"
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"), index=True)
    heartbeat_timestamp = Column(DateTime, index=True)
    metrics = Column(JSON) # CPU, RAM
    
    worker = relationship("Worker", back_populates="heartbeats")

class WorkerEvent(Base, TimestampMixin):
    __tablename__ = "worker_events"
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"))
    event_type = Column(String) # startup, shutdown, crash
    
    worker = relationship("Worker", back_populates="events")
