from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_app
from tests.conftest import ADMIN_HEADERS, API_KEY

pytestmark = [pytest.mark.api]


def test_forged_admin_role_without_api_key_rejected_when_auth_required() -> None:
    os.environ["REQUIRE_AUTH"] = "true"
    os.environ["INTERNAL_API_KEY"] = API_KEY
    os.environ["CMS_API_TOKEN"] = "z" * 32
    os.environ["ENVIRONMENT"] = "development"
    get_settings.cache_clear()
    try:
        with TestClient(create_app()) as client:
            response = client.post(
                "/api/v1/members",
                headers={
                    "X-User-Role": "ADMIN",
                    "Content-Type": "application/json",
                },
                json={
                    "full_name": "Forged Admin",
                    "email": "forged@example.org",
                    "phone": "+919876543210",
                    "role": "Volunteer",
                },
            )
            assert response.status_code == 401
            assert "API key" in response.json()["detail"]
    finally:
        os.environ["REQUIRE_AUTH"] = "false"
        os.environ.pop("CMS_API_TOKEN", None)
        get_settings.cache_clear()


def test_valid_key_with_guest_cannot_write(client: TestClient) -> None:
    os.environ["REQUIRE_AUTH"] = "true"
    os.environ["INTERNAL_API_KEY"] = API_KEY
    os.environ["CMS_API_TOKEN"] = "z" * 32
    os.environ["ENVIRONMENT"] = "development"
    get_settings.cache_clear()
    try:
        with TestClient(create_app()) as auth_client:
            response = auth_client.post(
                "/api/v1/members",
                headers={
                    "X-API-Key": API_KEY,
                    "X-User-Role": "GUEST",
                    "Content-Type": "application/json",
                },
                json={
                    "full_name": "Guest Attempt",
                    "email": "guest-write@example.org",
                    "phone": "+919876543211",
                    "role": "Volunteer",
                },
            )
            assert response.status_code == 403
    finally:
        os.environ["REQUIRE_AUTH"] = "false"
        os.environ.pop("CMS_API_TOKEN", None)
        get_settings.cache_clear()


def test_valid_key_with_admin_can_write(client: TestClient) -> None:
    response = client.post(
        "/api/v1/members",
        headers={**ADMIN_HEADERS, "Content-Type": "application/json"},
        json={
            "full_name": "Keyed Admin",
            "email": "keyed-admin@example.org",
            "phone": "+919876543212",
            "role": "Volunteer",
            "status": "active",
            "joined_on": "2026-07-15",
        },
    )
    assert response.status_code == 201
    assert response.json()["full_name"] == "Keyed Admin"
