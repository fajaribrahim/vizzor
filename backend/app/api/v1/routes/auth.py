from datetime import timedelta

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, TokenResponse, UserProfile

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    if payload.email != "admin@vizzor.local" or payload.password != "vizzor":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    expires_delta = timedelta(minutes=settings.jwt_expires_minutes)
    access_token = create_access_token(
        subject=payload.email,
        roles=["admin"],
        expires_delta=expires_delta,
    )

    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserProfile)
async def me() -> UserProfile:
    return UserProfile(
        email="admin@vizzor.local",
        name="Vizzor Admin",
        roles=["admin"],
    )

