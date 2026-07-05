from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
import hashlib
import secrets
from datetime import datetime

from app.database import get_db
from app.models import ApiKey

# For securing external API access
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(
    api_key_header: str = Security(api_key_header),
    db: AsyncSession = Depends(get_db)
):
    """
    Middleware dependency to validate X-API-Key headers.
    Used to protect external programmatic routes.
    """
    if not api_key_header:
        raise HTTPException(status_code=401, detail="Missing API Key header")
    
    # Hash the provided key to compare with the DB
    key_hash = hashlib.sha256(api_key_header.encode()).hexdigest()
    
    result = await db.execute(select(ApiKey).where(ApiKey.key_hash == key_hash))
    api_key_record = result.scalar_one_or_none()
    
    if not api_key_record:
        raise HTTPException(status_code=401, detail="Invalid API Key")
        
    if api_key_record.is_revoked:
        raise HTTPException(status_code=401, detail="API Key has been revoked")
        
    if api_key_record.expires_at and api_key_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="API Key has expired")
        
    # Update last used timestamp
    api_key_record.last_used_at = datetime.utcnow()
    await db.commit()
    
    return api_key_record
