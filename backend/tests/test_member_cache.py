from __future__ import annotations

from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from tests.conftest import ADMIN_HEADERS

pytestmark = [pytest.mark.api, pytest.mark.db]


def test_member_crud_roundtrip(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/members",
        headers=ADMIN_HEADERS,
        json={
            "full_name": "Cache Member",
            "email": "cache@example.org",
            "phone": "+91 9888888888",
            "role": "Volunteer",
            "status": "active",
            "joined_on": "2026-07-01",
        },
    )
    assert create_response.status_code == 201
    member_id = create_response.json()["id"]

    get_response = client.get(f"/api/v1/members/{member_id}")
    assert get_response.status_code == 200
    assert get_response.json()["full_name"] == "Cache Member"

    patch_response = client.patch(
        f"/api/v1/members/{member_id}",
        headers=ADMIN_HEADERS,
        json={"role": "Program Lead"},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["role"] == "Program Lead"

    refreshed = client.get(f"/api/v1/members/{member_id}")
    assert refreshed.status_code == 200
    assert refreshed.json()["role"] == "Program Lead"


def test_member_repository_contract_via_api(client: TestClient) -> None:
    missing = client.get(f"/api/v1/members/{uuid4()}")
    assert missing.status_code == 404

    created = client.post(
        "/api/v1/members",
        headers=ADMIN_HEADERS,
        json={
            "full_name": "Contract Member",
            "email": "contract@example.org",
            "phone": "+91 9666666666",
            "role": "Volunteer",
            "joined_on": "2026-07-01",
        },
    )
    assert created.status_code == 201
    member_id = created.json()["id"]

    listed = client.get("/api/v1/members")
    assert listed.status_code == 200
    assert any(item["id"] == member_id for item in listed.json()["items"])
