from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitize import (
    OptionalFreeTextSanitizedStr,
    OptionalSanitizedStr,
    SanitizedStr,
)


class ProjectStatus(StrEnum):
    DRAFT = "draft"
    PROPOSED = "proposed"
    APPROVED = "approved"
    ACTIVE = "active"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"


class ProjectPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


BoundedItem = Annotated[str, Field(max_length=400)]


class ProjectBase(BaseModel):
    title: SanitizedStr = Field(..., min_length=3, max_length=180)
    slug: SanitizedStr = Field(..., min_length=3, max_length=140)
    summary: SanitizedStr = Field(..., min_length=10, max_length=1200)
    location: SanitizedStr = Field(..., min_length=2, max_length=180)
    focus_area: SanitizedStr = Field(default="Education and WATSAN", max_length=120)
    status: ProjectStatus = ProjectStatus.PROPOSED
    priority: ProjectPriority = ProjectPriority.HIGH
    start_date: date
    end_date: date
    budget: float = Field(..., ge=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    beneficiaries: int = Field(default=0, ge=0)
    schools_targeted: int = Field(default=0, ge=0)
    progress: int = Field(default=0, ge=0, le=100)
    manager: SanitizedStr = Field(default="Project Manager", max_length=120)
    donor: OptionalSanitizedStr = Field(default=None, max_length=160)
    proposal_url: OptionalSanitizedStr = Field(default=None, max_length=300)
    cms_slug: OptionalSanitizedStr = Field(default=None, max_length=160)
    objectives: list[BoundedItem] = Field(default_factory=list, max_length=20)
    milestones: list[BoundedItem] = Field(default_factory=list, max_length=20)
    risks: list[BoundedItem] = Field(default_factory=list, max_length=20)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=1200)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: SanitizedStr | None = Field(default=None, min_length=3, max_length=180)
    slug: SanitizedStr | None = Field(default=None, min_length=3, max_length=140)
    summary: SanitizedStr | None = Field(default=None, min_length=10, max_length=1200)
    location: SanitizedStr | None = Field(default=None, min_length=2, max_length=180)
    focus_area: SanitizedStr | None = Field(default=None, max_length=120)
    status: ProjectStatus | None = None
    priority: ProjectPriority | None = None
    start_date: date | None = None
    end_date: date | None = None
    budget: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    beneficiaries: int | None = Field(default=None, ge=0)
    schools_targeted: int | None = Field(default=None, ge=0)
    progress: int | None = Field(default=None, ge=0, le=100)
    manager: SanitizedStr | None = Field(default=None, max_length=120)
    donor: OptionalSanitizedStr = Field(default=None, max_length=160)
    proposal_url: OptionalSanitizedStr = Field(default=None, max_length=300)
    cms_slug: OptionalSanitizedStr = Field(default=None, max_length=160)
    objectives: list[BoundedItem] | None = Field(default=None, max_length=20)
    milestones: list[BoundedItem] | None = Field(default=None, max_length=20)
    risks: list[BoundedItem] | None = Field(default=None, max_length=20)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=1200)


class Project(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class ProjectListResponse(BaseModel):
    items: list[Project]
    total: int
    proposed: int
    active: int
    completed: int
    total_budget: float
    total_beneficiaries: int
