from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies.services import get_enquiry_service
from app.api.v1.endpoints._simple_crud import build_simple_crud_router
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.simple_record import PublicEnquiryCreate, SimpleRecord
from app.services.simple_crud_service import SimpleCrudService

router: APIRouter = build_simple_crud_router(
    prefix="/enquiries",
    tag="enquiries",
    get_service=get_enquiry_service,
)


@router.post(
    "/public", response_model=SimpleRecord, status_code=status.HTTP_201_CREATED
)
@limiter.limit(get_settings().rate_limit_public_write)
async def register_public_enquiry(
    request: Request,
    payload: PublicEnquiryCreate,
    service: SimpleCrudService = Depends(get_enquiry_service),
) -> SimpleRecord:
    return await service.create_record(payload.to_simple_record_create())
