from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class InternshipMode(StrEnum):
    VIRTUAL = "virtual"
    HYBRID = "hybrid"
    IN_PERSON = "in_person"


class InternshipStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"


class InternshipApplicationStatus(StrEnum):
    REGISTERED = "registered"
    SHORTLISTED = "shortlisted"
    ACTIVE = "active"
    COMPLETED = "completed"
    REJECTED = "rejected"


class CertificateStatus(StrEnum):
    DRAFT = "draft"
    ISSUED = "issued"
    REVOKED = "revoked"


class InternshipAnnouncementBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=160)
    slug: str = Field(..., min_length=3, max_length=120)
    summary: str = Field(..., min_length=10, max_length=500)
    description: str = Field(..., min_length=20, max_length=1600)
    start_date: date
    end_date: date
    registration_deadline: date
    event_date: date
    event_time: str = Field(default="01:00 PM", max_length=40)
    location: str = Field(default="Web/Virtual, India", max_length=160)
    mode: InternshipMode = InternshipMode.VIRTUAL
    status: InternshipStatus = InternshipStatus.PUBLISHED
    poster_url: str = Field(default="/assets/brand/internship-2026.jpg", max_length=260)
    apply_url: str = Field(default="/internships", max_length=160)
    github_url: str = Field(default="https://github.com/owais4u/raushni", max_length=260)
    contact_phone: str = Field(default="+91 7827860062", max_length=30)
    benefits: list[str] = Field(default_factory=list)
    tracks: list[str] = Field(default_factory=list)
    eligibility: list[str] = Field(default_factory=list)


class InternshipAnnouncementCreate(InternshipAnnouncementBase):
    pass


class InternshipAnnouncementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=160)
    slug: str | None = Field(default=None, min_length=3, max_length=120)
    summary: str | None = Field(default=None, min_length=10, max_length=500)
    description: str | None = Field(default=None, min_length=20, max_length=1600)
    start_date: date | None = None
    end_date: date | None = None
    registration_deadline: date | None = None
    event_date: date | None = None
    event_time: str | None = Field(default=None, max_length=40)
    location: str | None = Field(default=None, max_length=160)
    mode: InternshipMode | None = None
    status: InternshipStatus | None = None
    poster_url: str | None = Field(default=None, max_length=260)
    apply_url: str | None = Field(default=None, max_length=160)
    github_url: str | None = Field(default=None, max_length=260)
    contact_phone: str | None = Field(default=None, max_length=30)
    benefits: list[str] | None = None
    tracks: list[str] | None = None
    eligibility: list[str] | None = None


class InternshipAnnouncement(InternshipAnnouncementBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class InternshipApplicationBase(BaseModel):
    announcement_id: UUID
    full_name: str = Field(..., min_length=2, max_length=140)
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str = Field(..., min_length=7, max_length=20)
    city: str = Field(..., min_length=2, max_length=100)
    college: str = Field(..., min_length=2, max_length=160)
    course: str = Field(..., min_length=2, max_length=160)
    track: str = Field(..., min_length=2, max_length=120)
    github_url: str | None = Field(default=None, max_length=260)
    portfolio_url: str | None = Field(default=None, max_length=260)
    motivation: str = Field(..., min_length=20, max_length=1000)
    status: InternshipApplicationStatus = InternshipApplicationStatus.REGISTERED
    completion_notes: str | None = Field(default=None, max_length=800)


class InternshipApplicationCreate(InternshipApplicationBase):
    pass


class InternshipApplicationUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=140)
    email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str | None = Field(default=None, min_length=7, max_length=20)
    city: str | None = Field(default=None, min_length=2, max_length=100)
    college: str | None = Field(default=None, min_length=2, max_length=160)
    course: str | None = Field(default=None, min_length=2, max_length=160)
    track: str | None = Field(default=None, min_length=2, max_length=120)
    github_url: str | None = Field(default=None, max_length=260)
    portfolio_url: str | None = Field(default=None, max_length=260)
    motivation: str | None = Field(default=None, min_length=20, max_length=1000)
    status: InternshipApplicationStatus | None = None
    completion_notes: str | None = Field(default=None, max_length=800)


class InternshipApplication(InternshipApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    registration_number: str
    certificate_id: UUID | None = None
    created_at: datetime
    updated_at: datetime


class InternshipCertificate(BaseModel):
    id: UUID
    application_id: UUID
    certificate_number: str
    verification_code: str
    verification_url: str
    participant_name: str
    program_title: str
    track: str
    issued_at: datetime
    status: CertificateStatus = CertificateStatus.ISSUED
    qr_code_svg: str
    html_template: str


class InternshipCertificateIssueRequest(BaseModel):
    completion_notes: str | None = Field(default=None, max_length=800)


class InternshipListResponse(BaseModel):
    announcements: list[InternshipAnnouncement]
    applications: list[InternshipApplication]
    certificates: list[InternshipCertificate]
    total_announcements: int
    total_applications: int
    registered: int
    active: int
    completed: int
    certificates_issued: int
