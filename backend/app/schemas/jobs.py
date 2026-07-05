from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID

class JobCreateSchema(BaseModel):
    queue_id: UUID
    payload: Dict[str, Any]
    metadata_info: Optional[Dict[str, Any]] = None

class JobResponseSchema(BaseModel):
    id: UUID
    queue_id: UUID
    status: str
    retry_count: int
    
    model_config = ConfigDict(from_attributes=True)
