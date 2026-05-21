from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.dependencies.auth import require_admin_access
from app.constants.roles import UserRole
from app.schemas.settings import PlatformSettings, PlatformSettingsUpdate, SettingsDashboard
from app.schemas.user import UserAccount, UserAccountUpdate
from app.services.settings_service import SettingsService, UserAccountNotFoundError


router = APIRouter(prefix="/settings", tags=["settings"])


def get_settings_service(request: Request) -> SettingsService:
    return request.app.state.settings_service


@router.get("", response_model=SettingsDashboard)
def get_settings(
    service: SettingsService = Depends(get_settings_service),
) -> SettingsDashboard:
    return service.get_settings()


@router.patch("/platform", response_model=PlatformSettings)
def update_platform_settings(
    payload: PlatformSettingsUpdate,
    _role: UserRole = Depends(require_admin_access),
    service: SettingsService = Depends(get_settings_service),
) -> PlatformSettings:
    return service.update_platform(payload)


@router.patch("/users/{user_id}", response_model=UserAccount)
def update_user_account(
    user_id: UUID,
    payload: UserAccountUpdate,
    _role: UserRole = Depends(require_admin_access),
    service: SettingsService = Depends(get_settings_service),
) -> UserAccount:
    try:
        return service.update_user(user_id, payload)
    except UserAccountNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
