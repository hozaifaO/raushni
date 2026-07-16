from __future__ import annotations

import asyncio
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import get_settings
from app.core.db import dispose_db, init_db, run_alembic_upgrade
from app.core.redis import close_redis, init_redis

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    settings = get_settings()
    settings.validate_runtime_secrets()

    engine = init_db(settings)
    await init_redis(settings)

    from app.core.telemetry import instrument_data_clients

    instrument_data_clients(engine)

    if settings.alembic_auto_upgrade:
        logger.info("Running Alembic upgrade head")
        # Alembic's async env uses asyncio.run(); run in a worker thread.
        await asyncio.to_thread(run_alembic_upgrade, settings.async_database_url)

    yield

    await close_redis()
    await dispose_db()
