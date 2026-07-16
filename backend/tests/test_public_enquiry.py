from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tests.conftest import ADMIN_HEADERS


pytestmark = [pytest.mark.api, pytest.mark.db]


def test_public_enquiry_creates_active_simple_record(client: TestClient) -> None:
    response = client.post(
        "/api/v1/enquiries/public",
        json={
            "contact_name": "Public Contact",
            "contact_email": "contact@example.org",
            "phone": "+91 9876543210",
            "category": "volunteer",
            "summary": "I would like to volunteer for weekend outreach.",
            "status": "archived",
            "amount": 9999,
            "notes": "should be ignored",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["module"] == "enquiries"
    assert body["status"] == "active"
    assert body["category"] == "volunteer"
    assert body["contact_name"] == "Public Contact"
    assert body["contact_email"] == "contact@example.org"
    assert body["summary"] == "I would like to volunteer for weekend outreach."
    assert body["title"] == "Enquiry from Public Contact"
    assert body["notes"] == "Phone: +91 9876543210"
    assert body["amount"] is None

    listing = client.get("/api/v1/enquiries", headers=ADMIN_HEADERS, params={"search": "Public Contact"})
    assert listing.status_code == 200
    assert listing.json()["total"] >= 1


def test_public_enquiry_without_phone_omits_notes(client: TestClient) -> None:
    response = client.post(
        "/api/v1/enquiries/public",
        json={
            "contact_name": "No Phone",
            "contact_email": "nophone@example.org",
            "category": "general",
            "summary": "General question about membership.",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["notes"] is None
    assert body["status"] == "active"


def test_public_enquiry_validation_422(client: TestClient) -> None:
    response = client.post(
        "/api/v1/enquiries/public",
        json={
            "contact_name": "X",
            "contact_email": "not-an-email",
            "summary": "hi",
        },
    )
    assert response.status_code == 422
