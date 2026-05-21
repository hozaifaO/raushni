from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


pytestmark = pytest.mark.api

ADMIN_HEADERS = {"X-User-Role": "ADMIN", "X-User-Email": "admin@raushni.com"}
STAFF_HEADERS = {"X-User-Role": "STAFF", "X-User-Email": "staff@raushni.com"}
GUEST_HEADERS = {"X-User-Role": "GUEST", "X-User-Email": "guest@raushni.com"}


def test_profile_returns_current_session_access() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/account/profile", headers=ADMIN_HEADERS)

    assert response.status_code == 200
    profile = response.json()
    assert profile["user"]["email"] == "admin@raushni.com"
    assert profile["user"]["role"] == "ADMIN"
    assert profile["role"]["is_admin"] is True
    assert "settings:write" in profile["permissions"]


def test_settings_read_and_admin_platform_update() -> None:
    client = TestClient(create_app())

    read_response = client.get("/api/v1/settings", headers=STAFF_HEADERS)
    assert read_response.status_code == 200
    settings = read_response.json()
    assert len(settings["users"]) >= 3
    assert settings["platform"]["receipt_prefix"] == "RSH-DON"

    update_response = client.patch(
        "/api/v1/settings/platform",
        headers=ADMIN_HEADERS,
        json={"support_email": "support@raushni.org", "maintenance_mode": True},
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["support_email"] == "support@raushni.org"
    assert updated["maintenance_mode"] is True


def test_non_admin_cannot_update_settings() -> None:
    client = TestClient(create_app())

    response = client.patch(
        "/api/v1/settings/platform",
        headers=GUEST_HEADERS,
        json={"maintenance_mode": True},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Administrator access is required."


def test_admin_can_update_user_role_and_status() -> None:
    client = TestClient(create_app())

    settings = client.get("/api/v1/settings", headers=ADMIN_HEADERS).json()
    staff_user = next(user for user in settings["users"] if user["role"] == "STAFF")

    response = client.patch(
        f"/api/v1/settings/users/{staff_user['id']}",
        headers=ADMIN_HEADERS,
        json={"role": "GUEST", "status": "suspended"},
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["role"] == "GUEST"
    assert updated["status"] == "suspended"
    assert updated["access_level"] == "read"
