from __future__ import annotations

import asyncio
import os
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.api.dependencies.auth import (
    EMAIL_REQUIRED_MESSAGE,
    MEMBERSHIP_REQUIRED_MESSAGE,
    READ_ONLY_MESSAGE,
    get_current_role,
    require_service_key,
    resolve_membership_role,
)
from app.constants.roles import UserRole, normalize_role
from app.core.config import get_settings

pytestmark = pytest.mark.unit


def test_normalize_role_aliases() -> None:
    assert normalize_role("administrator") == UserRole.ADMIN
    assert normalize_role("viewer") == UserRole.GUEST
    assert normalize_role("unknown") == UserRole.GUEST


def test_require_service_key_when_auth_required(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("REQUIRE_AUTH", "true")
    monkeypatch.setenv("INTERNAL_API_KEY", "test-internal-api-key")
    get_settings.cache_clear()
    try:
        with pytest.raises(HTTPException) as exc:
            require_service_key(x_api_key=None, authorization=None)
        assert exc.value.status_code == 401

        require_service_key(x_api_key="test-internal-api-key", authorization=None)
        role = get_current_role(
            authorization=None,
            x_api_key="test-internal-api-key",
            x_user_role="ADMIN",
        )
        assert role == UserRole.ADMIN
    finally:
        os.environ["REQUIRE_AUTH"] = "false"
        get_settings.cache_clear()


def test_resolve_membership_role_requires_email() -> None:
    org = SimpleNamespace(id="org-1")
    session = MagicMock()
    with pytest.raises(HTTPException) as exc:
        asyncio.run(
            resolve_membership_role(organization=org, session=session, email=None)
        )
    assert exc.value.status_code == 403
    assert exc.value.detail == EMAIL_REQUIRED_MESSAGE


def test_resolve_membership_role_requires_membership(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    org = SimpleNamespace(id="org-1")
    session = MagicMock()
    repo = MagicMock()
    repo.get_membership_by_email = AsyncMock(return_value=None)
    monkeypatch.setattr(
        "app.api.dependencies.auth.OrganizationRepository",
        lambda _session: repo,
    )

    with pytest.raises(HTTPException) as exc:
        asyncio.run(
            resolve_membership_role(
                organization=org,
                session=session,
                email="outsider@example.com",
            )
        )
    assert exc.value.status_code == 403
    assert exc.value.detail == MEMBERSHIP_REQUIRED_MESSAGE


def test_resolve_membership_role_uses_db_role_not_header(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    org = SimpleNamespace(id="org-1")
    session = MagicMock()
    repo = MagicMock()
    repo.get_membership_by_email = AsyncMock(
        return_value=SimpleNamespace(role="STAFF"),
    )
    monkeypatch.setattr(
        "app.api.dependencies.auth.OrganizationRepository",
        lambda _session: repo,
    )

    role = asyncio.run(
        resolve_membership_role(
            organization=org,
            session=session,
            email="staff@raushni.com",
        )
    )
    assert role == UserRole.STAFF
    assert READ_ONLY_MESSAGE
