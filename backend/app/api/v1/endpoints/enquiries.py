from app.api.v1.endpoints._simple_crud import build_simple_crud_router


router = build_simple_crud_router(prefix="/enquiries", tag="enquiries", state_key="enquiry_service")
