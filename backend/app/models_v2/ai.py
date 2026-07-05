from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class AiAgent(Base, TimestampMixin):
    __tablename__ = "ai_agents"
    name = Column(String, unique=True, index=True)
    purpose = Column(String)
    
    activity = relationship("AgentActivity", back_populates="agent", cascade="all, delete-orphan")

class AgentActivity(Base, TimestampMixin):
    __tablename__ = "agent_activity"
    agent_id = Column(UUID(as_uuid=True), ForeignKey("ai_agents.id", ondelete="CASCADE"))
    action = Column(String)
    
    agent = relationship("AiAgent", back_populates="activity")

class AiConversation(Base, TimestampMixin):
    __tablename__ = "ai_conversations"
    title = Column(String)
    
    messages = relationship("AiMessage", back_populates="conversation", cascade="all, delete-orphan")

class AiMessage(Base, TimestampMixin):
    __tablename__ = "ai_messages"
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE"))
    role = Column(String) # user, assistant
    content = Column(String)
    
    conversation = relationship("AiConversation", back_populates="messages")

class AiRecommendation(Base, TimestampMixin):
    __tablename__ = "ai_recommendations"
    context_type = Column(String) # incident, job
    context_id = Column(UUID(as_uuid=True))
    suggestion = Column(String)
    
    approvals = relationship("AiApproval", back_populates="recommendation", cascade="all, delete-orphan")

class AiApproval(Base, TimestampMixin):
    __tablename__ = "ai_approvals"
    recommendation_id = Column(UUID(as_uuid=True), ForeignKey("ai_recommendations.id", ondelete="CASCADE"))
    status = Column(String) # pending, approved, rejected
    
    recommendation = relationship("AiRecommendation", back_populates="approvals")

class AiReport(Base, TimestampMixin):
    __tablename__ = "ai_reports"
    report_type = Column(String)
    content = Column(JSON)
