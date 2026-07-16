from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import ADMIN_HEADERS, GUEST_HEADERS


pytestmark = [pytest.mark.api, pytest.mark.db]


def donation_payload(payment_status: str = "pending", **overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
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
    payload.update(overrides)
    return payload


def test_donation_management_workflow(client: TestClient) -> None:
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
    assert created["receipt_issued_at"] is None
    assert created["is_anonymous"] is False

    donation_id = created["id"]

    receipt_too_early = client.post(f"/api/v1/donations/{donation_id}/receipt", headers=ADMIN_HEADERS)
    assert receipt_too_early.status_code == 409

    mark_paid = client.post(
        f"/api/v1/donations/{donation_id}/mark-paid",
        headers=ADMIN_HEADERS,
        json={"transaction_reference": "UPI-REF-1001"},
    )
    assert mark_paid.status_code == 200
    paid = mark_paid.json()
    assert paid["payment_status"] == "paid"
    assert paid["receipt_issued"] is False
    assert paid["transaction_reference"] == "UPI-REF-1001"

    receipt_response = client.post(f"/api/v1/donations/{donation_id}/receipt", headers=ADMIN_HEADERS)
    assert receipt_response.status_code == 200
    receipt = receipt_response.json()
    assert receipt["receipt_number"] == created["receipt_number"]
    assert receipt["donation"]["id"] == donation_id
    assert receipt["donation"]["receipt_issued"] is True
    assert receipt["donation"]["receipt_issued_at"] is not None
    assert receipt["donation"]["receipt_snapshot"] is not None

    frozen = client.patch(
        f"/api/v1/donations/{donation_id}",
        headers=ADMIN_HEADERS,
        json={"amount": 9999},
    )
    assert frozen.status_code == 409

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


def test_mark_paid_requires_utr_for_upi(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/donations",
        headers=ADMIN_HEADERS,
        json=donation_payload(
            "pending",
            payment_method="upi",
            transaction_reference=None,
        ),
    )
    assert create_response.status_code == 201
    donation_id = create_response.json()["id"]

    missing = client.post(
        f"/api/v1/donations/{donation_id}/mark-paid",
        headers=ADMIN_HEADERS,
        json={},
    )
    assert missing.status_code == 400

    ok = client.post(
        f"/api/v1/donations/{donation_id}/mark-paid",
        headers=ADMIN_HEADERS,
        json={"transaction_reference": "UTR-123456"},
    )
    assert ok.status_code == 200
    assert ok.json()["payment_status"] == "paid"
    assert ok.json()["transaction_reference"] == "UTR-123456"
    assert ok.json()["receipt_issued"] is False


def test_mark_paid_cash_exempt_from_utr(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/donations",
        headers=ADMIN_HEADERS,
        json=donation_payload(
            "pending",
            payment_method="cash",
            transaction_reference=None,
        ),
    )
    assert create_response.status_code == 201
    donation_id = create_response.json()["id"]

    response = client.post(
        f"/api/v1/donations/{donation_id}/mark-paid",
        headers=ADMIN_HEADERS,
        json={},
    )
    assert response.status_code == 200
    assert response.json()["payment_status"] == "paid"
    assert response.json()["receipt_issued"] is False


def test_issue_receipt_freezes_snapshot(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/donations",
        headers=ADMIN_HEADERS,
        json=donation_payload("pending"),
    )
    donation_id = create_response.json()["id"]

    client.post(
        f"/api/v1/donations/{donation_id}/mark-paid",
        headers=ADMIN_HEADERS,
        json={"transaction_reference": "UPI-REF-1001"},
    )
    first = client.post(f"/api/v1/donations/{donation_id}/receipt", headers=ADMIN_HEADERS)
    assert first.status_code == 200
    first_body = first.json()
    issued_at = first_body["issued_at"]
    snapshot_amount = first_body["donation"]["receipt_snapshot"]["amount"]

    second = client.post(f"/api/v1/donations/{donation_id}/receipt", headers=ADMIN_HEADERS)
    assert second.status_code == 200
    assert second.json()["issued_at"] == issued_at
    assert second.json()["donation"]["receipt_snapshot"]["amount"] == snapshot_amount

    for field, value in (
        ("donor_name", "Changed Name"),
        ("payment_method", "cash"),
        ("transaction_reference", "OTHER-REF"),
        ("currency", "USD"),
        ("purpose", "relief"),
    ):
        blocked = client.patch(
            f"/api/v1/donations/{donation_id}",
            headers=ADMIN_HEADERS,
            json={field: value},
        )
        assert blocked.status_code == 409, field

    notes_ok = client.patch(
        f"/api/v1/donations/{donation_id}",
        headers=ADMIN_HEADERS,
        json={"notes": "Internal note after issue"},
    )
    assert notes_ok.status_code == 200
    assert notes_ok.json()["notes"] == "Internal note after issue"


def test_donation_status_events_on_mark_paid(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/donations",
        headers=ADMIN_HEADERS,
        json=donation_payload("pending"),
    )
    donation_id = create_response.json()["id"]

    client.post(
        f"/api/v1/donations/{donation_id}/mark-paid",
        headers=ADMIN_HEADERS,
        json={"transaction_reference": "UPI-REF-1001"},
    )

    events = client.get(f"/api/v1/donations/{donation_id}/events", headers=ADMIN_HEADERS)
    assert events.status_code == 200
    body = events.json()
    assert len(body) >= 2
    assert body[0]["to_status"] == "pending"
    assert body[0]["note"] == "created"
    assert body[-1]["from_status"] == "pending"
    assert body[-1]["to_status"] == "paid"
    assert body[-1]["actor_email"] == "admin@raushni.com"
    assert body[-1]["transaction_reference"] == "UPI-REF-1001"


def test_public_donation_is_registered_pending(client: TestClient) -> None:
    response = client.post(
        "/api/v1/donations/public",
        json={**donation_payload("paid"), "donor_name": "Public Donor"},
    )

    assert response.status_code == 201
    created = response.json()
    assert created["donor_name"] == "Public Donor"
    assert created["payment_status"] == "pending"
    assert created["receipt_issued"] is False


def test_public_donation_blocked_when_disabled(client: TestClient) -> None:
    disable = client.patch(
        "/api/v1/settings/platform",
        headers=ADMIN_HEADERS,
        json={"public_donations_enabled": False},
    )
    assert disable.status_code == 200
    assert disable.json()["public_donations_enabled"] is False

    response = client.post(
        "/api/v1/donations/public",
        json={**donation_payload(), "donor_name": "Blocked Donor"},
    )
    assert response.status_code == 403
    assert "disabled" in response.json()["detail"].lower()

    enable = client.patch(
        "/api/v1/settings/platform",
        headers=ADMIN_HEADERS,
        json={"public_donations_enabled": True},
    )
    assert enable.status_code == 200


def test_guest_can_read_but_cannot_mutate_donations(client: TestClient) -> None:
    list_response = client.get("/api/v1/donations", headers=GUEST_HEADERS)
    assert list_response.status_code == 200

    create_response = client.post(
        "/api/v1/donations",
        headers=GUEST_HEADERS,
        json=donation_payload(),
    )

    assert create_response.status_code == 403
    detail = create_response.json()["detail"].lower()
    assert "read-only" in detail or "not a member" in detail


def test_donation_survives_new_app_instance(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/donations/public",
        json={**donation_payload(), "donor_name": "Durable Donor", "donor_email": "durable@example.org"},
    )
    assert create_response.status_code == 201
    donation_id = create_response.json()["id"]

    with TestClient(create_app()) as other:
        response = other.get(f"/api/v1/donations/{donation_id}")
        assert response.status_code == 200
        assert response.json()["donor_name"] == "Durable Donor"
