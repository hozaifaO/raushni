from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitize import OptionalFreeTextSanitizedStr, OptionalSanitizedStr, SanitizedStr


class CampaignStatus(StrEnum):
    DRAFT = "draft"
    REVIEW = "review"
    PUBLISHED = "published"
    PAUSED = "paused"
    FUNDED = "funded"
    CLOSED = "closed"


class CampaignCategory(StrEnum):
    EDUCATION = "education"
    HEALTH = "health"
    WATSAN = "watsan"
    RELIEF = "relief"
    LIVELIHOOD = "livelihood"
    OTHER = "other"


BoundedItem = Annotated[str, Field(max_length=400)]


class CampaignBase(BaseModel):
    title: SanitizedStr = Field(..., min_length=3, max_length=180)
    slug: SanitizedStr = Field(..., min_length=3, max_length=140)
    summary: SanitizedStr = Field(..., min_length=10, max_length=900)
    category: CampaignCategory = CampaignCategory.EDUCATION
    status: CampaignStatus = CampaignStatus.DRAFT
    target_amount: float = Field(..., ge=1)
    amount_raised: float = Field(default=0, ge=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    start_date: date
    end_date: date
    location: SanitizedStr = Field(default="India", min_length=2, max_length=180)
    beneficiary_count: int = Field(default=0, ge=0)
    cover_image_url: OptionalSanitizedStr = Field(default=None, max_length=400)
    public_url: OptionalSanitizedStr = Field(default=None, max_length=400)
    cms_slug: OptionalSanitizedStr = Field(default=None, max_length=160)
    owner: SanitizedStr = Field(default="Fundraising Team", max_length=120)
    highlights: list[BoundedItem] = Field(default_factory=list, max_length=20)
    impact_metrics: list[BoundedItem] = Field(default_factory=list, max_length=20)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=1200)


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(BaseModel):
    title: SanitizedStr | None = Field(default=None, min_length=3, max_length=180)
    slug: SanitizedStr | None = Field(default=None, min_length=3, max_length=140)
    summary: SanitizedStr | None = Field(default=None, min_length=10, max_length=900)
    category: CampaignCategory | None = None
    status: CampaignStatus | None = None
    target_amount: float | None = Field(default=None, ge=1)
    amount_raised: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    start_date: date | None = None
    end_date: date | None = None
    location: SanitizedStr | None = Field(default=None, min_length=2, max_length=180)
    beneficiary_count: int | None = Field(default=None, ge=0)
    cover_image_url: OptionalSanitizedStr = Field(default=None, max_length=400)
    public_url: OptionalSanitizedStr = Field(default=None, max_length=400)
    cms_slug: OptionalSanitizedStr = Field(default=None, max_length=160)
    owner: SanitizedStr | None = Field(default=None, max_length=120)
    highlights: list[BoundedItem] | None = Field(default=None, max_length=20)
    impact_metrics: list[BoundedItem] | None = Field(default=None, max_length=20)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=1200)


class CampaignDonationCreate(BaseModel):
    donor_name: SanitizedStr = Field(..., min_length=2, max_length=140)
    amount: float = Field(..., gt=0)
    payment_method: SanitizedStr = Field(default="upi", min_length=2, max_length=80)
    receipt_no: OptionalSanitizedStr = Field(default=None, max_length=80)
    note: OptionalFreeTextSanitizedStr = Field(default=None, max_length=500)


class CampaignDonation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    campaign_id: UUID
    donor_name: str
    amount: float
    payment_method: str
    receipt_no: str | None
    note: str | None
    created_at: datetime


class Campaign(CampaignBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    progress_percent: int
    remaining_amount: float
    donation_count: int
    created_at: datetime
    updated_at: datetime


class CampaignListResponse(BaseModel):
    items: list[Campaign]
    total: int
    draft: int
    published: int
    funded: int
    total_target: float
    total_raised: float
    overall_progress_percent: int
