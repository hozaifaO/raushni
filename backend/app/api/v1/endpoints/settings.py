from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import require_admin_access
from app.api.dependencies.services import get_settings_service
from app.constants.roles import UserRole
from app.schemas.settings import (
    PlatformSettings,
    PlatformSettingsUpdate,
    SettingsDashboard,
)
from app.schemas.user import UserAccount, UserAccountUpdate
from app.services.settings_service import SettingsService, UserAccountNotFoundError

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsDashboard)
async def get_settings(
    service: SettingsService = Depends(get_settings_service),
) -> SettingsDashboard:
    return await service.get_settings()


@router.patch("/platform", response_model=PlatformSettings)
async def update_platform_settings(
    payload: PlatformSettingsUpdate,
    _role: UserRole = Depends(require_admin_access),
    service: SettingsService = Depends(get_settings_service),
) -> PlatformSettings:
    return await service.update_platform(payload)


@router.patch("/users/{user_id}", response_model=UserAccount)
async def update_user_account(
    user_id: UUID,
    payload: UserAccountUpdate,
    _role: UserRole = Depends(require_admin_access),
    service: SettingsService = Depends(get_settings_service),
) -> UserAccount:
    try:
        return await service.update_user(user_id, payload)
    except UserAccountNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
