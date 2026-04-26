from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token


async def register_user(db: AsyncSession, email: str, password: str) -> dict:
    """Register a new user. Returns token response dict."""
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters",
        )

    # Check if email already exists
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(email=email, password_hash=hash_password(password))
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token_data = {"sub": str(user.id)}
    return {
        "id": user.id,
        "email": user.email,
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
    }


async def login_user(db: AsyncSession, email: str, password: str) -> dict:
    """Authenticate user. Returns token response dict."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token_data = {"sub": str(user.id)}
    return {
        "id": user.id,
        "email": user.email,
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
    }


async def refresh_access_token(refresh_token: str) -> dict:
    """Validate refresh token and issue new access token."""
    payload = verify_token(refresh_token, expected_type="refresh")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    token_data = {"sub": payload["sub"]}
    return {
        "access_token": create_access_token(token_data),
        "token_type": "bearer",
    }
