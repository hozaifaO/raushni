from __future__ import annotations

from datetime import date, datetime, timezone
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
    InternshipStatus,
)
from app.services.cms_template_service import get_document_template, render_template


class InternshipNotFoundError(LookupError):
    pass


class InternshipCertificateUnavailableError(ValueError):
    pass


class InternshipService:
    def __init__(self) -> None:
        self._announcements: dict[UUID, InternshipAnnouncement] = {}
        self._applications: dict[UUID, InternshipApplication] = {}
        self._certificates: dict[UUID, InternshipCertificate] = {}
        self._registration_counter = 100
        self._certificate_counter = 500
        self._seed_defaults()

    def list_dashboard(
        self,
        *,
        search: str | None = None,
        application_status: InternshipApplicationStatus | None = None,
    ) -> InternshipListResponse:
        applications = list(self._applications.values())
        if search:
            query = search.strip().lower()
            applications = [
                item
                for item in applications
                if query in item.full_name.lower()
                or query in item.email.lower()
                or query in item.phone.lower()
                or query in item.registration_number.lower()
                or query in item.track.lower()
            ]

        if application_status is not None:
            applications = [item for item in applications if item.status == application_status]

        applications.sort(key=lambda item: item.created_at, reverse=True)
        all_applications = list(self._applications.values())

        return InternshipListResponse(
            announcements=sorted(self._announcements.values(), key=lambda item: item.event_date, reverse=True),
            applications=applications,
            certificates=sorted(self._certificates.values(), key=lambda item: item.issued_at, reverse=True),
            total_announcements=len(self._announcements),
            total_applications=len(all_applications),
            registered=sum(1 for item in all_applications if item.status == InternshipApplicationStatus.REGISTERED),
            active=sum(1 for item in all_applications if item.status == InternshipApplicationStatus.ACTIVE),
            completed=sum(1 for item in all_applications if item.status == InternshipApplicationStatus.COMPLETED),
            certificates_issued=len(self._certificates),
        )

    def list_public_announcements(self) -> list[InternshipAnnouncement]:
        return [
            announcement
            for announcement in sorted(self._announcements.values(), key=lambda item: item.event_date, reverse=True)
            if announcement.status == InternshipStatus.PUBLISHED
        ]

    def create_announcement(self, payload: InternshipAnnouncementCreate) -> InternshipAnnouncement:
        now = datetime.now(timezone.utc)
        announcement = InternshipAnnouncement(id=uuid4(), created_at=now, updated_at=now, **payload.model_dump())
        self._announcements[announcement.id] = announcement
        return announcement

    def update_announcement(
        self,
        announcement_id: UUID,
        payload: InternshipAnnouncementUpdate,
    ) -> InternshipAnnouncement:
        announcement = self.get_announcement(announcement_id)
        updated = announcement.model_copy(
            update={**payload.model_dump(exclude_unset=True), "updated_at": datetime.now(timezone.utc)},
        )
        self._announcements[announcement_id] = updated
        return updated

    def get_announcement(self, announcement_id: UUID) -> InternshipAnnouncement:
        try:
            return self._announcements[announcement_id]
        except KeyError as exc:
            raise InternshipNotFoundError(f"Internship announcement {announcement_id} was not found") from exc

    def register_application(self, payload: InternshipApplicationCreate) -> InternshipApplication:
        self.get_announcement(payload.announcement_id)
        now = datetime.now(timezone.utc)
        application = InternshipApplication(
            id=uuid4(),
            registration_number=self._next_registration_number(),
            certificate_id=None,
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        self._applications[application.id] = application
        return application

    def update_application(
        self,
        application_id: UUID,
        payload: InternshipApplicationUpdate,
    ) -> InternshipApplication:
        application = self.get_application(application_id)
        updated = application.model_copy(
            update={**payload.model_dump(exclude_unset=True), "updated_at": datetime.now(timezone.utc)},
        )
        self._applications[application_id] = updated
        return updated

    def get_application(self, application_id: UUID) -> InternshipApplication:
        try:
            return self._applications[application_id]
        except KeyError as exc:
            raise InternshipNotFoundError(f"Internship application {application_id} was not found") from exc

    def issue_certificate(
        self,
        application_id: UUID,
        payload: InternshipCertificateIssueRequest | None = None,
    ) -> InternshipCertificate:
        application = self.get_application(application_id)
        announcement = self.get_announcement(application.announcement_id)

        existing = self._certificate_for_application(application_id)
        if existing is not None:
            return existing

        if application.status not in {
            InternshipApplicationStatus.ACTIVE,
            InternshipApplicationStatus.COMPLETED,
            InternshipApplicationStatus.SHORTLISTED,
        }:
            raise InternshipCertificateUnavailableError(
                "Certificate can be issued only for shortlisted, active, or completed interns",
            )

        certificate_id = uuid4()
        verification_code = self._next_certificate_number()
        verification_url = f"https://www.raushni.com/certificates/verify/{quote(verification_code)}"
        qr_code_svg = self._make_qr_svg(verification_url)
        now = datetime.now(timezone.utc)
        completed = application.model_copy(
            update={
                "status": InternshipApplicationStatus.COMPLETED,
                "completion_notes": payload.completion_notes if payload else application.completion_notes,
                "certificate_id": certificate_id,
                "updated_at": now,
            },
        )
        self._applications[application_id] = completed

        certificate = InternshipCertificate(
            id=certificate_id,
            application_id=application_id,
            certificate_number=verification_code,
            verification_code=verification_code,
            verification_url=verification_url,
            participant_name=completed.full_name,
            program_title=announcement.title,
            track=completed.track,
            issued_at=now,
            status=CertificateStatus.ISSUED,
            qr_code_svg=qr_code_svg,
            html_template=self._certificate_html(
                participant_name=completed.full_name,
                program_title=announcement.title,
                track=completed.track,
                certificate_number=verification_code,
                verification_url=verification_url,
                issued_at=now,
                qr_code_svg=qr_code_svg,
            ),
        )
        self._certificates[certificate.id] = certificate
        return certificate

    def verify_certificate(self, verification_code: str) -> InternshipCertificate:
        for certificate in self._certificates.values():
            if certificate.verification_code == verification_code and certificate.status == CertificateStatus.ISSUED:
                return certificate
        raise InternshipNotFoundError(f"Certificate {verification_code} was not found")

    def delete_application(self, application_id: UUID) -> None:
        self.get_application(application_id)
        del self._applications[application_id]

    def _certificate_for_application(self, application_id: UUID) -> InternshipCertificate | None:
        for certificate in self._certificates.values():
            if certificate.application_id == application_id:
                return certificate
        return None

    def _next_registration_number(self) -> str:
        self._registration_counter += 1
        return f"RSH-INT-{datetime.now(timezone.utc).year}-{self._registration_counter}"

    def _next_certificate_number(self) -> str:
        self._certificate_counter += 1
        return f"RSH-CERT-{datetime.now(timezone.utc).year}-{self._certificate_counter}"

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
                finder = (x < 7 and y < 7) or (x >= cells - 7 and y < 7) or (x < 7 and y >= cells - 7)
                byte = digest[(x + y * cells) % len(digest)]
                on = finder or ((byte >> (x % 8)) & 1)
                if on:
                    rects.append(f'<rect x="{x * cell}" y="{y * cell}" width="{cell}" height="{cell}" fill="#111827"/>')
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
        subtitle = str(template.get("subtitle", "This certificate is proudly awarded to"))
        body = render_template(str(template.get("body", "")), context)
        footer = str(template.get("footer", "This certificate can be authenticated using the QR code or verification URL."))
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

    def _seed_defaults(self) -> None:
        announcement = self.create_announcement(
            InternshipAnnouncementCreate(
                title="Internship 2026: AI Enabled Community Technology Program",
                slug="internship-2026-ai-community-technology",
                summary="A professional internship for students to gain practical exposure, final-year project support, AI-enabled delivery experience, and career guidance.",
                description="Raushni Educational & Social Welfare Trust invites students and early-career learners to work on real community technology workflows across web development, content operations, data, AI enablement, documentation, and outreach.",
                start_date=date(2026, 6, 15),
                end_date=date(2026, 8, 15),
                registration_deadline=date(2026, 6, 14),
                event_date=date(2026, 6, 15),
                event_time="01:00 PM",
                location="Web/Virtual, India",
                apply_url="/internship-registration",
                benefits=[
                    "Real industry exposure",
                    "Final year project work",
                    "Hands-on experience and AI enabled delivery",
                    "Career guidance",
                    "Completion certificate with QR verification",
                ],
                tracks=[
                    "Web Development",
                    "AI Enabled Operations",
                    "Content and Outreach",
                    "Data and Reporting",
                ],
                eligibility=[
                    "Students, freshers, and early-career learners",
                    "Basic computer and internet access",
                    "Commitment to weekly progress and professional communication",
                ],
            ),
        )

        self.register_application(
            InternshipApplicationCreate(
                announcement_id=announcement.id,
                full_name="Sample Intern",
                email="intern@example.org",
                phone="+91 7827860062",
                city="Virtual",
                college="Raushni Learning Network",
                course="Computer Applications",
                track="Web Development",
                github_url="https://github.com/owais4u/raushni",
                portfolio_url=None,
                motivation="I want to contribute to social impact technology while building practical delivery experience.",
                status=InternshipApplicationStatus.ACTIVE,
            ),
        )
