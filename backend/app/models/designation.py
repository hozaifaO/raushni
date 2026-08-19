from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DesignationModel(Base):
    __tablename__ = "designations"
    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_designations_org_code"),
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
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    department: Mapped[str] = mapped_column(String(80), nullable=False)
    level: Mapped[str] = mapped_column(String(40), nullable=False, default="volunteer")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    reports_to: Mapped[str | None] = mapped_column(String(120), nullable=True)
    description: Mapped[str] = mapped_column(String(700), nullable=False)
    assignment_scope: Mapped[str] = mapped_column(String(160), nullable=False)
    responsibilities: Mapped[list[str]] = mapped_column(
        JSONB, nullable=False, default=list
    )
    required_documents: Mapped[list[str]] = mapped_column(
        JSONB, nullable=False, default=list
    )
    staff_assigned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    volunteer_slots: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cms_slug: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
