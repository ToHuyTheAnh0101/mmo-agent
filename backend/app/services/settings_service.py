from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.api_config import ApiConfig
from app.utils.security import encrypt_api_key, decrypt_api_key


async def get_user_settings(db: AsyncSession, user_id: int) -> dict:
    """Get user's API configuration. Never returns the plaintext API key."""
    result = await db.execute(
        select(ApiConfig).where(ApiConfig.user_id == user_id)
    )
    config = result.scalar_one_or_none()

    if not config:
        return {
            "has_api_key": False,
            "base_url": "https://api.openai.com/v1",
            "model_name": "gpt-4",
            "updated_at": None,
        }

    return {
        "has_api_key": True,
        "base_url": config.base_url,
        "model_name": config.model_name,
        "updated_at": config.updated_at,
    }


async def update_user_settings(
    db: AsyncSession,
    user_id: int,
    api_key: str = None,
    base_url: str = None,
    model_name: str = None,
) -> dict:
    """Create or update user's API configuration."""
    result = await db.execute(
        select(ApiConfig).where(ApiConfig.user_id == user_id)
    )
    config = result.scalar_one_or_none()

    if not config:
        if not api_key:
            raise Exception("API key is required for initial setup")
        config = ApiConfig(
            user_id=user_id,
            api_key_encrypted=encrypt_api_key(api_key),
            base_url=base_url or "https://api.openai.com/v1",
            model_name=model_name or "gpt-4",
        )
        db.add(config)
    else:
        if api_key:
            config.api_key_encrypted = encrypt_api_key(api_key)
        if base_url is not None:
            config.base_url = base_url
        if model_name is not None:
            config.model_name = model_name

    await db.flush()
    await db.refresh(config)

    return {
        "has_api_key": True,
        "base_url": config.base_url,
        "model_name": config.model_name,
        "updated_at": config.updated_at,
    }


async def get_decrypted_api_key(db: AsyncSession, user_id: int) -> str | None:
    """Get the decrypted API key for making LLM calls."""
    result = await db.execute(
        select(ApiConfig).where(ApiConfig.user_id == user_id)
    )
    config = result.scalar_one_or_none()
    if not config:
        return None
    return decrypt_api_key(config.api_key_encrypted)
