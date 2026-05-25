from __future__ import annotations

import os
import json
import time
from typing import Any
from urllib.request import urlopen

from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

from app.constants.roles import UserRole, can_write, normalize_role


READ_ONLY_MESSAGE = "Guest users have read-only access."
_JWKS_CACHE: dict[str, Any] = {"expires_at": 0, "keys": []}


def _auth_required() -> bool:
    return os.getenv("REQUIRE_AUTH", "false").lower() == "true"


def _oidc_issuer() -> str | None:
    return os.getenv("OIDC_ISSUER") or os.getenv("KEYCLOAK_ISSUER")


def _oidc_audience() -> str | None:
    return os.getenv("OIDC_AUDIENCE") or os.getenv("KEYCLOAK_CLIENT_ID") or "raushni-frontend"


def _verify_audience() -> bool:
    return os.getenv("OIDC_VERIFY_AUDIENCE", "false").lower() == "true"


def _load_jwks() -> list[dict[str, Any]]:
    issuer = _oidc_issuer()
    if not issuer:
        return []
    now = time.time()
    if _JWKS_CACHE["expires_at"] > now:
        return _JWKS_CACHE["keys"]
    with urlopen(f"{issuer.rstrip('/')}/protocol/openid-connect/certs", timeout=5) as response:
        payload = json.loads(response.read().decode("utf-8"))
    _JWKS_CACHE["keys"] = payload.get("keys", [])
    _JWKS_CACHE["expires_at"] = now + 300
    return _JWKS_CACHE["keys"]


def _decode_bearer_token(authorization: str | None) -> dict[str, Any] | None:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header.")

    issuer = _oidc_issuer()
    audience = _oidc_audience() if _verify_audience() else None
    if not issuer:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="OIDC issuer is not configured.")

    try:
        header = jwt.get_unverified_header(token)
        key = next((item for item in _load_jwks() if item.get("kid") == header.get("kid")), None)
        if key is None:
            raise JWTError("Signing key not found")
        return jwt.decode(
            token,
            key,
            algorithms=[header.get("alg", "RS256")],
            audience=audience,
            issuer=issuer.rstrip("/"),
            options={"verify_aud": _verify_audience()},
        )
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token.") from exc


def _role_from_claims(claims: dict[str, Any] | None) -> UserRole | None:
    if not claims:
        return None
    roles: list[str] = []
    realm_roles = claims.get("realm_access", {}).get("roles", [])
    if isinstance(realm_roles, list):
        roles.extend(str(role) for role in realm_roles)
    resource_access = claims.get("resource_access", {})
    if isinstance(resource_access, dict):
        for client in resource_access.values():
            client_roles = client.get("roles", []) if isinstance(client, dict) else []
            if isinstance(client_roles, list):
                roles.extend(str(role) for role in client_roles)
    for role in roles:
        normalized = normalize_role(role)
        if normalized == UserRole.ADMIN:
            return normalized
    for role in roles:
        normalized = normalize_role(role)
        if normalized == UserRole.STAFF:
            return normalized
    return UserRole.GUEST


def get_current_role(
    authorization: str | None = Header(default=None),
    x_user_role: str | None = Header(default=None),
) -> UserRole:
    token_role = _role_from_claims(_decode_bearer_token(authorization))
    if token_role is not None:
        return token_role
    if _auth_required():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication is required.")
    return normalize_role(x_user_role)


def require_write_access(
    authorization: str | None = Header(default=None),
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
) -> UserRole:
    role = get_current_role(authorization=authorization, x_user_role=x_user_role)
    if not can_write(role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=READ_ONLY_MESSAGE,
        )
    return role


def require_admin_access(
    authorization: str | None = Header(default=None),
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
) -> UserRole:
    role = get_current_role(authorization=authorization, x_user_role=x_user_role)
    if role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access is required.",
        )
    return role
