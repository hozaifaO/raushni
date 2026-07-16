from __future__ import annotations

import asyncio
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings
from tests.conftest import ADMIN_HEADERS, API_KEY


pytestmark = [pytest.mark.api, pytest.mark.db]


OTHER_ORG_HEADERS = {
    "X-API-Key": API_KEY,
    "X-User-Role": "ADMIN",
    "X-User-Email": "admin@other.local",
    "X-Tenant-Slug": "acme-trust",
}


async def _ensure_second_org() -> None:
    settings = get_settings()
    engine = create_async_engine(settings.async_database_url)
    async with engine.begin() as conn:
        existing = await conn.execute(
            text("SELECT id FROM organizations WHERE slug = 'acme-trust'")
        )
        row = existing.first()
        if row is None:
            org_id = uuid.uuid4()
            await conn.execute(
                text(
                    """
                    INSERT INTO organizations (id, slug, name, status)
                    VALUES (:id, 'acme-trust', 'Acme Trust', 'active')
                    """
                ),
                {"id": org_id},
            )
            await conn.execute(
                text(
                    """
                    INSERT INTO organization_memberships (id, organization_id, email, role)
                    VALUES (:mid, :oid, 'admin@other.local', 'ADMIN')
                    """
                ),
                {"mid": uuid.uuid4(), "oid": org_id},
            )
    await engine.dispose()


@pytest.fixture
def two_org_client(client: TestClient) -> TestClient:
    asyncio.run(_ensure_second_org())
    return client


def test_cross_tenant_member_get_returns_404(two_org_client: TestClient) -> None:
    created = two_org_client.post(
        "/api/v1/members",
        headers=ADMIN_HEADERS,
        json={
            "full_name": "Org A Member",
            "email": "orga@example.org",
            "phone": "+91 9111111111",
            "role": "Volunteer",
            "status": "active",
            "joined_on": "2026-07-01",
        },
    )
    assert created.status_code == 201
    member_id = created.json()["id"]

    same_org = two_org_client.get(f"/api/v1/members/{member_id}", headers=ADMIN_HEADERS)
    assert same_org.status_code == 200
    assert same_org.json()["full_name"] == "Org A Member"

    cross = two_org_client.get(f"/api/v1/members/{member_id}", headers=OTHER_ORG_HEADERS)
    assert cross.status_code == 404


def test_cross_tenant_donation_get_returns_404(two_org_client: TestClient) -> None:
    created = two_org_client.post(
        "/api/v1/donations/public",
        headers={"X-Tenant-Slug": "raushni"},
        json={
            "donor_name": "Tenant A Donor",
            "donor_phone": "+91 9222222222",
            "amount": 250,
            "payment_method": "cash",
        },
    )
    assert created.status_code == 201
    donation_id = created.json()["id"]

    same_org = two_org_client.get(f"/api/v1/donations/{donation_id}", headers=ADMIN_HEADERS)
    assert same_org.status_code == 200

    cross = two_org_client.get(f"/api/v1/donations/{donation_id}", headers=OTHER_ORG_HEADERS)
    assert cross.status_code == 404


def test_public_enquiry_scoped_to_tenant(two_org_client: TestClient) -> None:
    a_resp = two_org_client.post(
        "/api/v1/enquiries/public",
        headers={"X-Tenant-Slug": "raushni"},
        json={
            "contact_name": "Visitor A",
            "contact_email": "a@example.org",
            "category": "general",
            "summary": "Question for raushni tenant only.",
        },
    )
    assert a_resp.status_code == 201

    b_resp = two_org_client.post(
        "/api/v1/enquiries/public",
        headers={"X-Tenant-Slug": "acme-trust"},
        json={
            "contact_name": "Visitor B",
            "contact_email": "b@example.org",
            "category": "general",
            "summary": "Question for acme tenant only.",
        },
    )
    assert b_resp.status_code == 201

    list_a = two_org_client.get("/api/v1/enquiries", headers=ADMIN_HEADERS)
    assert list_a.status_code == 200
    names_a = {item["contact_name"] for item in list_a.json()["items"]}
    assert "Visitor A" in names_a
    assert "Visitor B" not in names_a

    list_b = two_org_client.get("/api/v1/enquiries", headers=OTHER_ORG_HEADERS)
    assert list_b.status_code == 200
    names_b = {item["contact_name"] for item in list_b.json()["items"]}
    assert "Visitor B" in names_b
    assert "Visitor A" not in names_b


def test_unknown_tenant_slug_returns_404(two_org_client: TestClient) -> None:
    response = two_org_client.get(
        "/api/v1/members",
        headers={
            "X-API-Key": API_KEY,
            "X-User-Role": "ADMIN",
            "X-Tenant-Slug": "does-not-exist",
        },
    )
    assert response.status_code == 404


def test_platform_settings_isolated_per_org(two_org_client: TestClient) -> None:
    update_a = two_org_client.patch(
        "/api/v1/settings/platform",
        headers=ADMIN_HEADERS,
        json={
            "support_email": "ops@raushni.example",
            "organization_name": "Raushni Isolated Org",
            "receipt_prefix": "RSH-A",
        },
    )
    assert update_a.status_code == 200
    assert update_a.json()["receipt_prefix"] == "RSH-A"

    update_b = two_org_client.patch(
        "/api/v1/settings/platform",
        headers=OTHER_ORG_HEADERS,
        json={
            "support_email": "ops@acme.example",
            "organization_name": "Acme Isolated Org",
            "receipt_prefix": "ACM-B",
        },
    )
    assert update_b.status_code == 200
    assert update_b.json()["receipt_prefix"] == "ACM-B"

    settings_a = two_org_client.get("/api/v1/settings", headers=ADMIN_HEADERS)
    assert settings_a.status_code == 200
    platform_a = settings_a.json()["platform"]
    assert platform_a["receipt_prefix"] == "RSH-A"
    assert platform_a["support_email"] == "ops@raushni.example"
    assert settings_a.json()["tenant_slug"] == "raushni"

    settings_b = two_org_client.get("/api/v1/settings", headers=OTHER_ORG_HEADERS)
    assert settings_b.status_code == 200
    platform_b = settings_b.json()["platform"]
    assert platform_b["receipt_prefix"] == "ACM-B"
    assert platform_b["support_email"] == "ops@acme.example"
    assert settings_b.json()["tenant_slug"] == "acme-trust"
    assert settings_b.json()["organization_name"] == "Acme Trust"


def test_staff_listing_scoped_to_org_memberships(two_org_client: TestClient) -> None:
    list_a = two_org_client.get("/api/v1/settings", headers=ADMIN_HEADERS)
    assert list_a.status_code == 200
    emails_a = {user["email"] for user in list_a.json()["users"]}
    assert emails_a
    assert "admin@other.local" not in emails_a

    list_b = two_org_client.get("/api/v1/settings", headers=OTHER_ORG_HEADERS)
    assert list_b.status_code == 200
    emails_b = {user["email"] for user in list_b.json()["users"]}
    assert emails_b == {"admin@other.local"}
    assert emails_a.isdisjoint(emails_b)

def test_public_donate_with_tenant_header_isolated(two_org_client: TestClient) -> None:
    a_resp = two_org_client.post(
        "/api/v1/donations/public",
        headers={"X-Tenant-Slug": "raushni"},
        json={
            "donor_name": "Raushni Donor",
            "donor_phone": "+91 9333333333",
            "amount": 300,
            "payment_method": "cash",
        },
    )
    assert a_resp.status_code == 201
    a_id = a_resp.json()["id"]

    b_resp = two_org_client.post(
        "/api/v1/donations/public",
        headers={"X-Tenant-Slug": "acme-trust"},
        json={
            "donor_name": "Acme Donor",
            "donor_phone": "+91 9444444444",
            "amount": 400,
            "payment_method": "cash",
        },
    )
    assert b_resp.status_code == 201
    b_id = b_resp.json()["id"]

    list_a = two_org_client.get("/api/v1/donations", headers=ADMIN_HEADERS)
    assert list_a.status_code == 200
    ids_a = {item["id"] for item in list_a.json()["items"]}
    assert a_id in ids_a
    assert b_id not in ids_a

    list_b = two_org_client.get("/api/v1/donations", headers=OTHER_ORG_HEADERS)
    assert list_b.status_code == 200
    ids_b = {item["id"] for item in list_b.json()["items"]}
    assert b_id in ids_b
    assert a_id not in ids_b

    cross = two_org_client.get(f"/api/v1/donations/{b_id}", headers=ADMIN_HEADERS)
    assert cross.status_code == 404

    same = two_org_client.get(f"/api/v1/donations/{b_id}", headers=OTHER_ORG_HEADERS)
    assert same.status_code == 200
    assert same.json()["donor_name"] == "Acme Donor"


def test_cross_org_user_update_returns_404(two_org_client: TestClient) -> None:
    list_a = two_org_client.get("/api/v1/settings", headers=ADMIN_HEADERS)
    assert list_a.status_code == 200
    user_a = list_a.json()["users"][0]

    cross = two_org_client.patch(
        f"/api/v1/settings/users/{user_a['id']}",
        headers=OTHER_ORG_HEADERS,
        json={"role": "GUEST"},
    )
    assert cross.status_code == 404


def test_organization_id_header_cannot_override_tenant_slug(two_org_client: TestClient) -> None:
    acme = two_org_client.get("/api/v1/settings", headers=OTHER_ORG_HEADERS)
    assert acme.status_code == 200
    acme_org_id = acme.json()["organization_id"]

    # Claiming acme org id while slug resolves to default (raushni) must fail.
    spoof = {
        "X-API-Key": API_KEY,
        "X-User-Role": "ADMIN",
        "X-Organization-Id": acme_org_id,
        # omit X-Tenant-Slug → defaults to raushni
    }
    response = two_org_client.get("/api/v1/settings", headers=spoof)
    assert response.status_code == 400
    assert "does not match" in response.json()["detail"].lower()
