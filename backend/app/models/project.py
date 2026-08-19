from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ProjectModel(Base):
    __tablename__ = "projects"
    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_projects_org_slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), nullable=False)
    summary: Mapped[str] = mapped_column(String(1200), nullable=False)
    location: Mapped[str] = mapped_column(String(180), nullable=False)
    focus_area: Mapped[str] = mapped_column(
        String(120), nullable=False, default="Education and WATSAN"
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="proposed")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="high")
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    budget: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    beneficiaries: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    schools_targeted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    manager: Mapped[str] = mapped_column(
        String(120), nullable=False, default="Project Manager"
    )
    donor: Mapped[str | None] = mapped_column(String(160), nullable=True)
    proposal_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    cms_slug: Mapped[str | None] = mapped_column(String(160), nullable=True)
    objectives: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    milestones: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    risks: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    notes: Mapped[str | None] = mapped_column(String(1200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
