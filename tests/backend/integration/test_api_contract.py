from __future__ import annotations

from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from app.main import APP_NAME, APP_VERSION


pytestmark = pytest.mark.integration


def parse_iso_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def test_health_endpoint_returns_operational_payload(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "healthy"
    assert payload["service"] == "raushni-backend"
    assert payload["version"] == APP_VERSION
    assert parse_iso_timestamp(payload["timestamp"]).tzinfo is not None


def test_ready_endpoint_reports_database(client: TestClient) -> None:
    response = client.get("/health/ready")
    assert response.status_code == 200
    payload = response.json()
    assert payload["database"] == "ok"
    assert payload["status"] in {"ready", "degraded"}
    assert "redis" in payload


def test_api_root_returns_discoverable_contract(client: TestClient) -> None:
    response = client.get("/api")

    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == APP_NAME
    assert payload["version"] == APP_VERSION
    assert payload["status"] == "running"
    assert "GET /health" in payload["endpoints"]
    assert "GET /health/ready" in payload["endpoints"]
    assert "GET /api" in payload["endpoints"]
    assert "GET /api/v1/dashboard/status" in payload["endpoints"]


def test_cors_preflight_allows_browser_clients(client: TestClient) -> None:
    response = client.options(
        "/api",
        headers={
            "Origin": "https://example.com",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://example.com"
    assert "GET" in response.headers["access-control-allow-methods"]
