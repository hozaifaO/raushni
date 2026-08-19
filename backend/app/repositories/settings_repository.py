from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.settings import PlatformSettingsModel
from app.schemas.settings import PlatformSettings, PlatformSettingsUpdate

_DEFAULTS = PlatformSettings()


class PlatformSettingsRepository:
    def __init__(self, session: AsyncSession, *, organization_id: uuid.UUID) -> None:
        self._session = session
        self._organization_id = organization_id

    async def get_or_create(
        self, *, default_organization_name: str | None = None
    ) -> PlatformSettingsModel:
        result = await self._session.execute(
            select(PlatformSettingsModel).where(
                PlatformSettingsModel.organization_id == self._organization_id
            )
        )
        row = result.scalar_one_or_none()
        if row is not None:
            return row
        now = datetime.now(timezone.utc)
        next_id_result = await self._session.execute(
            select(func.coalesce(func.max(PlatformSettingsModel.id), 0))
        )
        next_id = int(next_id_result.scalar_one()) + 1
        org_name = (
            default_organization_name or ""
        ).strip() or _DEFAULTS.organization_name
        row = PlatformSettingsModel(
            id=next_id,
            organization_id=self._organization_id,
            organization_name=org_name,
            support_email=_DEFAULTS.support_email,
            cms_url=_DEFAULTS.cms_url,
            timezone=_DEFAULTS.timezone,
            receipt_prefix=_DEFAULTS.receipt_prefix,
            public_donations_enabled=_DEFAULTS.public_donations_enabled,
            maintenance_mode=_DEFAULTS.maintenance_mode,
            theme_name=_DEFAULTS.theme_name,
            primary_color=_DEFAULTS.primary_color,
            accent_color=_DEFAULTS.accent_color,
            header_theme=_DEFAULTS.header_theme,
            footer_theme=_DEFAULTS.footer_theme,
            page_background=_DEFAULTS.page_background,
            surface_radius=_DEFAULTS.surface_radius,
            logo_diameter=_DEFAULTS.logo_diameter,
            public_logo_url=_DEFAULTS.public_logo_url,
            stamp_logo_url=_DEFAULTS.stamp_logo_url,
            updated_at=now,
        )
        self._session.add(row)
        await self._session.flush()
        await self._session.refresh(row)
        return row

    async def update(
        self,
        payload: PlatformSettingsUpdate,
        *,
        default_organization_name: str | None = None,
    ) -> PlatformSettingsModel:
        row = await self.get_or_create(
            default_organization_name=default_organization_name
        )
        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            setattr(row, key, value)
        row.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(row)
        return row
