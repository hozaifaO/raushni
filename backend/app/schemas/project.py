from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


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


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=180)
    slug: str = Field(..., min_length=3, max_length=140)
    summary: str = Field(..., min_length=10, max_length=1200)
    location: str = Field(..., min_length=2, max_length=180)
    focus_area: str = Field(default="Education and WATSAN", max_length=120)
    status: ProjectStatus = ProjectStatus.PROPOSED
    priority: ProjectPriority = ProjectPriority.HIGH
    start_date: date
    end_date: date
    budget: float = Field(..., ge=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    beneficiaries: int = Field(default=0, ge=0)
    schools_targeted: int = Field(default=0, ge=0)
    progress: int = Field(default=0, ge=0, le=100)
    manager: str = Field(default="Project Manager", max_length=120)
    donor: str | None = Field(default=None, max_length=160)
    proposal_url: str | None = Field(default=None, max_length=300)
    cms_slug: str | None = Field(default=None, max_length=160)
    objectives: list[str] = Field(default_factory=list)
    milestones: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    notes: str | None = Field(default=None, max_length=1200)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    slug: str | None = Field(default=None, min_length=3, max_length=140)
    summary: str | None = Field(default=None, min_length=10, max_length=1200)
    location: str | None = Field(default=None, min_length=2, max_length=180)
    focus_area: str | None = Field(default=None, max_length=120)
    status: ProjectStatus | None = None
    priority: ProjectPriority | None = None
    start_date: date | None = None
    end_date: date | None = None
    budget: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    beneficiaries: int | None = Field(default=None, ge=0)
    schools_targeted: int | None = Field(default=None, ge=0)
    progress: int | None = Field(default=None, ge=0, le=100)
    manager: str | None = Field(default=None, max_length=120)
    donor: str | None = Field(default=None, max_length=160)
    proposal_url: str | None = Field(default=None, max_length=300)
    cms_slug: str | None = Field(default=None, max_length=160)
    objectives: list[str] | None = None
    milestones: list[str] | None = None
    risks: list[str] | None = None
    notes: str | None = Field(default=None, max_length=1200)


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
