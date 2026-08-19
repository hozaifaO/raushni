from __future__ import annotations

from datetime import datetime, timezone
from hashlib import sha256
from html import escape
from io import BytesIO
from urllib.parse import quote
from uuid import UUID, uuid4

try:
    import qrcode
    import qrcode.image.svg
except ModuleNotFoundError:
    qrcode = None

from app.models.internship import InternshipCertificateModel
from app.repositories.internship_repository import InternshipRepository
from app.schemas.internship import (
    CertificateStatus,
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
from app.services.cms_template_service import get_document_template, render_template


class InternshipNotFoundError(LookupError):
    pass


class InternshipCertificateUnavailableError(ValueError):
    pass


class InternshipService:
    def __init__(self, repository: InternshipRepository) -> None:
        self._repository = repository

    async def list_dashboard(
        self,
        *,
        search: str | None = None,
        application_status: InternshipApplicationStatus | None = None,
    ) -> InternshipListResponse:
        applications = await self._repository.list_applications(
            search=search,
            application_status=application_status,
        )
        counts = await self._repository.application_status_counts()
        announcements = await self._repository.list_announcements()
        certificates = await self._repository.list_certificates()
        return InternshipListResponse(
            announcements=[
                InternshipAnnouncement.model_validate(item) for item in announcements
            ],
            applications=[
                InternshipApplication.model_validate(item) for item in applications
            ],
            certificates=[
                InternshipCertificate.model_validate(item) for item in certificates
            ],
            total_announcements=await self._repository.count_announcements(),
            total_applications=await self._repository.count_applications(),
            registered=counts.get(InternshipApplicationStatus.REGISTERED.value, 0),
            active=counts.get(InternshipApplicationStatus.ACTIVE.value, 0),
            completed=counts.get(InternshipApplicationStatus.COMPLETED.value, 0),
            certificates_issued=await self._repository.count_certificates(),
        )

    async def list_public_announcements(self) -> list[InternshipAnnouncement]:
        rows = await self._repository.list_announcements(published_only=True)
        return [InternshipAnnouncement.model_validate(item) for item in rows]

    async def create_announcement(
        self, payload: InternshipAnnouncementCreate
    ) -> InternshipAnnouncement:
        row = await self._repository.create_announcement(payload)
        return InternshipAnnouncement.model_validate(row)

    async def update_announcement(
        self,
        announcement_id: UUID,
        payload: InternshipAnnouncementUpdate,
    ) -> InternshipAnnouncement:
        row = await self._repository.update_announcement(announcement_id, payload)
        if row is None:
            raise InternshipNotFoundError(
                f"Internship announcement {announcement_id} was not found"
            )
        return InternshipAnnouncement.model_validate(row)

    async def get_announcement(self, announcement_id: UUID) -> InternshipAnnouncement:
        row = await self._repository.get_announcement(announcement_id)
        if row is None:
            raise InternshipNotFoundError(
                f"Internship announcement {announcement_id} was not found"
            )
        return InternshipAnnouncement.model_validate(row)

    async def register_application(
        self, payload: InternshipApplicationCreate
    ) -> InternshipApplication:
        if await self._repository.get_announcement(payload.announcement_id) is None:
            raise InternshipNotFoundError(
                f"Internship announcement {payload.announcement_id} was not found"
            )
        registration_number = await self._repository.allocate_counter(
            "registration", start_value=100
        )
        row = await self._repository.create_application(payload, registration_number)
        return InternshipApplication.model_validate(row)

    async def update_application(
        self,
        application_id: UUID,
        payload: InternshipApplicationUpdate,
    ) -> InternshipApplication:
        row = await self._repository.update_application(application_id, payload)
        if row is None:
            raise InternshipNotFoundError(
                f"Internship application {application_id} was not found"
            )
        return InternshipApplication.model_validate(row)

    async def get_application(self, application_id: UUID) -> InternshipApplication:
        row = await self._repository.get_application(application_id)
        if row is None:
            raise InternshipNotFoundError(
                f"Internship application {application_id} was not found"
            )
        return InternshipApplication.model_validate(row)

    async def issue_certificate(
        self,
        application_id: UUID,
        payload: InternshipCertificateIssueRequest | None = None,
    ) -> InternshipCertificate:
        application = await self._repository.get_application(application_id)
        if application is None:
            raise InternshipNotFoundError(
                f"Internship application {application_id} was not found"
            )
        announcement = await self._repository.get_announcement(
            application.announcement_id
        )
        if announcement is None:
            raise InternshipNotFoundError(
                f"Internship announcement {application.announcement_id} was not found"
            )

        existing = await self._repository.get_certificate_for_application(
            application_id
        )
        if existing is not None:
            return InternshipCertificate.model_validate(existing)

        if application.status not in {
            InternshipApplicationStatus.ACTIVE.value,
            InternshipApplicationStatus.COMPLETED.value,
            InternshipApplicationStatus.SHORTLISTED.value,
        }:
            raise InternshipCertificateUnavailableError(
                "Certificate can be issued only for shortlisted, active, or completed interns",
            )

        certificate_id = uuid4()
        verification_code = await self._repository.allocate_counter(
            "certificate", start_value=500
        )
        verification_url = (
            f"https://www.raushni.com/certificates/verify/{quote(verification_code)}"
        )
        qr_code_svg = self._make_qr_svg(verification_url)
        now = datetime.now(timezone.utc)

        application.status = InternshipApplicationStatus.COMPLETED.value
        if payload is not None and payload.completion_notes is not None:
            application.completion_notes = payload.completion_notes
        application.certificate_id = certificate_id
        await self._repository.save_application(application)

        certificate = InternshipCertificateModel(
            id=certificate_id,
            application_id=application_id,
            certificate_number=verification_code,
            verification_code=verification_code,
            verification_url=verification_url,
            participant_name=application.full_name,
            program_title=announcement.title,
            track=application.track,
            issued_at=now,
            status=CertificateStatus.ISSUED.value,
            qr_code_svg=qr_code_svg,
            html_template=self._certificate_html(
                participant_name=application.full_name,
                program_title=announcement.title,
                track=application.track,
                certificate_number=verification_code,
                verification_url=verification_url,
                issued_at=now,
                qr_code_svg=qr_code_svg,
            ),
        )
        created = await self._repository.create_certificate(certificate)
        return InternshipCertificate.model_validate(created)

    async def verify_certificate(self, verification_code: str) -> InternshipCertificate:
        certificate = await self._repository.get_certificate_by_code(verification_code)
        if certificate is None:
            raise InternshipNotFoundError(
                f"Certificate {verification_code} was not found"
            )
        return InternshipCertificate.model_validate(certificate)

    async def delete_application(self, application_id: UUID) -> None:
        deleted = await self._repository.delete_application(application_id)
        if not deleted:
            raise InternshipNotFoundError(
                f"Internship application {application_id} was not found"
            )

    def _make_qr_svg(self, value: str) -> str:
        if qrcode is None:
            return self._fallback_qr_svg(value)

        image = qrcode.make(value, image_factory=qrcode.image.svg.SvgPathImage)
        buffer = BytesIO()
        image.save(buffer)
        return buffer.getvalue().decode("utf-8")

    def _fallback_qr_svg(self, value: str) -> str:
        digest = sha256(value.encode("utf-8")).digest()
        cells = 21
        size = 168
        cell = size // cells
        rects = [
            f'<rect x="0" y="0" width="{size}" height="{size}" fill="white"/>',
            f'<rect x="0" y="0" width="{size}" height="{size}" fill="none" stroke="#111827" stroke-width="4"/>',
        ]
        for y in range(cells):
            for x in range(cells):
                finder = (
                    (x < 7 and y < 7)
                    or (x >= cells - 7 and y < 7)
                    or (x < 7 and y >= cells - 7)
                )
                byte = digest[(x + y * cells) % len(digest)]
                on = finder or ((byte >> (x % 8)) & 1)
                if on:
                    rects.append(
                        f'<rect x="{x * cell}" y="{y * cell}" width="{cell}" height="{cell}" fill="#111827"/>'
                    )
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="Certificate verification code">{"".join(rects)}</svg>'

    def _certificate_html(
        self,
        *,
        participant_name: str,
        program_title: str,
        track: str,
        certificate_number: str,
        verification_url: str,
        issued_at: datetime,
        qr_code_svg: str,
    ) -> str:
        template = get_document_template("internship-completion-certificate")
        context = {
            "participant_name": participant_name,
            "program_title": program_title,
            "track": track,
            "certificate_number": certificate_number,
            "verification_url": verification_url,
            "issued_on": issued_at.date().isoformat(),
        }
        title = str(template.get("title", "Certificate of Completion"))
        subtitle = str(
            template.get("subtitle", "This certificate is proudly awarded to")
        )
        body = render_template(str(template.get("body", "")), context)
        footer = str(
            template.get(
                "footer",
                "This certificate can be authenticated using the QR code or verification URL.",
            )
        )
        signatory = str(template.get("signatoryLabel", "Authorized Signatory"))
        return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>{escape(certificate_number)} - Internship Certificate</title>
  <style>
    body {{ margin: 0; background: #f3f4f6; font-family: Arial, sans-serif; color: #1f2937; }}
    .certificate {{ width: 980px; margin: 32px auto; background: #fff; border: 12px solid #111827; padding: 44px; box-shadow: 0 20px 50px rgba(0,0,0,.18); }}
    .top {{ display: flex; justify-content: space-between; gap: 24px; align-items: center; border-bottom: 2px solid #f59e0b; padding-bottom: 24px; }}
    .brand {{ font-size: 30px; font-weight: 900; color: #111827; }}
    .seal {{ width: 96px; height: 96px; border-radius: 999px; border: 4px solid #f59e0b; display: grid; place-items: center; font-size: 54px; font-weight: 900; color: #111827; }}
    h1 {{ font-size: 48px; text-align: center; margin: 48px 0 12px; color: #111827; letter-spacing: 2px; }}
    .subtitle {{ text-align: center; color: #6b7280; font-size: 18px; }}
    .name {{ text-align: center; font-size: 42px; font-weight: 900; color: #b45309; margin: 34px 0 18px; }}
    .body {{ max-width: 760px; margin: 0 auto; text-align: center; font-size: 20px; line-height: 1.8; }}
    .details {{ margin-top: 42px; display: grid; grid-template-columns: 1fr 170px; gap: 28px; align-items: end; }}
    .meta {{ display: grid; gap: 10px; font-size: 15px; }}
    .qr svg {{ width: 150px; height: 150px; }}
    .sign {{ margin-top: 30px; display: flex; justify-content: space-between; border-top: 1px solid #d1d5db; padding-top: 18px; }}
  </style>
</head>
<body>
  <section class="certificate">
    <div class="top">
      <div>
        <div class="brand">Raushni Educational & Social Welfare Trust</div>
        <p>{escape(str(template.get("name", "Internship Completion Certificate")))}</p>
      </div>
      <div class="seal">R</div>
    </div>
    <h1>{escape(title)}</h1>
    <p class="subtitle">{escape(subtitle)}</p>
    <div class="name">{escape(participant_name)}</div>
    <p class="body">{body}</p>
    <div class="details">
      <div class="meta">
        <span><strong>Certificate No:</strong> {escape(certificate_number)}</span>
        <span><strong>Issued On:</strong> {issued_at.date().isoformat()}</span>
        <span><strong>Verify:</strong> {escape(verification_url)}</span>
        <span>{escape(footer)}</span>
      </div>
      <div class="qr">{qr_code_svg}</div>
    </div>
    <div class="sign">
      <strong>Program Coordinator</strong>
      <strong>{escape(signatory)}</strong>
    </div>
  </section>
</body>
</html>"""
