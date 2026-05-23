from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DesignationStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"


class DesignationLevel(StrEnum):
    BOARD = "board"
    LEADERSHIP = "leadership"
    MANAGEMENT = "management"
    COORDINATION = "coordination"
    FIELD = "field"
    VOLUNTEER = "volunteer"
    INTERN = "intern"


class DesignationBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    code: str = Field(..., min_length=2, max_length=30)
    department: str = Field(..., min_length=2, max_length=80)
    level: DesignationLevel = DesignationLevel.VOLUNTEER
    status: DesignationStatus = DesignationStatus.ACTIVE
    reports_to: str | None = Field(default=None, max_length=120)
    description: str = Field(..., min_length=10, max_length=700)
    assignment_scope: str = Field(..., min_length=4, max_length=160)
    responsibilities: list[str] = Field(default_factory=list, max_length=12)
    required_documents: list[str] = Field(default_factory=list, max_length=12)
    staff_assigned: int = Field(default=0, ge=0)
    volunteer_slots: int = Field(default=0, ge=0)
    sort_order: int = Field(default=0, ge=0)
    cms_slug: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=500)


class DesignationCreate(DesignationBase):
    pass


class DesignationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=120)
    code: str | None = Field(default=None, min_length=2, max_length=30)
    department: str | None = Field(default=None, min_length=2, max_length=80)
    level: DesignationLevel | None = None
    status: DesignationStatus | None = None
    reports_to: str | None = Field(default=None, max_length=120)
    description: str | None = Field(default=None, min_length=10, max_length=700)
    assignment_scope: str | None = Field(default=None, min_length=4, max_length=160)
    responsibilities: list[str] | None = Field(default=None, max_length=12)
    required_documents: list[str] | None = Field(default=None, max_length=12)
    staff_assigned: int | None = Field(default=None, ge=0)
    volunteer_slots: int | None = Field(default=None, ge=0)
    sort_order: int | None = Field(default=None, ge=0)
    cms_slug: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=500)


class Designation(DesignationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class DesignationListResponse(BaseModel):
    items: list[Designation]
    total: int
    active: int
    inactive: int
    archived: int
    assigned_staff: int
    open_slots: int
