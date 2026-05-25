from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    account,
    crowdfunding,
    dashboard,
    designations,
    documents,
    donations,
    internships,
    landing,
    members,
    projects,
    settings,
    webhooks,
)


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(account.router)
api_router.include_router(crowdfunding.router)
api_router.include_router(dashboard.router)
api_router.include_router(designations.router)
api_router.include_router(donations.router)
api_router.include_router(documents.router)
api_router.include_router(internships.router)
api_router.include_router(landing.router)
api_router.include_router(members.router)
api_router.include_router(projects.router)
api_router.include_router(settings.router)
api_router.include_router(webhooks.router)
