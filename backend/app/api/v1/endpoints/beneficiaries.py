from app.api.v1.endpoints._simple_crud import build_simple_crud_router


router = build_simple_crud_router(prefix="/beneficiaries", tag="beneficiaries", state_key="beneficiary_service")
