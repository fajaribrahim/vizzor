from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings


def create_access_token(
    subject: str,
    roles: list[str],
    expires_delta: timedelta,
) -> str:
    expires_at = datetime.now(timezone.utc) + expires_delta
    payload = {
        "sub": subject,
        "roles": roles,
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

