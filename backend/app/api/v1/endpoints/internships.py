from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import HTMLResponse

from app.api.dependencies.auth import require_write_access
from app.api.dependencies.services import get_internship_service
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.internship import (
    InternshipAnnouncement,
    InternshipAnnouncementCreate,
    InternshipAnnouncementUpdate,
    InternshipApplication,
    InternshipApplicationCreate,
    InternshipApplicationStatus,
    InternshipApplicationUpdate,
    InternshipCertificate,
    InternshipCertificateIssueRequest,
    InternshipListResponse,
)
from app.services.internship_service import (
    InternshipCertificateUnavailableError,
    InternshipNotFoundError,
    InternshipService,
)


router = APIRouter(prefix="/internships", tags=["internships"])


@router.get("", response_model=InternshipListResponse)
async def list_internships(
    search: str | None = Query(default=None, max_length=80),
    status_filter: InternshipApplicationStatus | None = None,
    service: InternshipService = Depends(get_internship_service),
) -> InternshipListResponse:
    return await service.list_dashboard(search=search, application_status=status_filter)


@router.get("/public", response_model=list[InternshipAnnouncement])
async def list_public_internships(
    service: InternshipService = Depends(get_internship_service),
) -> list[InternshipAnnouncement]:
    return await service.list_public_announcements()


@router.post("/announcements", response_model=InternshipAnnouncement, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    payload: InternshipAnnouncementCreate,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipAnnouncement:
    return await service.create_announcement(payload)


@router.patch("/announcements/{announcement_id}", response_model=InternshipAnnouncement)
async def update_announcement(
    announcement_id: UUID,
    payload: InternshipAnnouncementUpdate,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipAnnouncement:
    try:
        return await service.update_announcement(announcement_id, payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/applications", response_model=InternshipApplication, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: InternshipApplicationCreate,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipApplication:
    try:
        return await service.register_application(payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/applications/public", response_model=InternshipApplication, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_settings().rate_limit_public_write)
async def register_public_application(
    request: Request,
    payload: InternshipApplicationCreate,
    service: InternshipService = Depends(get_internship_service),
) -> InternshipApplication:
    public_payload = payload.model_copy(update={"status": InternshipApplicationStatus.REGISTERED})
    try:
        return await service.register_application(public_payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/applications/{application_id}", response_model=InternshipApplication)
async def update_application(
    application_id: UUID,
    payload: InternshipApplicationUpdate,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipApplication:
    try:
        return await service.update_application(application_id, payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/applications/{application_id}/certificate", response_model=InternshipCertificate)
async def issue_certificate(
    application_id: UUID,
    payload: InternshipCertificateIssueRequest,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipCertificate:
    try:
        return await service.issue_certificate(application_id, payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InternshipCertificateUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/certificates/{verification_code}", response_model=InternshipCertificate)
async def verify_certificate(
    verification_code: str,
    service: InternshipService = Depends(get_internship_service),
) -> InternshipCertificate:
    try:
        return await service.verify_certificate(verification_code)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/certificates/{verification_code}/html", response_class=HTMLResponse)
async def certificate_html(
    verification_code: str,
    service: InternshipService = Depends(get_internship_service),
) -> HTMLResponse:
    try:
        certificate = await service.verify_certificate(verification_code)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return HTMLResponse(certificate.html_template)


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: UUID,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> Response:
    try:
        await service.delete_application(application_id)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
