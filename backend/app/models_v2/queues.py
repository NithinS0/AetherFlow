from sqlalchemy import Column, String, ForeignKey, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Queue(Base, TimestampMixin):
    __tablename__ = "queues"
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    name = Column(String, nullable=False)
    
    # Relationships
    labels = relationship("QueueLabel", back_populates="queue", cascade="all, delete-orphan")
    tags = relationship("QueueTag", back_populates="queue", cascade="all, delete-orphan")
    health = relationship("QueueHealth", back_populates="queue", uselist=False, cascade="all, delete-orphan")
    retry_policies = relationship("RetryPolicy", back_populates="queue", cascade="all, delete-orphan")

class QueueTemplate(Base, TimestampMixin):
    __tablename__ = "queue_templates"
    name = Column(String, nullable=False, unique=True)
    default_config = Column(JSON)

class QueueLabel(Base, TimestampMixin):
    __tablename__ = "queue_labels"
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"))
    key = Column(String, nullable=False)
    value = Column(String, nullable=False)
    
    queue = relationship("Queue", back_populates="labels")

class QueueTag(Base, TimestampMixin):
    __tablename__ = "queue_tags"
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"))
    tag = Column(String, nullable=False)
    
    queue = relationship("Queue", back_populates="tags")

class QueueHealth(Base, TimestampMixin):
    __tablename__ = "queue_health"
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"), unique=True)
    status = Column(String) # healthy, degraded, stalled
    
    queue = relationship("Queue", back_populates="health")

class RetryPolicy(Base, TimestampMixin):
    __tablename__ = "retry_policies"
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"))
    max_retries = Column(Integer, default=3)
    backoff_multiplier = Column(Integer, default=2)
    
    queue = relationship("Queue", back_populates="retry_policies")
