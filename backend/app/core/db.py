from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import Settings, get_settings

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def init_db(settings: Settings | None = None) -> AsyncEngine:
    """Create the global async engine and session factory."""
    global _engine, _session_factory

    cfg = settings or get_settings()
    connect_args = cfg.database_connect_args
    _engine = create_async_engine(
        cfg.async_database_url_for_engine,
        pool_pre_ping=True,
        future=True,
        connect_args=connect_args,
    )
    _session_factory = async_sessionmaker(
        _engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    return _engine


def get_engine() -> AsyncEngine:
    if _engine is None:
        raise RuntimeError("Database engine is not initialized. Call init_db() during app startup.")
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    if _session_factory is None:
        raise RuntimeError("Session factory is not initialized. Call init_db() during app startup.")
    return _session_factory


async def dispose_db() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a session and commits on success."""
    session = get_session_factory()()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


async def check_db() -> bool:
    """Return True when Postgres answers SELECT 1."""
    try:
        engine = get_engine()
    except RuntimeError:
        return False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def run_alembic_upgrade(database_url: str | None = None) -> None:
    """Apply Alembic migrations to head (sync; call from lifespan)."""
    from pathlib import Path

    from alembic import command
    from alembic.config import Config

    backend_root = Path(__file__).resolve().parents[2]
    alembic_ini = backend_root / "alembic.ini"
    cfg = Config(str(alembic_ini))
    if database_url:
        cfg.set_main_option("sqlalchemy.url", database_url)
    command.upgrade(cfg, "head")


def alembic_sync_url(async_url: str) -> str:
    """Alembic env often prefers a sync-looking URL; we still use asyncpg via env.py."""
    return async_url
