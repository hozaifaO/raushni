from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


pytestmark = pytest.mark.api

ADMIN_HEADERS = {"X-User-Role": "ADMIN"}
GUEST_HEADERS = {"X-User-Role": "GUEST"}


def donation_payload(payment_status: str = "pending") -> dict[str, object]:
    return {
        "donor_name": "Aisha Khan",
        "donor_email": "aisha@example.org",
        "donor_phone": "+91 9876543210",
        "donor_address": "Hyderabad",
        "donor_pan": "ABCDE1234F",
        "donor_type": "individual",
        "amount": 5000,
        "currency": "INR",
        "purpose": "education",
        "payment_method": "upi",
        "payment_status": payment_status,
        "transaction_reference": "UPI-REF-1001",
        "donation_date": "2026-05-21",
        "notes": "Scholarship support",
    }


def test_donation_management_workflow() -> None:
    client = TestClient(create_app())

    create_response = client.post(
        "/api/v1/donations",
        headers=ADMIN_HEADERS,
        json=donation_payload("pending"),
    )

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["donor_name"] == "Aisha Khan"
    assert created["payment_status"] == "pending"
    assert created["receipt_issued"] is False

    donation_id = created["id"]

    receipt_too_early = client.post(f"/api/v1/donations/{donation_id}/receipt", headers=ADMIN_HEADERS)
    assert receipt_too_early.status_code == 409

    update_response = client.patch(
        f"/api/v1/donations/{donation_id}",
        headers=ADMIN_HEADERS,
        json={"payment_status": "paid"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["receipt_issued"] is True

    receipt_response = client.post(f"/api/v1/donations/{donation_id}/receipt", headers=ADMIN_HEADERS)
    assert receipt_response.status_code == 200
    receipt = receipt_response.json()
    assert receipt["receipt_number"] == created["receipt_number"]
    assert receipt["donation"]["id"] == donation_id

    list_response = client.get("/api/v1/donations", params={"search": "aisha", "status_filter": "paid"})
    assert list_response.status_code == 200
    listing = list_response.json()
    assert listing["total"] == 1
    assert listing["paid"] == 1
    assert listing["items"][0]["id"] == donation_id
    assert listing["total_amount"] == 5000

    delete_response = client.delete(f"/api/v1/donations/{donation_id}", headers=ADMIN_HEADERS)
    assert delete_response.status_code == 204

    missing_response = client.get(f"/api/v1/donations/{donation_id}")
    assert missing_response.status_code == 404


def test_public_donation_is_registered_pending() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/api/v1/donations/public",
        json={**donation_payload("paid"), "donor_name": "Public Donor"},
    )

    assert response.status_code == 201
    created = response.json()
    assert created["donor_name"] == "Public Donor"
    assert created["payment_status"] == "pending"
    assert created["receipt_issued"] is False


def test_guest_can_read_but_cannot_mutate_donations() -> None:
    client = TestClient(create_app())

    list_response = client.get("/api/v1/donations", headers=GUEST_HEADERS)
    assert list_response.status_code == 200

    create_response = client.post(
        "/api/v1/donations",
        headers=GUEST_HEADERS,
        json=donation_payload(),
    )

    assert create_response.status_code == 403
    assert create_response.json()["detail"] == "Guest users have read-only access."
