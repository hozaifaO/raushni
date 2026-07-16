from __future__ import annotations

import hmac
import os
import uuid

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.roles import UserRole, can_write, normalize_role
from app.core.config import get_settings
from app.core.db import get_db
from app.models.organization import OrganizationModel
from app.repositories.organization_repository import OrganizationRepository


READ_ONLY_MESSAGE = "Guest users have read-only access."


def _auth_required() -> bool:
    return get_settings().require_auth or os.getenv("REQUIRE_AUTH", "false").lower() == "true"


def _configured_api_key() -> str:
    return (get_settings().internal_api_key or os.getenv("INTERNAL_API_KEY", "")).strip()


def _extract_api_key(
    x_api_key: str | None,
    authorization: str | None,
) -> str | None:
    if x_api_key and x_api_key.strip():
        return x_api_key.strip()
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() == "bearer" and token.strip():
        return token.strip()
    return None


def _api_key_valid(provided: str | None) -> bool:
    expected = _configured_api_key()
    if not expected or not provided:
        return False
    return hmac.compare_digest(provided, expected)


def require_service_key(
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    authorization: str | None = Header(default=None),
) -> None:
    """When REQUIRE_AUTH is true, demand a valid INTERNAL_API_KEY."""
    if not _auth_required():
        return
    provided = _extract_api_key(x_api_key, authorization)
    if not _api_key_valid(provided):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid service API key is required.",
        )


async def get_current_organization(
    _service_key: None = Depends(require_service_key),
    session: AsyncSession = Depends(get_db),
    x_tenant_slug: str | None = Header(default=None, alias="X-Tenant-Slug"),
    x_organization_id: str | None = Header(default=None, alias="X-Organization-Id"),
) -> OrganizationModel:
    """
    Resolve the current organization after service-key auth.

    X-Tenant-Slug is always authoritative (falls back to DEFAULT_TENANT_SLUG).
    X-Organization-Id is optional consistency check only — never switches tenants.
    """
    repo = OrganizationRepository(session)
    settings = get_settings()
    slug = (x_tenant_slug or "").strip().lower() or settings.default_tenant_slug

    org = await repo.get_by_slug(slug)
    if org is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization '{slug}' was not found.",
        )

    if x_organization_id and x_organization_id.strip():
        try:
            claimed = uuid.UUID(x_organization_id.strip())
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Organization-Id must be a valid UUID.",
            ) from exc
        if claimed != org.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Organization-Id does not match X-Tenant-Slug.",
            )

    return org


def get_current_role(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
) -> UserRole:
    """
    Resolve caller role.

    - REQUIRE_AUTH=true: INTERNAL_API_KEY required; role comes from X-User-Role
      asserted by the Next.js BFF after getServerSession.
    - REQUIRE_AUTH=false: allow local DX; prefer valid API key when present.
    """
    provided = _extract_api_key(x_api_key, authorization)
    key_ok = _api_key_valid(provided)

    if _auth_required() and not key_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid service API key is required.",
        )

    # With a valid service key, trust BFF-asserted role headers.
    if key_ok:
        return normalize_role(x_user_role)

    # Local-only fallback when REQUIRE_AUTH is false and no key was sent.
    return normalize_role(x_user_role)


def require_write_access(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
) -> UserRole:
    role = get_current_role(
        authorization=authorization,
        x_api_key=x_api_key,
        x_user_role=x_user_role,
    )
    if not can_write(role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=READ_ONLY_MESSAGE,
        )
    return role


def require_admin_access(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
) -> UserRole:
    role = get_current_role(
        authorization=authorization,
        x_api_key=x_api_key,
        x_user_role=x_user_role,
    )
    if role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access is required.",
        )
    return role
