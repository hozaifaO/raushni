from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PlatformSettingsModel(Base):
    """One settings row per organization."""

    __tablename__ = "platform_settings"
    __table_args__ = (
        UniqueConstraint("organization_id", name="uq_platform_settings_organization_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    organization_name: Mapped[str] = mapped_column(String(160), nullable=False)
    support_email: Mapped[str] = mapped_column(String(255), nullable=False)
    cms_url: Mapped[str] = mapped_column(String(180), nullable=False)
    timezone: Mapped[str] = mapped_column(String(80), nullable=False)
    receipt_prefix: Mapped[str] = mapped_column(String(20), nullable=False)
    public_donations_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    maintenance_mode: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    theme_name: Mapped[str] = mapped_column(String(80), nullable=False)
    primary_color: Mapped[str] = mapped_column(String(7), nullable=False)
    accent_color: Mapped[str] = mapped_column(String(7), nullable=False)
    header_theme: Mapped[str] = mapped_column(String(20), nullable=False)
    footer_theme: Mapped[str] = mapped_column(String(20), nullable=False)
    page_background: Mapped[str] = mapped_column(String(7), nullable=False)
    surface_radius: Mapped[str] = mapped_column(String(12), nullable=False)
    logo_diameter: Mapped[str] = mapped_column(String(12), nullable=False)
    public_logo_url: Mapped[str] = mapped_column(String(240), nullable=False)
    stamp_logo_url: Mapped[str] = mapped_column(String(240), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
