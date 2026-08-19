from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from typing import Annotated, Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.core.sanitize import (
    OptionalFreeTextSanitizedStr,
    OptionalSanitizedStr,
    SanitizedStr,
)


class DonationPaymentMethod(StrEnum):
    UPI = "upi"
    QR_CODE = "qr_code"
    GPAY = "gpay"
    CASH = "cash"
    CHEQUE = "cheque"
    DEBIT_CARD = "debit_card"
    CREDIT_CARD = "credit_card"
    INTERNATIONAL_CARD = "international_card"
    STRIPE = "stripe"
    NETBANKING = "netbanking"
    ONLINE_BANKING = "online_banking"
    OTHER = "other"


UTR_REQUIRED_METHODS = frozenset(
    {
        DonationPaymentMethod.UPI,
        DonationPaymentMethod.QR_CODE,
        DonationPaymentMethod.GPAY,
        DonationPaymentMethod.CHEQUE,
    }
)

RECEIPT_FROZEN_FIELDS = frozenset(
    {
        "donor_name",
        "donor_email",
        "donor_phone",
        "donor_address",
        "donor_pan",
        "donor_type",
        "amount",
        "currency",
        "purpose",
        "payment_method",
        "transaction_reference",
    }
)

ANONYMOUS_DISPLAY_NAME = "Anonymous"


class DonationPaymentStatus(StrEnum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class DonationPurpose(StrEnum):
    GENERAL = "general"
    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    LIVELIHOOD = "livelihood"
    RELIEF = "relief"
    ENVIRONMENT = "environment"


class DonorType(StrEnum):
    INDIVIDUAL = "individual"
    CORPORATE = "corporate"
    TRUST = "trust"
    FOUNDATION = "foundation"
    OTHER = "other"


def _normalize_reference(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed or None


def _require_phone_unless_anonymous(
    *, is_anonymous: bool, donor_phone: str | None
) -> str | None:
    phone = _normalize_reference(donor_phone)
    if is_anonymous:
        if phone is not None and len(phone) < 7:
            raise ValueError("donor_phone must be at least 7 characters when provided")
        return phone
    if phone is None or len(phone) < 7:
        raise ValueError("donor_phone is required unless donation is anonymous")
    return phone


class DonorBase(BaseModel):
    donor_name: SanitizedStr = Field(..., min_length=2, max_length=140)
    donor_email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    donor_phone: OptionalSanitizedStr = Field(default=None, max_length=20)
    donor_address: OptionalSanitizedStr = Field(default=None, max_length=260)
    donor_pan: Annotated[
        str | None, Field(default=None, pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]$")
    ] = None
    donor_type: DonorType = DonorType.INDIVIDUAL


class DonationBase(DonorBase):
    amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    purpose: DonationPurpose = DonationPurpose.GENERAL
    payment_method: DonationPaymentMethod = DonationPaymentMethod.UPI
    payment_status: DonationPaymentStatus = DonationPaymentStatus.PENDING
    transaction_reference: OptionalSanitizedStr = Field(default=None, max_length=120)
    donation_date: date = Field(default_factory=date.today)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=500)
    gateway_provider: OptionalSanitizedStr = Field(default=None, max_length=40)
    gateway_session_id: OptionalSanitizedStr = Field(default=None, max_length=160)
    gateway_payment_intent: OptionalSanitizedStr = Field(default=None, max_length=160)
    checkout_url: str | None = Field(default=None, max_length=500)
    is_anonymous: bool = False


class DonationCreate(DonationBase):
    @model_validator(mode="after")
    def validate_phone_for_create(self) -> DonationCreate:
        self.donor_phone = _require_phone_unless_anonymous(
            is_anonymous=self.is_anonymous,
            donor_phone=self.donor_phone,
        )
        return self


class PublicDonationCreate(DonorBase):
    """Public donate surface — cannot set payment_status or gateway fields."""

    amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    purpose: DonationPurpose = DonationPurpose.GENERAL
    payment_method: DonationPaymentMethod = DonationPaymentMethod.UPI
    transaction_reference: OptionalSanitizedStr = Field(default=None, max_length=120)
    donation_date: date = Field(default_factory=date.today)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=500)
    is_anonymous: bool = False

    @model_validator(mode="after")
    def validate_public_rules(self) -> PublicDonationCreate:
        self.donor_phone = _require_phone_unless_anonymous(
            is_anonymous=self.is_anonymous,
            donor_phone=self.donor_phone,
        )
        if self.payment_method in UTR_REQUIRED_METHODS:
            if not _normalize_reference(self.transaction_reference):
                raise ValueError(
                    "transaction_reference (UTR) is required for "
                    f"{self.payment_method.value} payments"
                )
        return self

    def to_donation_create(self) -> DonationCreate:
        return DonationCreate(
            **self.model_dump(),
            payment_status=DonationPaymentStatus.PENDING,
            gateway_provider=None,
            gateway_session_id=None,
            gateway_payment_intent=None,
            checkout_url=None,
        )


class DonationUpdate(BaseModel):
    donor_name: SanitizedStr | None = Field(default=None, min_length=2, max_length=140)
    donor_email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    donor_phone: OptionalSanitizedStr = Field(default=None, max_length=20)
    donor_address: OptionalSanitizedStr = Field(default=None, max_length=260)
    donor_pan: Annotated[
        str | None, Field(default=None, pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]$")
    ] = None
    donor_type: DonorType | None = None
    amount: float | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    purpose: DonationPurpose | None = None
    payment_method: DonationPaymentMethod | None = None
    payment_status: DonationPaymentStatus | None = None
    transaction_reference: OptionalSanitizedStr = Field(default=None, max_length=120)
    donation_date: date | None = None
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=500)
    gateway_provider: OptionalSanitizedStr = Field(default=None, max_length=40)
    gateway_session_id: OptionalSanitizedStr = Field(default=None, max_length=160)
    gateway_payment_intent: OptionalSanitizedStr = Field(default=None, max_length=160)
    checkout_url: str | None = Field(default=None, max_length=500)
    is_anonymous: bool | None = None


class DonationMarkPaid(BaseModel):
    transaction_reference: OptionalSanitizedStr = Field(default=None, max_length=120)


class Donation(DonationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    # ORM column is NOT NULL; empty string used when anonymous with no phone.
    donor_phone: str = ""
    receipt_number: str
    receipt_issued: bool = False
    receipt_issued_at: datetime | None = None
    receipt_snapshot: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime


class DonationStatusEvent(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    donation_id: UUID
    from_status: str | None = None
    to_status: str
    transaction_reference: str | None = None
    actor_role: str | None = None
    actor_email: str | None = None
    note: str | None = None
    created_at: datetime


class DonationReceipt(BaseModel):
    receipt_number: str
    issued_at: datetime
    organization: str
    registration_note: str
    donation: Donation


class DonationCheckoutSession(BaseModel):
    donation_id: UUID
    provider: str
    checkout_url: str
    session_id: str
    publishable_key: str | None = None


class DonationListResponse(BaseModel):
    items: list[Donation]
    total: int
    paid: int
    pending: int
    failed: int
    refunded: int
    total_amount: float
