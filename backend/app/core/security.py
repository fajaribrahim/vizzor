from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import settings


def create_access_token(
    subject: str,
    roles: list[str],
    expires_delta: timedelta,
) -> str:
    issued_at = datetime.now(UTC)
    expires_at = issued_at + expires_delta
    payload = {
        "sub": subject,
        "roles": roles,
        "exp": expires_at,
        "iat": issued_at,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
