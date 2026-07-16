from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.core.sanitize import strip_and_collapse_ws, strip_html_tags
from app.schemas.donation import DonationCreate, PublicDonationCreate
from app.schemas.member import MemberCreate
from app.schemas.project import ProjectCreate
from app.schemas.simple_record import PublicEnquiryCreate, SimpleRecordStatus


pytestmark = pytest.mark.unit


def test_sanitize_strips_control_and_collapses_ws() -> None:
    assert strip_and_collapse_ws("  hello\x00  world  ") == "hello world"
    assert strip_html_tags("<b>Hi</b> there") == "Hi there"


def test_member_rejects_bad_email_and_overlong_notes() -> None:
    with pytest.raises(ValidationError):
        MemberCreate(
            full_name="Aisha Khan",
            email="not-an-email",
            phone="+91 9876543210",
            role="Volunteer",
        )
    with pytest.raises(ValidationError):
        MemberCreate(
            full_name="Aisha Khan",
            phone="+91 9876543210",
            role="Volunteer",
            notes="x" * 501,
        )


def test_donation_rejects_non_positive_amount_and_bad_pan() -> None:
    with pytest.raises(ValidationError):
        DonationCreate(
            donor_name="Aisha",
            donor_phone="+91 9876543210",
            amount=0,
        )
    with pytest.raises(ValidationError):
        DonationCreate(
            donor_name="Aisha",
            donor_phone="+91 9876543210",
            amount=100,
            donor_pan="bad-pan",
        )


def test_public_donation_create_cannot_carry_gateway_fields() -> None:
    payload = PublicDonationCreate(
        donor_name="Public Donor",
        donor_phone="+91 9000000000",
        amount=250,
        payment_method="upi",
        transaction_reference="UTR-PUBLIC-1",
    )
    created = payload.to_donation_create()
    assert created.payment_status.value == "pending"
    assert created.gateway_provider is None
    assert created.gateway_session_id is None
    assert created.transaction_reference == "UTR-PUBLIC-1"
    assert "payment_status" not in PublicDonationCreate.model_fields
    assert "gateway_session_id" not in PublicDonationCreate.model_fields


def test_public_donation_requires_utr_for_upi() -> None:
    with pytest.raises(ValidationError):
        PublicDonationCreate(
            donor_name="Public Donor",
            donor_phone="+91 9000000000",
            amount=250,
            payment_method="upi",
        )


def test_public_donation_anonymous_phone_optional_and_foundation() -> None:
    payload = PublicDonationCreate(
        donor_name="Quiet Patron",
        amount=500,
        payment_method="cash",
        is_anonymous=True,
        donor_type="foundation",
    )
    created = payload.to_donation_create()
    assert created.is_anonymous is True
    assert created.donor_phone is None
    assert created.donor_type.value == "foundation"
    assert created.donor_name == "Quiet Patron"


def test_public_donation_rejects_anonymous_without_phone_when_not_anonymous() -> None:
    with pytest.raises(ValidationError):
        PublicDonationCreate(
            donor_name="Needs Phone",
            amount=100,
            payment_method="cash",
            is_anonymous=False,
        )


def test_public_enquiry_create_maps_phone_into_notes() -> None:
    payload = PublicEnquiryCreate(
        contact_name="Public Contact",
        contact_email="contact@example.org",
        phone="+91 9876543210",
        category="volunteer",
        summary="I would like to volunteer for weekend outreach.",
    )
    created = payload.to_simple_record_create()
    assert created.status == SimpleRecordStatus.ACTIVE
    assert created.title == "Enquiry from Public Contact"
    assert created.notes == "Phone: +91 9876543210"
    assert created.contact_email == "contact@example.org"
    assert "status" not in PublicEnquiryCreate.model_fields
    assert "amount" not in PublicEnquiryCreate.model_fields

    without_phone = PublicEnquiryCreate(
        contact_name="No Phone",
        contact_email="nophone@example.org",
        summary="General question about membership.",
    ).to_simple_record_create()
    assert without_phone.notes is None
    assert without_phone.status == SimpleRecordStatus.ACTIVE


def test_project_rejects_oversized_list_item() -> None:
    with pytest.raises(ValidationError):
        ProjectCreate(
            title="Project Sparsh School WATSAN",
            slug="project-sparsh",
            summary="A long enough summary for project validation rules.",
            location="Muzaffarpur",
            start_date="2026-06-01",
            end_date="2027-05-31",
            budget=1000,
            objectives=["x" * 401],
        )
