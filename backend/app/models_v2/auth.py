from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_super_admin = Column(Boolean, default=False)
    
    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    login_history = relationship("LoginHistory", back_populates="user")
    user_profiles = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    bio = Column(String, nullable=True)
    location = Column(String, nullable=True)
    
    user = relationship("User", back_populates="user_profiles")

class Session(Base, TimestampMixin):
    __tablename__ = "sessions"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    
    user = relationship("User", back_populates="sessions")

class ApiKey(Base, TimestampMixin):
    __tablename__ = "api_keys"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    key_hash = Column(String, unique=True, index=True)
    name = Column(String)
    key_prefix = Column(String, nullable=True)
    permissions = Column(String, default="read")
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_revoked = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="api_keys")

class PasswordResetToken(Base, TimestampMixin):
    __tablename__ = "password_reset_tokens"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)

class LoginHistory(Base, TimestampMixin):
    __tablename__ = "login_history"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    ip_address = Column(String)
    user_agent = Column(String)
    status = Column(String) # success, failed
    
    user = relationship("User", back_populates="login_history")
