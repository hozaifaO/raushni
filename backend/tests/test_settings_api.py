from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import ADMIN_HEADERS, GUEST_HEADERS, STAFF_HEADERS


pytestmark = [pytest.mark.api, pytest.mark.db]


def test_profile_returns_current_session_access(client: TestClient) -> None:
    response = client.get("/api/v1/account/profile", headers=ADMIN_HEADERS)

    assert response.status_code == 200
    profile = response.json()
    assert profile["user"]["email"] == "admin@raushni.com"
    assert profile["user"]["role"] == "ADMIN"
    assert profile["role"]["is_admin"] is True
    assert "settings:write" in profile["permissions"]
    assert profile["tenant_slug"] == "raushni"
    assert profile["organization_name"]


def test_settings_platform_persists_across_app_restart(client: TestClient) -> None:
    read_response = client.get("/api/v1/settings", headers=STAFF_HEADERS)
    assert read_response.status_code == 200
    settings = read_response.json()
    assert settings["tenant_slug"] == "raushni"
    assert len(settings["users"]) >= 1
    assert any(user["email"].endswith("@raushni.local") or user["email"].endswith("@raushni.com") for user in settings["users"])
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

    with TestClient(create_app()) as other:
        persisted = other.get("/api/v1/settings", headers=ADMIN_HEADERS)
        assert persisted.status_code == 200
        platform = persisted.json()["platform"]
        assert platform["support_email"] == "support@raushni.org"
        assert platform["maintenance_mode"] is True


def test_non_admin_cannot_update_settings(client: TestClient) -> None:
    response = client.patch(
        "/api/v1/settings/platform",
        headers=STAFF_HEADERS,
        json={"maintenance_mode": True},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Administrator access is required."


def test_guest_without_membership_cannot_update_settings(client: TestClient) -> None:
    response = client.patch(
        "/api/v1/settings/platform",
        headers=GUEST_HEADERS,
        json={"maintenance_mode": True},
    )

    assert response.status_code == 403
    detail = response.json()["detail"].lower()
    assert "not a member" in detail or "administrator" in detail


def test_admin_can_update_user_role_and_status(client: TestClient) -> None:
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

    refreshed = client.get("/api/v1/settings", headers=ADMIN_HEADERS).json()
    member = next(user for user in refreshed["users"] if user["id"] == staff_user["id"])
    assert member["role"] == "GUEST"
    assert member["status"] == "suspended"

    # Restore seeded membership role so later tests keep a STAFF member.
    restore = client.patch(
        f"/api/v1/settings/users/{staff_user['id']}",
        headers=ADMIN_HEADERS,
        json={"role": "STAFF", "status": "active"},
    )
    assert restore.status_code == 200


def test_dashboard_status_includes_organization(client: TestClient) -> None:
    response = client.get("/api/v1/dashboard/status", headers=ADMIN_HEADERS)
    assert response.status_code == 200
    body = response.json()
    assert body["tenant_slug"] == "raushni"
    assert body["organization_name"]
    assert body["organization_id"]
