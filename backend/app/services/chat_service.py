from typing import AsyncGenerator
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

from app.models.session import Session
from app.models.message import Message
from app.models.api_config import ApiConfig
from app.utils.security import decrypt_api_key
from app.services.llm_service import stream_chat_completion
from app.config import settings


async def get_session_messages(db: AsyncSession, session_id: int, user_id: int, limit: int = 100) -> list[dict]:
    """Get messages for a session with ownership check."""
    # Verify ownership
    result = await db.execute(
        select(Session).where(Session.id == session_id, Session.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise Exception("Session not found")

    result = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    messages = result.scalars().all()
    return [
        {"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at}
        for m in messages
    ]


async def send_message(
    db: AsyncSession,
    session_id: int,
    user_id: int,
    content: str,
) -> AsyncGenerator[str, None]:
    """Send a message and stream the LLM response.
    
    1. Saves user message to DB
    2. Loads session history
    3. Gets user's API config
    4. Streams LLM response
    5. Saves complete assistant response
    """
    # Verify session ownership
    result = await db.execute(
        select(Session).where(Session.id == session_id, Session.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise Exception("Session not found")

    # Save user message
    user_msg = Message(session_id=session_id, role="user", content=content)
    db.add(user_msg)
    await db.commit()
    await db.refresh(user_msg)

    # Load session history
    result = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
    )
    history = result.scalars().all()
    messages_for_llm = [{"role": m.role, "content": m.content} for m in history]

    # Get API config
    result = await db.execute(
        select(ApiConfig).where(ApiConfig.user_id == user_id)
    )
    api_config = result.scalar_one_or_none()

    # Stream response
    full_response = ""

    if settings.NO_API:
        import asyncio
        import re
        
        mock_text = "### Mocked Response 🛠️\n\n"
        mock_text += "Here is the conversation history I received:\n\n"
        
        for m in messages_for_llm:
            content = m['content']
            # Omit previous mocked responses to prevent exponential text explosion
            if m['role'] == 'assistant' and content.startswith("### Mocked Response"):
                content = "*[Previous mocked response omitted]*"
            
            mock_text += f"- **{m['role'].capitalize()}**: {content}\n"
            
        # Simulate streaming while perfectly preserving newlines and spaces
        tokens = re.findall(r'\S+|\s+', mock_text)
        for token in tokens:
            full_response += token
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
            await asyncio.sleep(0.02)
    else:
        if api_config:
            api_key = decrypt_api_key(api_config.api_key_encrypted)
            base_url = api_config.base_url
            model = api_config.model_name
        elif settings.AI_API_KEY:
            api_key = settings.AI_API_KEY
            base_url = settings.AI_BASE_URL
            model = settings.AI_MODEL
        else:
            raise Exception("No API key configured. Please set up your API key in Settings.")
            
        async for token in stream_chat_completion(base_url, api_key, model, messages_for_llm):
            full_response += token
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

    # Save assistant message
    assistant_msg = Message(session_id=session_id, role="assistant", content=full_response)
    db.add(assistant_msg)

    # Update session timestamp
    session.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(assistant_msg)

    yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id})}\n\n"
