from app.api.dependencies.services import get_beneficiary_service
from app.api.v1.endpoints._simple_crud import build_simple_crud_router


router = build_simple_crud_router(
    prefix="/beneficiaries",
    tag="beneficiaries",
    get_service=get_beneficiary_service,
)
