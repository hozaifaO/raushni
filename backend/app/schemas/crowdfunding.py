from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


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


class CampaignBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=180)
    slug: str = Field(..., min_length=3, max_length=140)
    summary: str = Field(..., min_length=10, max_length=900)
    category: CampaignCategory = CampaignCategory.EDUCATION
    status: CampaignStatus = CampaignStatus.DRAFT
    target_amount: float = Field(..., ge=1)
    amount_raised: float = Field(default=0, ge=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    start_date: date
    end_date: date
    location: str = Field(default="India", min_length=2, max_length=180)
    beneficiary_count: int = Field(default=0, ge=0)
    cover_image_url: str | None = Field(default=None, max_length=400)
    public_url: str | None = Field(default=None, max_length=400)
    cms_slug: str | None = Field(default=None, max_length=160)
    owner: str = Field(default="Fundraising Team", max_length=120)
    highlights: list[str] = Field(default_factory=list)
    impact_metrics: list[str] = Field(default_factory=list)
    notes: str | None = Field(default=None, max_length=1200)


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    slug: str | None = Field(default=None, min_length=3, max_length=140)
    summary: str | None = Field(default=None, min_length=10, max_length=900)
    category: CampaignCategory | None = None
    status: CampaignStatus | None = None
    target_amount: float | None = Field(default=None, ge=1)
    amount_raised: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    start_date: date | None = None
    end_date: date | None = None
    location: str | None = Field(default=None, min_length=2, max_length=180)
    beneficiary_count: int | None = Field(default=None, ge=0)
    cover_image_url: str | None = Field(default=None, max_length=400)
    public_url: str | None = Field(default=None, max_length=400)
    cms_slug: str | None = Field(default=None, max_length=160)
    owner: str | None = Field(default=None, max_length=120)
    highlights: list[str] | None = None
    impact_metrics: list[str] | None = None
    notes: str | None = Field(default=None, max_length=1200)


class CampaignDonationCreate(BaseModel):
    donor_name: str = Field(..., min_length=2, max_length=140)
    amount: float = Field(..., gt=0)
    payment_method: str = Field(default="upi", min_length=2, max_length=80)
    receipt_no: str | None = Field(default=None, max_length=80)
    note: str | None = Field(default=None, max_length=500)


class CampaignDonation(BaseModel):
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
