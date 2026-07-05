from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    role: Optional[str] = "Viewer"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Forgot Password Schemas
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# Permission Schemas
class PermissionResponse(BaseModel):
    id: UUID
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# Role Schemas
class RoleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True

# Organization Schemas
class OrganizationBase(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None

class OrganizationResponse(OrganizationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Member Invitation Schemas
class OrganizationInvite(BaseModel):
    email: EmailStr
    role_name: str = "Viewer" # Administrator, Operator, Viewer

# Team Schemas
class TeamBase(BaseModel):
    name: str
    team_lead_id: Optional[UUID] = None

class TeamCreate(TeamBase):
    organization_id: UUID

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    team_lead_id: Optional[UUID] = None

class TeamResponse(TeamBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    tags: Optional[List[str]] = None

class ProjectCreate(ProjectBase):
    organization_id: UUID

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_archived: Optional[bool] = None

class ProjectResponse(ProjectBase):
    id: UUID
    organization_id: UUID
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Project Member Assignment Schema
class ProjectMemberAssign(BaseModel):
    user_id: UUID
    role_id: UUID

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    action: str
    entity_type: str
    entity_id: str
    ip_address: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Setting Schemas
class SettingResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    settings_json: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SettingUpdate(BaseModel):
    settings_json: Dict[str, Any]
