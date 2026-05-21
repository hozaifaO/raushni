from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import dashboard, donations, landing, members


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(dashboard.router)
api_router.include_router(donations.router)
api_router.include_router(landing.router)
api_router.include_router(members.router)
