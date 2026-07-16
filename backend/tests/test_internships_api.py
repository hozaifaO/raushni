from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import ADMIN_HEADERS, GUEST_HEADERS


pytestmark = [pytest.mark.api, pytest.mark.db]


def announcement_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "title": "Internship 2026 AI Community Program",
        "slug": "internship-2026-ai",
        "summary": "Professional internship for students gaining practical exposure.",
        "description": "Students work on real community technology workflows across web development and outreach.",
        "start_date": "2026-06-15",
        "end_date": "2026-08-15",
        "registration_deadline": "2026-06-14",
        "event_date": "2026-06-15",
        "event_time": "01:00 PM",
        "location": "Web/Virtual, India",
        "benefits": ["Real industry exposure", "Completion certificate"],
        "tracks": ["Web Development", "Data and Reporting"],
        "eligibility": ["Students and early-career learners"],
    }
    payload.update(overrides)
    return payload


def test_internship_registration_and_certificate_workflow(client: TestClient) -> None:
    announcement = client.post(
        "/api/v1/internships/announcements",
        headers=ADMIN_HEADERS,
        json=announcement_payload(),
    )
    assert announcement.status_code == 201
    announcement_id = announcement.json()["id"]

    public_registration = client.post(
        "/api/v1/internships/applications/public",
        json={
            "announcement_id": announcement_id,
            "full_name": "Aman Kumar",
            "email": "aman@example.org",
            "phone": "+91 9876543210",
            "city": "Patna",
            "college": "Bihar Technical College",
            "course": "BCA",
            "track": "Web Development",
            "github_url": "https://github.com/example",
            "portfolio_url": None,
            "motivation": "I want practical project experience and guidance while contributing to a social impact technology platform.",
            "status": "completed",
            "completion_notes": None,
        },
    )
    assert public_registration.status_code == 201
    application = public_registration.json()
    assert application["status"] == "registered"
    assert application["registration_number"].startswith("RSH-INT-")

    too_early = client.post(
        f"/api/v1/internships/applications/{application['id']}/certificate",
        headers=ADMIN_HEADERS,
        json={"completion_notes": "Completed all assigned work."},
    )
    assert too_early.status_code == 409

    activate = client.patch(
        f"/api/v1/internships/applications/{application['id']}",
        headers=ADMIN_HEADERS,
        json={"status": "active"},
    )
    assert activate.status_code == 200

    certificate_response = client.post(
        f"/api/v1/internships/applications/{application['id']}/certificate",
        headers=ADMIN_HEADERS,
        json={"completion_notes": "Completed all assigned work."},
    )
    assert certificate_response.status_code == 200
    certificate = certificate_response.json()
    assert certificate["certificate_number"].startswith("RSH-CERT-")
    assert certificate["participant_name"] == "Aman Kumar"
    assert "<svg" in certificate["qr_code_svg"]
    assert "Certificate of Completion" in certificate["html_template"]

    verify = client.get(f"/api/v1/internships/certificates/{certificate['verification_code']}")
    assert verify.status_code == 200
    assert verify.json()["certificate_number"] == certificate["certificate_number"]

    html = client.get(f"/api/v1/internships/certificates/{certificate['verification_code']}/html")
    assert html.status_code == 200
    assert "text/html" in html.headers["content-type"]
    assert "Aman Kumar" in html.text

    with TestClient(create_app()) as other:
        dashboard = other.get("/api/v1/internships", headers=ADMIN_HEADERS)
        assert dashboard.status_code == 200
        assert dashboard.json()["total_applications"] >= 1


def test_guest_can_read_but_cannot_create_internship_announcement(client: TestClient) -> None:
    list_response = client.get("/api/v1/internships", headers=GUEST_HEADERS)
    assert list_response.status_code == 200

    create_response = client.post(
        "/api/v1/internships/announcements",
        headers=GUEST_HEADERS,
        json=announcement_payload(slug="blocked"),
    )
    assert create_response.status_code == 403
    assert create_response.json()["detail"] == "Guest users have read-only access."
