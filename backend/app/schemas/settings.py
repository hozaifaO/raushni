from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.constants.roles import UserRole
from app.schemas.user import UserAccount


class RoleAccess(BaseModel):
    role: UserRole
    label: str
    description: str
    permissions: list[str]
    can_write: bool
    is_admin: bool


class PlatformSettings(BaseModel):
    organization_name: str = "Raushni Educational & Social Welfare Trust"
    support_email: str = "admin@raushni.com"
    cms_url: str = "/cms"
    timezone: str = "Asia/Kolkata"
    receipt_prefix: str = "RSH-DON"
    public_donations_enabled: bool = True
    maintenance_mode: bool = False
    theme_name: str = "Raushni Professional"
    primary_color: str = "#ea580c"
    accent_color: str = "#166534"
    header_theme: str = "dark"
    footer_theme: str = "dark"
    page_background: str = "#f9fafb"
    surface_radius: str = "8px"
    logo_diameter: str = "1.5in"
    public_logo_url: str = "/logo.png"
    stamp_logo_url: str = "/stamplogo.png"


class PlatformSettingsUpdate(BaseModel):
    organization_name: str | None = Field(default=None, min_length=2, max_length=160)
    support_email: str | None = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    cms_url: str | None = Field(default=None, min_length=1, max_length=180)
    timezone: str | None = Field(default=None, min_length=2, max_length=80)
    receipt_prefix: str | None = Field(default=None, min_length=2, max_length=20)
    public_donations_enabled: bool | None = None
    maintenance_mode: bool | None = None
    theme_name: str | None = Field(default=None, min_length=2, max_length=80)
    primary_color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    accent_color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    header_theme: str | None = Field(default=None, pattern=r"^(light|dark|brand)$")
    footer_theme: str | None = Field(default=None, pattern=r"^(light|dark|brand)$")
    page_background: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    surface_radius: str | None = Field(default=None, min_length=2, max_length=12)
    logo_diameter: str | None = Field(default=None, min_length=2, max_length=12)
    public_logo_url: str | None = Field(default=None, min_length=1, max_length=240)
    stamp_logo_url: str | None = Field(default=None, min_length=1, max_length=240)


class AccountProfile(BaseModel):
    user: UserAccount
    permissions: list[str]
    role: RoleAccess
    session_started_at: datetime
    auth_mode: str = "local-dashboard-session"


class SettingsDashboard(BaseModel):
    users: list[UserAccount]
    roles: list[RoleAccess]
    platform: PlatformSettings
    updated_at: datetime
