from __future__ import annotations

from slowapi import Limiter
from starlette.requests import Request

from app.core.config import get_settings


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip() or "unknown"
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _build_limiter() -> Limiter:
    settings = get_settings()
    return Limiter(
        key_func=client_ip,
        default_limits=[settings.rate_limit_default],
        storage_uri=settings.redis_url,
        headers_enabled=True,
    )


limiter = _build_limiter()
