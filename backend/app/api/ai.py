from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.models import User
from app.schemas.schemas import AIApproval, AIChatRequest
from app.services.ai_service import AIService
from app.api.deps import get_current_user, get_operator_user
from app.api.common import ok


router = APIRouter()

@router.post("/opsgpt/chat")
async def opsgpt_chat(
    chat_req: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    history = chat_req.context.get("history", []) if chat_req.context else []
    reply = await AIService.run_ops_chat(history, chat_req.message)
    return ok({"reply": reply}, "Chat response generated.")

@router.post("/opsgpt/approve-action")
async def approve_ops_action(
    approval: AIApproval,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_operator_user)
):
    # Execute the action
    success = await AIService.execute_approved_action(
        db,
        action=approval.action,
        parameters=approval.parameters or {},
        incident_id=approval.incident_id,
        user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to execute operational action")
    return ok({"action": approval.action}, f"Operational action '{approval.action}' executed successfully.")

