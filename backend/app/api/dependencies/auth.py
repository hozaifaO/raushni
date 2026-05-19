from __future__ import annotations

from fastapi import Header, HTTPException, status

from app.constants.roles import UserRole, can_write, normalize_role


READ_ONLY_MESSAGE = "Guest users have read-only access."


def get_current_role(x_user_role: str | None = Header(default=None)) -> UserRole:
    return normalize_role(x_user_role)


def require_write_access(
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
) -> UserRole:
    role = normalize_role(x_user_role)
    if not can_write(role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=READ_ONLY_MESSAGE,
        )
    return role
