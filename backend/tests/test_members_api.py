from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


pytestmark = pytest.mark.api


def test_member_management_crud_workflow() -> None:
    client = TestClient(create_app())

    create_response = client.post(
        "/api/v1/members",
        json={
            "full_name": "Aisha Khan",
            "email": "aisha@example.org",
            "phone": "+91 9876543210",
            "role": "Volunteer",
            "status": "active",
            "joined_on": "2026-05-17",
            "address": "Hyderabad",
            "emergency_contact": "+91 9000000000",
            "notes": "Weekend education program coordinator",
        },
    )

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["full_name"] == "Aisha Khan"
    assert created["status"] == "active"

    member_id = created["id"]

    list_response = client.get("/api/v1/members", params={"search": "aisha"})
    assert list_response.status_code == 200
    listing = list_response.json()
    assert listing["total"] == 1
    assert listing["active"] == 1
    assert listing["items"][0]["id"] == member_id

    update_response = client.patch(
        f"/api/v1/members/{member_id}",
        json={"role": "Program Lead", "status": "inactive"},
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["role"] == "Program Lead"
    assert updated["status"] == "inactive"

    filtered_response = client.get("/api/v1/members", params={"status_filter": "inactive"})
    assert filtered_response.status_code == 200
    assert filtered_response.json()["items"][0]["id"] == member_id

    delete_response = client.delete(f"/api/v1/members/{member_id}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/api/v1/members/{member_id}")
    assert missing_response.status_code == 404


def test_member_validation_rejects_invalid_payload() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/api/v1/members",
        json={
            "full_name": "A",
            "email": "invalid-email",
            "phone": "123",
            "role": "V",
        },
    )

    assert response.status_code == 422
