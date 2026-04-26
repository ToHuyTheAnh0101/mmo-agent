from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone

from app.models.session import Session
from app.models.message import Message


async def create_session(db: AsyncSession, user_id: int, name: str = "New Chat") -> dict:
    """Create a new chat session for a user."""
    session = Session(user_id=user_id, name=name)
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return _session_to_dict(session, 0)


async def list_user_sessions(db: AsyncSession, user_id: int) -> list[dict]:
    """List all sessions for a user, ordered by updated_at DESC."""
    stmt = (
        select(Session, func.count(Message.id).label("message_count"))
        .outerjoin(Message, Message.session_id == Session.id)
        .where(Session.user_id == user_id)
        .group_by(Session.id)
        .order_by(Session.updated_at.desc())
    )
    result = await db.execute(stmt)
    return [_session_to_dict(row.Session, row.message_count) for row in result]


async def get_session(db: AsyncSession, session_id: int, user_id: int) -> Session:
    """Get a session by ID with ownership check."""
    result = await db.execute(
        select(Session).where(Session.id == session_id, Session.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


async def rename_session(db: AsyncSession, session_id: int, user_id: int, name: str) -> dict:
    """Rename a session."""
    session = await get_session(db, session_id, user_id)
    session.name = name
    session.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(session)

    # Get message count
    count_result = await db.execute(
        select(func.count(Message.id)).where(Message.session_id == session_id)
    )
    msg_count = count_result.scalar() or 0
    return _session_to_dict(session, msg_count)


async def delete_session(db: AsyncSession, session_id: int, user_id: int) -> None:
    """Delete a session and all its messages."""
    session = await get_session(db, session_id, user_id)
    await db.delete(session)


def _session_to_dict(session: Session, message_count: int) -> dict:
    return {
        "id": session.id,
        "name": session.name,
        "created_at": session.created_at,
        "updated_at": session.updated_at,
        "message_count": message_count,
    }
