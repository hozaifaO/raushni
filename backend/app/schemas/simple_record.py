from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitize import (
    OptionalFreeTextSanitizedStr,
    OptionalSanitizedStr,
    SanitizedStr,
)


class SimpleRecordStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"


class SimpleRecordBase(BaseModel):
    title: SanitizedStr = Field(..., min_length=2, max_length=180)
    category: SanitizedStr = Field(default="general", min_length=2, max_length=80)
    summary: SanitizedStr = Field(..., min_length=5, max_length=1200)
    status: SimpleRecordStatus = SimpleRecordStatus.ACTIVE
    record_date: date = Field(default_factory=date.today)
    contact_name: OptionalSanitizedStr = Field(default=None, max_length=140)
    contact_email: str | None = Field(
        default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    )
    amount: float | None = Field(default=None, ge=0)
    location: OptionalSanitizedStr = Field(default=None, max_length=180)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=1200)


class SimpleRecordCreate(SimpleRecordBase):
    pass


class PublicEnquiryCreate(BaseModel):
    """Public contact surface — cannot set status or staff-only fields."""

    contact_name: SanitizedStr = Field(..., min_length=2, max_length=140)
    contact_email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: OptionalSanitizedStr = Field(default=None, max_length=20)
    category: SanitizedStr = Field(default="general", min_length=2, max_length=80)
    summary: SanitizedStr = Field(..., min_length=5, max_length=1200)

    def to_simple_record_create(self) -> SimpleRecordCreate:
        phone = (self.phone or "").strip()
        return SimpleRecordCreate(
            title=f"Enquiry from {self.contact_name}",
            category=self.category,
            summary=self.summary,
            status=SimpleRecordStatus.ACTIVE,
            contact_name=self.contact_name,
            contact_email=self.contact_email,
            notes=f"Phone: {phone}" if phone else None,
        )


class SimpleRecordUpdate(BaseModel):
    title: SanitizedStr | None = Field(default=None, min_length=2, max_length=180)
    category: SanitizedStr | None = Field(default=None, min_length=2, max_length=80)
    summary: SanitizedStr | None = Field(default=None, min_length=5, max_length=1200)
    status: SimpleRecordStatus | None = None
    record_date: date | None = None
    contact_name: OptionalSanitizedStr = Field(default=None, max_length=140)
    contact_email: str | None = Field(
        default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    )
    amount: float | None = Field(default=None, ge=0)
    location: OptionalSanitizedStr = Field(default=None, max_length=180)
    notes: OptionalFreeTextSanitizedStr = Field(default=None, max_length=1200)


class SimpleRecord(SimpleRecordBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    module: str
    created_at: datetime
    updated_at: datetime


class SimpleRecordListResponse(BaseModel):
    items: list[SimpleRecord]
    total: int
    active: int
    published: int
    archived: int
