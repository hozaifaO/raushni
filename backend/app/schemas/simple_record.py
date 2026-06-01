from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SimpleRecordStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"


class SimpleRecordBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=180)
    category: str = Field(default="general", min_length=2, max_length=80)
    summary: str = Field(..., min_length=5, max_length=1200)
    status: SimpleRecordStatus = SimpleRecordStatus.ACTIVE
    record_date: date = Field(default_factory=date.today)
    contact_name: str | None = Field(default=None, max_length=140)
    contact_email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    amount: float | None = Field(default=None, ge=0)
    location: str | None = Field(default=None, max_length=180)
    notes: str | None = Field(default=None, max_length=1200)


class SimpleRecordCreate(SimpleRecordBase):
    pass


class SimpleRecordUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=180)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    summary: str | None = Field(default=None, min_length=5, max_length=1200)
    status: SimpleRecordStatus | None = None
    record_date: date | None = None
    contact_name: str | None = Field(default=None, max_length=140)
    contact_email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    amount: float | None = Field(default=None, ge=0)
    location: str | None = Field(default=None, max_length=180)
    notes: str | None = Field(default=None, max_length=1200)


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
