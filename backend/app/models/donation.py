from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DonationModel(Base):
    __tablename__ = "donations"
    __table_args__ = (
        UniqueConstraint("organization_id", "receipt_number", name="uq_donations_org_receipt_number"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    donor_name: Mapped[str] = mapped_column(String(140), nullable=False)
    donor_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    donor_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    donor_address: Mapped[str | None] = mapped_column(String(260), nullable=True)
    donor_pan: Mapped[str | None] = mapped_column(String(20), nullable=True)
    donor_type: Mapped[str] = mapped_column(String(40), nullable=False, default="individual")
    is_anonymous: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    purpose: Mapped[str] = mapped_column(String(40), nullable=False, default="general")
    payment_method: Mapped[str] = mapped_column(String(40), nullable=False, default="upi")
    payment_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    transaction_reference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    donation_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    gateway_provider: Mapped[str | None] = mapped_column(String(40), nullable=True)
    gateway_session_id: Mapped[str | None] = mapped_column(String(160), nullable=True)
    gateway_payment_intent: Mapped[str | None] = mapped_column(String(160), nullable=True)
    checkout_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    receipt_number: Mapped[str] = mapped_column(String(50), nullable=False)
    receipt_issued: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    receipt_issued_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    receipt_snapshot: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class DonationStatusEventModel(Base):
    __tablename__ = "donation_status_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    donation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("donations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    from_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    to_status: Mapped[str] = mapped_column(String(20), nullable=False)
    transaction_reference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    actor_role: Mapped[str | None] = mapped_column(String(40), nullable=True)
    actor_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


class ReceiptCounterModel(Base):
    __tablename__ = "receipt_counters"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        primary_key=True,
    )
    year: Mapped[int] = mapped_column(primary_key=True)
    last_value: Mapped[int] = mapped_column(nullable=False, default=1000)
