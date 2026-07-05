from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid
from app.database.session import get_db
from app.models import AIConversation, AIMessage, User, AIActivity
from app.dependencies.auth import get_current_user
from app.ai.langgraph_orchestrator import LangGraphOrchestrator
from app.api.common import PaginationParams, FilterParams, ok, created, paginated
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter()


# Schema structures
class AIConversationOut(BaseModel):
    id: UUID
    title: str
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIMessageOut(BaseModel):
    id: UUID
    conversation_id: UUID
    sender: str
    content: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

# --- API Endpoints ---

@router.post("/chat/conversations", status_code=status.HTTP_201_CREATED)
async def create_conversation(
    title: str = Body("New Chat", embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = AIConversation(
        id=uuid.uuid4(),
        title=title,
        user_id=current_user.id
    )
    db.add(conv)
    
    act = AIActivity(
        action_type="conversation_started",
        details=f"User started chat session: {title}",
        timestamp=datetime.utcnow()
    )
    db.add(act)
    
    await db.commit()
    return created(AIConversationOut.model_validate(conv).model_dump(mode="json"), "Conversation created.")

@router.get("/chat/conversations")
async def list_conversations(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(AIConversation).filter(AIConversation.user_id == current_user.id)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(AIConversation.updated_at.desc()).offset(pagination.offset).limit(pagination.limit))
    convs = res.scalars().all()
    data = [AIConversationOut.model_validate(c).model_dump(mode="json") for c in convs]
    return paginated(data, total, pagination, "Conversations retrieved.")

@router.get("/chat/conversations/{conv_id}/messages")
async def get_messages(
    conv_id: UUID,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AIMessage).filter(AIMessage.conversation_id == conv_id)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(AIMessage.timestamp.asc()).offset(pagination.offset).limit(pagination.limit))
    msgs = res.scalars().all()
    data = [AIMessageOut.model_validate(m).model_dump(mode="json") for m in msgs]
    return paginated(data, total, pagination, "Messages retrieved.")

@router.post("/chat/conversations/{conv_id}/messages", status_code=status.HTTP_201_CREATED)
async def send_message(

    conv_id: UUID,
    content: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save User message
    user_msg = AIMessage(
        id=uuid.uuid4(),
        conversation_id=conv_id,
        sender="user",
        content=content,
        timestamp=datetime.utcnow()
    )
    db.add(user_msg)
    await db.flush()

    # Process orchestrator reply
    reply_content = await LangGraphOrchestrator.process_user_query(db, content)
    
    ai_msg = AIMessage(
        id=uuid.uuid4(),
        conversation_id=conv_id,
        sender="assistant",
        content=reply_content,
        timestamp=datetime.utcnow()
    )
    db.add(ai_msg)
    
    # Update conversation title to first user message context
    conv_res = await db.execute(select(AIConversation).filter(AIConversation.id == conv_id))
    conv = conv_res.scalars().first()
    if conv and conv.title == "New Chat":
        conv.title = content[:25] + "..." if len(content) > 25 else content
        
    await db.commit()
    return created(AIMessageOut.model_validate(ai_msg).model_dump(mode="json"), "Message sent and processed.")
