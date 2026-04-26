from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user
from app.schemas.settings import SettingsUpdate, SettingsResponse
from app.services.settings_service import get_user_settings, update_user_settings

router = APIRouter()


@router.get("", response_model=SettingsResponse)
async def get_settings(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's API configuration."""
    return await get_user_settings(db, user.id)


@router.put("", response_model=SettingsResponse)
async def update_settings(
    request: SettingsUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create or update API configuration."""
    try:
        return await update_user_settings(
            db, user.id,
            api_key=request.api_key,
            base_url=request.base_url,
            model_name=request.model_name,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
