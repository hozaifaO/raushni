from __future__ import annotations

import json
import logging
from typing import Any, cast

from redis.asyncio import Redis

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)

# Redis is required for SlowAPI rate limits + health. cache_* helpers below are
# available for deliberate future caching — do not sprinkle get-by-id caches by default.

_redis: Redis | None = None


async def init_redis(settings: Settings | None = None) -> Redis:
    global _redis
    cfg = settings or get_settings()
    client = cast(Redis, Redis.from_url(cfg.redis_url, decode_responses=True))
    _redis = client
    return client


def get_redis_client() -> Redis:
    if _redis is None:
        raise RuntimeError(
            "Redis client is not initialized. Call init_redis() during app startup."
        )
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
    _redis = None


async def check_redis() -> bool:
    try:
        client = get_redis_client()
    except RuntimeError:
        return False
    try:
        return bool(await client.ping())
    except Exception:
        return False


async def cache_get_json(key: str) -> dict[str, Any] | None:
    try:
        client = get_redis_client()
        raw = await client.get(key)
    except Exception as exc:
        logger.warning("Redis GET failed for %s: %s", key, exc)
        return None
    if raw is None:
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


async def cache_set_json(key: str, value: dict[str, Any], ttl_seconds: int) -> None:
    try:
        client = get_redis_client()
        await client.set(key, json.dumps(value, default=str), ex=ttl_seconds)
    except Exception as exc:
        logger.warning("Redis SET failed for %s: %s", key, exc)


async def cache_delete(key: str) -> None:
    try:
        client = get_redis_client()
        await client.delete(key)
    except Exception as exc:
        logger.warning("Redis DELETE failed for %s: %s", key, exc)
