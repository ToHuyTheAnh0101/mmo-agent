from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, RefreshResponse
from app.services.auth_service import register_user, login_user, refresh_access_token

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    return await register_user(db, request.email, request.password)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with existing credentials."""
    return await login_user(db, request.email, request.password)


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(request: RefreshRequest):
    """Refresh an expired access token."""
    return await refresh_access_token(request.refresh_token)
