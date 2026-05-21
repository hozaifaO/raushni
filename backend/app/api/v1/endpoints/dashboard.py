from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/status")
def get_dashboard_status() -> dict[str, Any]:
    """Return operational wiring for the Raushni management dashboard."""
    return {
        "project": "raushni",
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
                "description": "FastAPI service exposing authenticated operational APIs.",
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
                "path": "postgresql://database:5432/raushni",
                "description": "PostgreSQL persistence for platform data and CMS content storage.",
            },
        ],
        "content": [
            {
                "name": "Landing Page",
                "source": "Strapi single type: landing-page",
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
            "settings",
        ],
    }
