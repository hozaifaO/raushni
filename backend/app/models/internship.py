from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class InternshipAnnouncementModel(Base):
    __tablename__ = "internship_announcements"
    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_internship_announcements_org_slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), nullable=False)
    summary: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(String(1600), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    registration_deadline: Mapped[date] = mapped_column(Date, nullable=False)
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    event_time: Mapped[str] = mapped_column(String(40), nullable=False, default="01:00 PM")
    location: Mapped[str] = mapped_column(String(160), nullable=False, default="Web/Virtual, India")
    mode: Mapped[str] = mapped_column(String(20), nullable=False, default="virtual")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="published")
    poster_url: Mapped[str] = mapped_column(String(260), nullable=False)
    apply_url: Mapped[str] = mapped_column(String(160), nullable=False)
    github_url: Mapped[str] = mapped_column(String(260), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    benefits: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    tracks: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    eligibility: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class InternshipApplicationModel(Base):
    __tablename__ = "internship_applications"
    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "registration_number",
            name="uq_internship_applications_org_registration_number",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    announcement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("internship_announcements.id", ondelete="CASCADE"), nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(140), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    college: Mapped[str] = mapped_column(String(160), nullable=False)
    course: Mapped[str] = mapped_column(String(160), nullable=False)
    track: Mapped[str] = mapped_column(String(120), nullable=False)
    github_url: Mapped[str | None] = mapped_column(String(260), nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(String(260), nullable=True)
    motivation: Mapped[str] = mapped_column(String(1000), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="registered")
    completion_notes: Mapped[str | None] = mapped_column(String(800), nullable=True)
    registration_number: Mapped[str] = mapped_column(String(50), nullable=False)
    certificate_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class InternshipCertificateModel(Base):
    __tablename__ = "internship_certificates"
    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "certificate_number",
            name="uq_internship_certificates_org_certificate_number",
        ),
        UniqueConstraint(
            "organization_id",
            "verification_code",
            name="uq_internship_certificates_org_verification_code",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("internship_applications.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    certificate_number: Mapped[str] = mapped_column(String(50), nullable=False)
    verification_code: Mapped[str] = mapped_column(String(50), nullable=False)
    verification_url: Mapped[str] = mapped_column(String(400), nullable=False)
    participant_name: Mapped[str] = mapped_column(String(140), nullable=False)
    program_title: Mapped[str] = mapped_column(String(160), nullable=False)
    track: Mapped[str] = mapped_column(String(120), nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="issued")
    qr_code_svg: Mapped[str] = mapped_column(Text, nullable=False)
    html_template: Mapped[str] = mapped_column(Text, nullable=False)


class InternshipCounterModel(Base):
    __tablename__ = "internship_counters"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        primary_key=True,
    )
    kind: Mapped[str] = mapped_column(String(20), primary_key=True)
    year: Mapped[int] = mapped_column(Integer, primary_key=True)
    last_value: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
