from __future__ import annotations

from datetime import datetime

import pytest
from fastapi.testclient import TestClient


pytestmark = pytest.mark.e2e


def parse_iso_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def test_public_api_smoke_workflow(client: TestClient) -> None:
    health = client.get("/health")
    assert health.status_code == 200
    assert parse_iso_timestamp(health.json()["timestamp"]).tzinfo is not None

    api_root = client.get("/api")
    assert api_root.status_code == 200
    assert "GET /health" in api_root.json()["endpoints"]

    missing_route = client.get("/does-not-exist")
    assert missing_route.status_code == 404
