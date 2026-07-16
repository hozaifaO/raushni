from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import ADMIN_HEADERS, GUEST_HEADERS


pytestmark = [pytest.mark.api, pytest.mark.db]


def designation_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "title": "Field Coordinator",
        "code": "FIELD-COORD",
        "department": "Programmes",
        "level": "coordination",
        "status": "active",
        "description": "Coordinates field volunteers and community outreach activities.",
        "assignment_scope": "District field coordination",
        "responsibilities": ["Plan outreach", "Track attendance"],
        "required_documents": ["KYC"],
        "staff_assigned": 1,
        "volunteer_slots": 5,
        "sort_order": 15,
    }
    payload.update(overrides)
    return payload


def test_designation_crud_and_persistence(client: TestClient) -> None:
    create = client.post("/api/v1/designations", headers=ADMIN_HEADERS, json=designation_payload())
    assert create.status_code == 201
    created = create.json()
    designation_id = created["id"]

    listing = client.get("/api/v1/designations", params={"search": "field"})
    assert listing.status_code == 200
    assert listing.json()["total"] >= 1

    update = client.patch(
        f"/api/v1/designations/{designation_id}",
        headers=ADMIN_HEADERS,
        json={"status": "inactive"},
    )
    assert update.status_code == 200
    assert update.json()["status"] == "inactive"

    delete = client.delete(f"/api/v1/designations/{designation_id}", headers=ADMIN_HEADERS)
    assert delete.status_code == 204

    # Recreate then prove persistence across a new app instance (nested client last).
    recreate = client.post(
        "/api/v1/designations",
        headers=ADMIN_HEADERS,
        json=designation_payload(code="FIELD-COORD-2"),
    )
    assert recreate.status_code == 201
    persist_id = recreate.json()["id"]
    with TestClient(create_app()) as other:
        persisted = other.get(f"/api/v1/designations/{persist_id}")
        assert persisted.status_code == 200
        assert persisted.json()["code"] == "FIELD-COORD-2"


def test_guest_cannot_create_designation(client: TestClient) -> None:
    response = client.post("/api/v1/designations", headers=GUEST_HEADERS, json=designation_payload(code="GUEST"))
    assert response.status_code == 403


def test_designation_validation_422(client: TestClient) -> None:
    response = client.post(
        "/api/v1/designations",
        headers=ADMIN_HEADERS,
        json={"title": "X", "code": "Y", "department": "Z", "description": "short", "assignment_scope": "ab"},
    )
    assert response.status_code == 422


def test_simple_records_activities_crud(client: TestClient) -> None:
    create = client.post(
        "/api/v1/activities",
        headers=ADMIN_HEADERS,
        json={
            "title": "School Hygiene Drive",
            "category": "outreach",
            "summary": "Community hygiene awareness session for students.",
            "status": "active",
            "record_date": "2026-07-10",
            "location": "Muzaffarpur",
        },
    )
    assert create.status_code == 201
    record_id = create.json()["id"]
    assert create.json()["module"] == "activities"

    listing = client.get("/api/v1/activities", params={"search": "hygiene"})
    assert listing.status_code == 200
    assert listing.json()["total"] == 1

    guest = client.post(
        "/api/v1/activities",
        headers=GUEST_HEADERS,
        json={
            "title": "Blocked",
            "summary": "Guest should not create activities here.",
            "record_date": "2026-07-10",
        },
    )
    assert guest.status_code == 403

    with TestClient(create_app()) as other:
        persisted = other.get(f"/api/v1/activities/{record_id}")
        assert persisted.status_code == 200
        assert persisted.json()["title"] == "School Hygiene Drive"
