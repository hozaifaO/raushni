from __future__ import annotations

import os
from collections.abc import Generator
from datetime import datetime

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("OTEL_SDK_DISABLED", "true")
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/raushni_backend",
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("ALEMBIC_AUTO_UPGRADE", "true")

from app.core.config import get_settings

get_settings.cache_clear()

from app.main import app, create_app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    with TestClient(create_app()) as test_client:
        yield test_client


def parse_iso_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
