from fastapi import APIRouter, Depends, status

from app.api.dependencies.services import get_enquiry_service
from app.api.v1.endpoints._simple_crud import build_simple_crud_router
from app.schemas.simple_record import PublicEnquiryCreate, SimpleRecord
from app.services.simple_crud_service import SimpleCrudService


router: APIRouter = build_simple_crud_router(
    prefix="/enquiries",
    tag="enquiries",
    get_service=get_enquiry_service,
)


@router.post("/public", response_model=SimpleRecord, status_code=status.HTTP_201_CREATED)
async def register_public_enquiry(
    payload: PublicEnquiryCreate,
    service: SimpleCrudService = Depends(get_enquiry_service),
) -> SimpleRecord:
    return await service.create_record(payload.to_simple_record_create())
