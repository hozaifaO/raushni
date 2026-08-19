from __future__ import annotations

import asyncio
import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Defaults for local Docker Desktop Postgres/Redis.
os.environ.setdefault("OTEL_SDK_DISABLED", "true")
os.environ.setdefault("ENVIRONMENT", "testing")
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/raushni_backend",
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("ALEMBIC_AUTO_UPGRADE", "true")
os.environ.setdefault("REQUIRE_AUTH", "false")
os.environ.setdefault("DEFAULT_TENANT_SLUG", "raushni")
os.environ["INTERNAL_API_KEY"] = "test-internal-api-key-32chars-ok!!"
os.environ["CMS_API_TOKEN"] = "test-cms-api-token-32chars-ok!!!!!"

from app.core.config import get_settings

get_settings.cache_clear()

from app.main import create_app

API_KEY = os.environ["INTERNAL_API_KEY"]
ADMIN_HEADERS = {
    "X-API-Key": API_KEY,
    "X-User-Role": "ADMIN",
    "X-User-Email": "admin@raushni.com",
    "X-Tenant-Slug": "raushni",
}
GUEST_HEADERS = {
    "X-API-Key": API_KEY,
    "X-User-Role": "GUEST",
    "X-User-Email": "guest@raushni.com",
    "X-Tenant-Slug": "raushni",
}
STAFF_HEADERS = {
    "X-API-Key": API_KEY,
    "X-User-Role": "STAFF",
    "X-User-Email": "staff@raushni.com",
    "X-Tenant-Slug": "raushni",
}

_TRUNCATE_SQL = """
TRUNCATE TABLE
  internship_certificates,
  internship_applications,
  internship_announcements,
  internship_counters,
  campaign_donations,
  campaigns,
  projects,
  simple_records,
  designations,
  platform_settings,
  donation_status_events,
  donations,
  receipt_counters,
  members
RESTART IDENTITY CASCADE
"""

_ENSURE_MEMBERSHIPS_SQL = """
INSERT INTO organization_memberships (id, organization_id, email, role)
SELECT gen_random_uuid(), o.id, CAST(:member_email AS text), CAST(:member_role AS text)
FROM organizations o
WHERE o.slug = 'raushni'
  AND NOT EXISTS (
    SELECT 1 FROM organization_memberships m
    WHERE m.organization_id = o.id AND m.email = CAST(:member_email AS text)
  )
"""


async def _truncate_async() -> None:
    settings = get_settings()
    engine = create_async_engine(settings.async_database_url)
    async with engine.begin() as conn:
        await conn.execute(text(_TRUNCATE_SQL))
        for email, role in (
            ("admin@raushni.com", "ADMIN"),
            ("staff@raushni.com", "STAFF"),
        ):
            await conn.execute(
                text(_ENSURE_MEMBERSHIPS_SQL),
                {"member_email": email, "member_role": role},
            )
    await engine.dispose()


def _truncate_operational_tables() -> None:
    asyncio.run(_truncate_async())


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    get_settings.cache_clear()
    with TestClient(create_app()) as test_client:
        _truncate_operational_tables()
        yield test_client
