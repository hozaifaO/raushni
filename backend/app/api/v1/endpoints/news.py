from app.api.dependencies.services import get_news_service
from app.api.v1.endpoints._simple_crud import build_simple_crud_router


router = build_simple_crud_router(
    prefix="/news",
    tag="news",
    get_service=get_news_service,
)
