from app.api.dependencies.services import get_expense_service
from app.api.v1.endpoints._simple_crud import build_simple_crud_router


router = build_simple_crud_router(
    prefix="/expenses",
    tag="expenses",
    get_service=get_expense_service,
)
