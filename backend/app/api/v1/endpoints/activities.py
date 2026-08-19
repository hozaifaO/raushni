from app.api.dependencies.services import get_activity_service
from app.api.v1.endpoints._simple_crud import build_simple_crud_router

router = build_simple_crud_router(
    prefix="/activities",
    tag="activities",
    get_service=get_activity_service,
)
