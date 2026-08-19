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
    testing = settings.environment.lower() in {"testing", "test"}
    return Limiter(
        key_func=client_ip,
        default_limits=[] if testing else [settings.rate_limit_default],
        storage_uri="memory://" if testing else settings.redis_url,
        headers_enabled=not testing,
        enabled=not testing,
    )


limiter = _build_limiter()
