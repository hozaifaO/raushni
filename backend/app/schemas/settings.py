from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.constants.roles import UserRole
from app.core.sanitize import OptionalSanitizedStr, SanitizedStr
from app.schemas.user import UserAccount


class RoleAccess(BaseModel):
    role: UserRole
    label: str
    description: str
    permissions: list[str]
    can_write: bool
    is_admin: bool


class PlatformSettings(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    organization_name: SanitizedStr = "Raushni Educational & Social Welfare Trust"
    support_email: str = "admin@raushni.com"
    cms_url: SanitizedStr = "/cms"
    timezone: SanitizedStr = "Asia/Kolkata"
    receipt_prefix: SanitizedStr = "RSH-DON"
    public_donations_enabled: bool = True
    maintenance_mode: bool = False
    theme_name: SanitizedStr = "Raushni Professional"
    primary_color: str = "#ea580c"
    accent_color: str = "#166534"
    header_theme: str = "dark"
    footer_theme: str = "dark"
    page_background: str = "#f9fafb"
    surface_radius: SanitizedStr = "8px"
    logo_diameter: SanitizedStr = "1.5in"
    public_logo_url: SanitizedStr = "/logo.png"
    stamp_logo_url: SanitizedStr = "/stamplogo.png"


class PlatformSettingsUpdate(BaseModel):
    organization_name: SanitizedStr | None = Field(default=None, min_length=2, max_length=160)
    support_email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    cms_url: SanitizedStr | None = Field(default=None, min_length=1, max_length=180)
    timezone: SanitizedStr | None = Field(default=None, min_length=2, max_length=80)
    receipt_prefix: SanitizedStr | None = Field(default=None, min_length=2, max_length=20)
    public_donations_enabled: bool | None = None
    maintenance_mode: bool | None = None
    theme_name: SanitizedStr | None = Field(default=None, min_length=2, max_length=80)
    primary_color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    accent_color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    header_theme: str | None = Field(default=None, pattern=r"^(light|dark|brand)$")
    footer_theme: str | None = Field(default=None, pattern=r"^(light|dark|brand)$")
    page_background: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    surface_radius: SanitizedStr | None = Field(default=None, min_length=2, max_length=12)
    logo_diameter: SanitizedStr | None = Field(default=None, min_length=2, max_length=12)
    public_logo_url: OptionalSanitizedStr = Field(default=None, min_length=1, max_length=240)
    stamp_logo_url: OptionalSanitizedStr = Field(default=None, min_length=1, max_length=240)


class AccountProfile(BaseModel):
    user: UserAccount
    permissions: list[str]
    role: RoleAccess
    session_started_at: datetime
    auth_mode: str = "local-dashboard-session"
    organization_id: UUID | None = None
    tenant_slug: str | None = None
    organization_name: str | None = None


class SettingsDashboard(BaseModel):
    users: list[UserAccount]
    roles: list[RoleAccess]
    platform: PlatformSettings
    updated_at: datetime
    organization_id: UUID | None = None
    tenant_slug: str | None = None
    organization_name: str | None = None
