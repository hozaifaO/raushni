from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

pytestmark = [pytest.mark.api, pytest.mark.db]


def test_health_liveness(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["service"] == "raushni-backend"


def test_health_ready_reports_db_and_redis(client: TestClient) -> None:
    response = client.get("/health/ready")
    assert response.status_code == 200
    body = response.json()
    assert body["database"] == "ok"
    assert body["redis"] in {"ok", "error"}
    assert body["status"] in {"ready", "degraded"}
