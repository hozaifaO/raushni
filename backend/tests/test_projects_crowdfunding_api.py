from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import ADMIN_HEADERS, GUEST_HEADERS

pytestmark = [pytest.mark.api, pytest.mark.db]


def project_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "title": "Project Sparsh WATSAN",
        "slug": "project-sparsh-watsan",
        "summary": "School water and sanitation intervention across marginalized schools.",
        "location": "Muzaffarpur District, Bihar",
        "status": "proposed",
        "start_date": "2026-06-01",
        "end_date": "2027-05-31",
        "budget": 4811136,
        "beneficiaries": 2500,
        "objectives": ["Install RO systems", "Hygiene sessions"],
        "milestones": ["Baseline", "Installation"],
        "risks": ["Seasonal floods"],
    }
    payload.update(overrides)
    return payload


def campaign_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "title": "School WATSAN Fund",
        "slug": "school-watsan-fund",
        "summary": "Raise funds for safe drinking water and sanitation in schools.",
        "category": "watsan",
        "status": "published",
        "target_amount": 100000,
        "amount_raised": 0,
        "start_date": "2026-05-15",
        "end_date": "2026-09-30",
        "location": "Muzaffarpur",
        "highlights": ["10 schools"],
        "impact_metrics": ["2500 students"],
    }
    payload.update(overrides)
    return payload


def test_projects_crud_and_persistence(client: TestClient) -> None:
    create = client.post(
        "/api/v1/projects", headers=ADMIN_HEADERS, json=project_payload()
    )
    assert create.status_code == 201
    project_id = create.json()["id"]

    listing = client.get("/api/v1/projects", params={"search": "sparsh"})
    assert listing.status_code == 200
    assert listing.json()["total"] >= 1

    update = client.patch(
        f"/api/v1/projects/{project_id}",
        headers=ADMIN_HEADERS,
        json={"status": "active", "progress": 25},
    )
    assert update.status_code == 200
    assert update.json()["progress"] == 25

    guest = client.post(
        "/api/v1/projects",
        headers=GUEST_HEADERS,
        json=project_payload(slug="guest-block"),
    )
    assert guest.status_code == 403

    with TestClient(create_app()) as other:
        assert other.get(f"/api/v1/projects/{project_id}").status_code == 200


def test_campaign_donation_updates_raised_transactionally(client: TestClient) -> None:
    create = client.post(
        "/api/v1/crowdfunding", headers=ADMIN_HEADERS, json=campaign_payload()
    )
    assert create.status_code == 201
    campaign_id = create.json()["id"]
    assert create.json()["amount_raised"] == 0

    donate = client.post(
        f"/api/v1/crowdfunding/{campaign_id}/donations",
        headers=ADMIN_HEADERS,
        json={"donor_name": "Aisha", "amount": 60000, "payment_method": "upi"},
    )
    assert donate.status_code == 201
    assert donate.json()["amount_raised"] == 60000
    assert donate.json()["donation_count"] == 1
    assert donate.json()["status"] == "published"

    donate2 = client.post(
        f"/api/v1/crowdfunding/{campaign_id}/donations",
        headers=ADMIN_HEADERS,
        json={"donor_name": "Omar", "amount": 50000, "payment_method": "upi"},
    )
    assert donate2.status_code == 201
    assert donate2.json()["amount_raised"] == 110000
    assert donate2.json()["status"] == "funded"
    assert donate2.json()["donation_count"] == 2

    donations = client.get(f"/api/v1/crowdfunding/{campaign_id}/donations")
    assert donations.status_code == 200
    assert len(donations.json()) == 2

    with TestClient(create_app()) as other:
        persisted = other.get(f"/api/v1/crowdfunding/{campaign_id}")
        assert persisted.status_code == 200
        assert persisted.json()["amount_raised"] == 110000
