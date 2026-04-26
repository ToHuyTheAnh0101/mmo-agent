from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user
from app.schemas.message import ChatRequest, MessageResponse
from app.services.chat_service import send_message, get_session_messages

router = APIRouter()


@router.post("/{session_id}")
async def chat(
    session_id: int,
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and receive streaming LLM response via SSE."""
    if not request.message.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty")

    try:
        return StreamingResponse(
            send_message(db, session_id, user.id, request.message),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "No API key" in error_msg:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=error_msg)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=error_msg)


@router.get("/{session_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    session_id: int,
    limit: int = 100,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all messages for a session."""
    try:
        return await get_session_messages(db, session_id, user.id, limit)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
