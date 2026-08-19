from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class CampaignModel(Base):
    __tablename__ = "campaigns"
    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_campaigns_org_slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), nullable=False)
    summary: Mapped[str] = mapped_column(String(900), nullable=False)
    category: Mapped[str] = mapped_column(
        String(40), nullable=False, default="education"
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    target_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    amount_raised: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=0
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    location: Mapped[str] = mapped_column(String(180), nullable=False, default="India")
    beneficiary_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cover_image_url: Mapped[str | None] = mapped_column(String(400), nullable=True)
    public_url: Mapped[str | None] = mapped_column(String(400), nullable=True)
    cms_slug: Mapped[str | None] = mapped_column(String(160), nullable=True)
    owner: Mapped[str] = mapped_column(
        String(120), nullable=False, default="Fundraising Team"
    )
    highlights: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    impact_metrics: Mapped[list[str]] = mapped_column(
        JSONB, nullable=False, default=list
    )
    notes: Mapped[str | None] = mapped_column(String(1200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class CampaignDonationModel(Base):
    __tablename__ = "campaign_donations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
    )
    donor_name: Mapped[str] = mapped_column(String(140), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(
        String(80), nullable=False, default="upi"
    )
    receipt_no: Mapped[str | None] = mapped_column(String(80), nullable=True)
    note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
