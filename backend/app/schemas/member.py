from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MemberStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"


class MemberBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str = Field(..., min_length=7, max_length=20)
    role: str = Field(default="Volunteer", min_length=2, max_length=80)
    status: MemberStatus = MemberStatus.ACTIVE
    joined_on: date = Field(default_factory=date.today)
    address: str | None = Field(default=None, max_length=240)
    emergency_contact: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=500)


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str | None = Field(default=None, min_length=7, max_length=20)
    role: str | None = Field(default=None, min_length=2, max_length=80)
    status: MemberStatus | None = None
    joined_on: date | None = None
    address: str | None = Field(default=None, max_length=240)
    emergency_contact: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=500)


class Member(MemberBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class MemberListResponse(BaseModel):
    items: list[Member]
    total: int
    active: int
    inactive: int
    pending: int
