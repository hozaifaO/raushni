from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends

from app.api.dependencies.auth import get_current_organization
from app.api.dependencies.services import get_settings_service
from app.models.organization import OrganizationModel
from app.services.settings_service import SettingsService


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/status")
async def get_dashboard_status(
    organization: OrganizationModel = Depends(get_current_organization),
    settings_service: SettingsService = Depends(get_settings_service),
) -> dict[str, Any]:
    """Return operational wiring for the current organization's management dashboard."""
    settings = await settings_service.get_settings()
    org_name = settings.platform.organization_name or organization.name
    return {
        "project": organization.slug,
        "organization_id": str(organization.id),
        "tenant_slug": organization.slug,
        "organization_name": org_name,
        "status": "configured",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": [
            {
                "name": "Frontend",
                "status": "configured",
                "path": "/dashboard",
                "description": "Next.js dashboard for operations, modules, public pages, and CMS entry points.",
            },
            {
                "name": "Backend API",
                "status": "configured",
                "path": "/api/v1",
                "description": "FastAPI service exposing profile, settings, and operational APIs.",
            },
            {
                "name": "Strapi CMS",
                "status": "configured",
                "path": "/cms",
                "description": "Content management for landing content, media, stories, and publishing workflows.",
            },
            {
                "name": "Database",
                "status": "configured",
                "path": "postgresql://postgres:5432/raushni_backend",
                "description": "PostgreSQL persistence for members, donations, and operational data (Alembic-managed).",
            },
        ],
        "content": [
            {
                "name": "Profile",
                "source": "FastAPI account session",
                "api": "/api/v1/account/profile",
            },
            {
                "name": "Settings",
                "source": "FastAPI settings dashboard",
                "api": "/api/v1/settings",
            },
            {
                "name": "Landing Page",
                "source": "Strapi tenant-keyed content",
                "api": "/cms/api/landing-page?populate=*",
            },
            {
                "name": "Backend Landing Fallback",
                "source": "FastAPI fallback content",
                "api": "/api/v1/landing",
            },
        ],
        "modules": [
            "members",
            "beneficiaries",
            "donations",
            "crowdfunding",
            "internships",
            "activities",
            "events",
            "projects",
            "expenses",
            "documents",
            "reports",
            "cms",
            "profile",
            "settings",
        ],
    }
