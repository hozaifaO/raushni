from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    account,
    activities,
    beneficiaries,
    crowdfunding,
    dashboard,
    designations,
    documents,
    donations,
    enquiries,
    events,
    expenses,
    internships,
    landing,
    members,
    news,
    projects,
    settings,
    webhooks,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(account.router)
api_router.include_router(activities.router)
api_router.include_router(beneficiaries.router)
api_router.include_router(crowdfunding.router)
api_router.include_router(dashboard.router)
api_router.include_router(designations.router)
api_router.include_router(donations.router)
api_router.include_router(documents.router)
api_router.include_router(enquiries.router)
api_router.include_router(events.router)
api_router.include_router(expenses.router)
api_router.include_router(internships.router)
api_router.include_router(landing.router)
api_router.include_router(members.router)
api_router.include_router(news.router)
api_router.include_router(projects.router)
api_router.include_router(settings.router)
api_router.include_router(webhooks.router)
