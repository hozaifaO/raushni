from __future__ import annotations

import json

import pytest
from fastapi.testclient import TestClient

from app.schemas.webhook import StripeWebhookEvent
from tests.conftest import ADMIN_HEADERS

pytestmark = [pytest.mark.api, pytest.mark.db]


@pytest.fixture(autouse=True)
def _disable_stripe_webhook_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "")


def test_public_donation_strips_paid_and_gateway_fields(client: TestClient) -> None:
    response = client.post(
        "/api/v1/donations/public",
        json={
            "donor_name": "Public Donor",
            "donor_email": "public@example.org",
            "donor_phone": "+91 9123456780",
            "amount": 1500,
            "currency": "INR",
            "purpose": "general",
            "payment_method": "upi",
            "transaction_reference": "UTR-PUBLIC-KEEP",
            "payment_status": "paid",
            "gateway_provider": "stripe",
            "gateway_session_id": "cs_test_forge",
            "checkout_url": "https://evil.example/pay",
        },
    )
    # Extra fields are ignored by PublicDonationCreate; paid/gateway cannot stick.
    assert response.status_code == 201
    body = response.json()
    assert body["payment_status"] == "pending"
    assert body["gateway_provider"] is None
    assert body["gateway_session_id"] is None
    assert body["checkout_url"] is None
    assert body["transaction_reference"] == "UTR-PUBLIC-KEEP"
    assert body["is_anonymous"] is False


def test_public_donation_requires_utr_for_upi(client: TestClient) -> None:
    response = client.post(
        "/api/v1/donations/public",
        json={
            "donor_name": "Missing UTR",
            "donor_phone": "+91 9123456781",
            "amount": 500,
            "payment_method": "upi",
        },
    )
    assert response.status_code == 422


def test_public_donation_anonymous_without_phone(client: TestClient) -> None:
    response = client.post(
        "/api/v1/donations/public",
        json={
            "donor_name": "Quiet Patron",
            "amount": 750,
            "payment_method": "cash",
            "is_anonymous": True,
            "donor_type": "foundation",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["is_anonymous"] is True
    assert body["donor_name"] == "Quiet Patron"
    assert body["donor_type"] == "foundation"
    assert body["donor_phone"] == ""
    assert body["payment_status"] == "pending"


def test_public_donation_anonymous_receipt_shows_anonymous(
    client: TestClient,
) -> None:
    create = client.post(
        "/api/v1/donations/public",
        json={
            "donor_name": "Quiet Patron",
            "amount": 900,
            "payment_method": "cash",
            "is_anonymous": True,
        },
    )
    assert create.status_code == 201
    donation_id = create.json()["id"]

    paid = client.post(
        f"/api/v1/donations/{donation_id}/mark-paid",
        headers=ADMIN_HEADERS,
        json={},
    )
    assert paid.status_code == 200
    assert paid.json()["donor_name"] == "Quiet Patron"

    receipt = client.post(
        f"/api/v1/donations/{donation_id}/receipt",
        headers=ADMIN_HEADERS,
    )
    assert receipt.status_code == 200
    assert receipt.json()["donation"]["donor_name"] == "Anonymous"
    assert receipt.json()["donation"]["is_anonymous"] is True


def test_stripe_webhook_completed_marks_paid(client: TestClient) -> None:
    create = client.post(
        "/api/v1/donations",
        headers=ADMIN_HEADERS,
        json={
            "donor_name": "Webhook Donor",
            "donor_phone": "+91 9000011111",
            "amount": 2000,
            "payment_method": "stripe",
            "payment_status": "pending",
            "gateway_provider": "stripe",
            "gateway_session_id": "cs_test_webhook_1",
            "donation_date": "2026-07-10",
        },
    )
    assert create.status_code == 201
    donation_id = create.json()["id"]

    payload = {
        "id": "evt_test_1",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_webhook_1",
                "payment_intent": "pi_test_1",
            }
        },
    }
    response = client.post(
        "/api/v1/webhooks/stripe",
        content=json.dumps(payload),
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "received"

    donated = client.get(f"/api/v1/donations/{donation_id}")
    assert donated.status_code == 200
    body = donated.json()
    assert body["payment_status"] == "paid"
    assert body["receipt_issued"] is False
    assert body["transaction_reference"] == "pi_test_1"

    events = client.get(
        f"/api/v1/donations/{donation_id}/events", headers=ADMIN_HEADERS
    )
    assert events.status_code == 200
    event_rows = events.json()
    paid_events = [row for row in event_rows if row["to_status"] == "paid"]
    assert len(paid_events) == 1
    assert paid_events[0]["actor_role"] == "webhook"
    assert paid_events[0]["note"] == "stripe_checkout_completed"
    assert paid_events[0]["transaction_reference"] == "pi_test_1"


def test_stripe_webhook_unknown_type_ignored(client: TestClient) -> None:
    payload = {"id": "evt_ignore", "type": "customer.created", "data": {"object": {}}}
    response = client.post(
        "/api/v1/webhooks/stripe",
        content=json.dumps(payload),
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "received"


def test_stripe_webhook_event_model_parses() -> None:
    event = StripeWebhookEvent.from_stripe_payload(
        {
            "type": "checkout.session.completed",
            "data": {"object": {"id": "cs_x", "payment_intent": "pi_x"}},
        }
    )
    assert event.type == "checkout.session.completed"
    assert event.data is not None
    assert event.data.object.id == "cs_x"
