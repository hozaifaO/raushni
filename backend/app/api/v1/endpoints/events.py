from app.api.dependencies.services import get_event_service
from app.api.v1.endpoints._simple_crud import build_simple_crud_router

router = build_simple_crud_router(
    prefix="/events",
    tag="events",
    get_service=get_event_service,
)
