from __future__ import annotations

from fastapi import APIRouter, Depends, Header

from app.api.dependencies.auth import get_current_role
from app.api.dependencies.services import get_settings_service
from app.constants.roles import UserRole
from app.schemas.settings import AccountProfile
from app.services.settings_service import SettingsService


router = APIRouter(prefix="/account", tags=["account"])


@router.get("/profile", response_model=AccountProfile)
async def get_profile(
    role: UserRole = Depends(get_current_role),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    service: SettingsService = Depends(get_settings_service),
) -> AccountProfile:
    return await service.get_profile(role=role, email=x_user_email)
