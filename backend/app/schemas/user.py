from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.constants.roles import UserRole


class UserStatus(StrEnum):
    ACTIVE = "active"
    INVITED = "invited"
    SUSPENDED = "suspended"


class UserAccount(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    role: UserRole
    status: UserStatus = UserStatus.ACTIVE
    access_level: str = "read"
    last_login_at: datetime | None = None
    profile_image: str | None = None


class UserAccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    role: UserRole | None = None
    status: UserStatus | None = None
