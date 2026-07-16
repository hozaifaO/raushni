from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitize import OptionalFreeTextSanitizedStr, OptionalSanitizedStr, SanitizedStr


class MemberStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"


class MemberBase(BaseModel):
    full_name: SanitizedStr = Field(..., min_length=2, max_length=120)
    email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: SanitizedStr = Field(..., min_length=7, max_length=20)
    role: SanitizedStr = Field(default="Volunteer", min_length=2, max_length=80)
    status: MemberStatus = MemberStatus.ACTIVE
    joined_on: date = Field(default_factory=date.today)
    address: OptionalSanitizedStr = Field(default=None, max_length=240)
    emergency_contact: OptionalSanitizedStr = Field(default=None, max_length=120)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=500)


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    full_name: SanitizedStr | None = Field(default=None, min_length=2, max_length=120)
    email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: SanitizedStr | None = Field(default=None, min_length=7, max_length=20)
    role: SanitizedStr | None = Field(default=None, min_length=2, max_length=80)
    status: MemberStatus | None = None
    joined_on: date | None = None
    address: OptionalSanitizedStr = Field(default=None, max_length=240)
    emergency_contact: OptionalSanitizedStr = Field(default=None, max_length=120)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=500)


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
