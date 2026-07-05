from sqlalchemy import Column, String, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

channel_members = Table(
    "channel_members",
    Base.metadata,
    Column("channel_id", UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)

incident_assignments = Table(
    "incident_assignments",
    Base.metadata,
    Column("incident_id", UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)

class Channel(Base, TimestampMixin):
    __tablename__ = "channels"
    name = Column(String)
    
    messages = relationship("Message", back_populates="channel", cascade="all, delete-orphan")

class Message(Base, TimestampMixin):
    __tablename__ = "messages"
    channel_id = Column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"))
    content = Column(String)
    
    channel = relationship("Channel", back_populates="messages")
    threads = relationship("MessageThread", back_populates="parent_message", cascade="all, delete-orphan")

class MessageThread(Base, TimestampMixin):
    __tablename__ = "message_threads"
    parent_message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"))
    content = Column(String)
    
    parent_message = relationship("Message", back_populates="threads")

class Incident(Base, TimestampMixin):
    __tablename__ = "incidents"
    title = Column(String)
    status = Column(String, index=True) # open, investigating, resolved
    
    comments = relationship("IncidentComment", back_populates="incident", cascade="all, delete-orphan")
    timeline = relationship("IncidentTimeline", back_populates="incident", cascade="all, delete-orphan")

class IncidentComment(Base, TimestampMixin):
    __tablename__ = "incident_comments"
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"))
    content = Column(String)
    
    incident = relationship("Incident", back_populates="comments")

class IncidentTimeline(Base, TimestampMixin):
    __tablename__ = "incident_timeline"
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"))
    event_description = Column(String)
    
    incident = relationship("Incident", back_populates="timeline")
