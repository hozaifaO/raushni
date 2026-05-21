from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Request

from app.api.dependencies.auth import get_current_role
from app.constants.roles import UserRole
from app.schemas.settings import AccountProfile
from app.services.settings_service import SettingsService


router = APIRouter(prefix="/account", tags=["account"])


def get_settings_service(request: Request) -> SettingsService:
    return request.app.state.settings_service


@router.get("/profile", response_model=AccountProfile)
def get_profile(
    role: UserRole = Depends(get_current_role),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    service: SettingsService = Depends(get_settings_service),
) -> AccountProfile:
    return service.get_profile(role=role, email=x_user_email)
