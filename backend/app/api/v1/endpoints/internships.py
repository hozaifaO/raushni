from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse

from app.api.dependencies.auth import require_write_access
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


def get_internship_service(request: Request) -> InternshipService:
    return request.app.state.internship_service


@router.get("", response_model=InternshipListResponse)
def list_internships(
    search: str | None = None,
    status_filter: InternshipApplicationStatus | None = None,
    service: InternshipService = Depends(get_internship_service),
) -> InternshipListResponse:
    return service.list_dashboard(search=search, application_status=status_filter)


@router.get("/public", response_model=list[InternshipAnnouncement])
def list_public_internships(
    service: InternshipService = Depends(get_internship_service),
) -> list[InternshipAnnouncement]:
    return service.list_public_announcements()


@router.post("/announcements", response_model=InternshipAnnouncement, status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: InternshipAnnouncementCreate,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipAnnouncement:
    return service.create_announcement(payload)


@router.patch("/announcements/{announcement_id}", response_model=InternshipAnnouncement)
def update_announcement(
    announcement_id: UUID,
    payload: InternshipAnnouncementUpdate,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipAnnouncement:
    try:
        return service.update_announcement(announcement_id, payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/applications", response_model=InternshipApplication, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: InternshipApplicationCreate,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipApplication:
    try:
        return service.register_application(payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/applications/public", response_model=InternshipApplication, status_code=status.HTTP_201_CREATED)
def register_public_application(
    payload: InternshipApplicationCreate,
    service: InternshipService = Depends(get_internship_service),
) -> InternshipApplication:
    public_payload = payload.model_copy(update={"status": InternshipApplicationStatus.REGISTERED})
    try:
        return service.register_application(public_payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/applications/{application_id}", response_model=InternshipApplication)
def update_application(
    application_id: UUID,
    payload: InternshipApplicationUpdate,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipApplication:
    try:
        return service.update_application(application_id, payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/applications/{application_id}/certificate", response_model=InternshipCertificate)
def issue_certificate(
    application_id: UUID,
    payload: InternshipCertificateIssueRequest,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> InternshipCertificate:
    try:
        return service.issue_certificate(application_id, payload)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InternshipCertificateUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/certificates/{verification_code}", response_model=InternshipCertificate)
def verify_certificate(
    verification_code: str,
    service: InternshipService = Depends(get_internship_service),
) -> InternshipCertificate:
    try:
        return service.verify_certificate(verification_code)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/certificates/{verification_code}/html", response_class=HTMLResponse)
def certificate_html(
    verification_code: str,
    service: InternshipService = Depends(get_internship_service),
) -> HTMLResponse:
    try:
        certificate = service.verify_certificate(verification_code)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return HTMLResponse(certificate.html_template)


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: UUID,
    _role: object = Depends(require_write_access),
    service: InternshipService = Depends(get_internship_service),
) -> Response:
    try:
        service.delete_application(application_id)
    except InternshipNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
