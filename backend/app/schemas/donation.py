from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DonationPaymentMethod(StrEnum):
    CASH = "cash"
    UPI = "upi"
    BANK_TRANSFER = "bank_transfer"
    CARD = "card"
    CHEQUE = "cheque"
    ONLINE = "online"


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


class DonorBase(BaseModel):
    donor_name: str = Field(..., min_length=2, max_length=140)
    donor_email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    donor_phone: str = Field(..., min_length=7, max_length=20)
    donor_address: str | None = Field(default=None, max_length=260)
    donor_pan: str | None = Field(default=None, max_length=20)
    donor_type: str = Field(default="individual", max_length=40)


class DonationBase(DonorBase):
    amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    purpose: DonationPurpose = DonationPurpose.GENERAL
    payment_method: DonationPaymentMethod = DonationPaymentMethod.UPI
    payment_status: DonationPaymentStatus = DonationPaymentStatus.PENDING
    transaction_reference: str | None = Field(default=None, max_length=120)
    donation_date: date = Field(default_factory=date.today)
    notes: str | None = Field(default=None, max_length=500)


class DonationCreate(DonationBase):
    pass


class DonationUpdate(BaseModel):
    donor_name: str | None = Field(default=None, min_length=2, max_length=140)
    donor_email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    donor_phone: str | None = Field(default=None, min_length=7, max_length=20)
    donor_address: str | None = Field(default=None, max_length=260)
    donor_pan: str | None = Field(default=None, max_length=20)
    donor_type: str | None = Field(default=None, max_length=40)
    amount: float | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    purpose: DonationPurpose | None = None
    payment_method: DonationPaymentMethod | None = None
    payment_status: DonationPaymentStatus | None = None
    transaction_reference: str | None = Field(default=None, max_length=120)
    donation_date: date | None = None
    notes: str | None = Field(default=None, max_length=500)


class Donation(DonationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    receipt_number: str
    receipt_issued: bool = False
    created_at: datetime
    updated_at: datetime


class DonationReceipt(BaseModel):
    receipt_number: str
    issued_at: datetime
    organization: str
    registration_note: str
    donation: Donation


class DonationListResponse(BaseModel):
    items: list[Donation]
    total: int
    paid: int
    pending: int
    failed: int
    refunded: int
    total_amount: float
