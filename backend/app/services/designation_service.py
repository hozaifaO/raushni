from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.schemas.designation import (
    Designation,
    DesignationCreate,
    DesignationListResponse,
    DesignationStatus,
    DesignationUpdate,
)


class DesignationNotFoundError(LookupError):
    pass


class DesignationConflictError(ValueError):
    pass


class DesignationService:
    def __init__(self) -> None:
        self._designations: dict[UUID, Designation] = {}
        for payload in self._default_designations():
            self.create_designation(payload)

    def list_designations(
        self,
        *,
        search: str | None = None,
        status_filter: DesignationStatus | None = None,
        department: str | None = None,
    ) -> DesignationListResponse:
        items = list(self._designations.values())

        if search:
            query = search.strip().lower()
            items = [
                designation
                for designation in items
                if query in designation.title.lower()
                or query in designation.code.lower()
                or query in designation.department.lower()
                or query in designation.assignment_scope.lower()
            ]

        if status_filter is not None:
            items = [designation for designation in items if designation.status == status_filter]

        if department:
            query_department = department.strip().lower()
            items = [designation for designation in items if designation.department.lower() == query_department]

        items.sort(key=lambda designation: (designation.sort_order, designation.title.lower()))
        all_designations = list(self._designations.values())

        return DesignationListResponse(
            items=items,
            total=len(all_designations),
            active=sum(1 for designation in all_designations if designation.status == DesignationStatus.ACTIVE),
            inactive=sum(1 for designation in all_designations if designation.status == DesignationStatus.INACTIVE),
            archived=sum(1 for designation in all_designations if designation.status == DesignationStatus.ARCHIVED),
            assigned_staff=sum(designation.staff_assigned for designation in all_designations),
            open_slots=sum(max(designation.volunteer_slots - designation.staff_assigned, 0) for designation in all_designations),
        )

    def create_designation(self, payload: DesignationCreate) -> Designation:
        self._ensure_unique_code(payload.code)
        now = datetime.now(timezone.utc)
        designation = Designation(
            id=uuid4(),
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        self._designations[designation.id] = designation
        return designation

    def get_designation(self, designation_id: UUID) -> Designation:
        try:
            return self._designations[designation_id]
        except KeyError as exc:
            raise DesignationNotFoundError(f"Designation {designation_id} was not found") from exc

    def update_designation(self, designation_id: UUID, payload: DesignationUpdate) -> Designation:
        designation = self.get_designation(designation_id)
        updates = payload.model_dump(exclude_unset=True)
        if "code" in updates and updates["code"] != designation.code:
            self._ensure_unique_code(updates["code"], ignore_id=designation_id)
        updated = designation.model_copy(update={**updates, "updated_at": datetime.now(timezone.utc)})
        self._designations[designation_id] = updated
        return updated

    def delete_designation(self, designation_id: UUID) -> None:
        self.get_designation(designation_id)
        del self._designations[designation_id]

    def _ensure_unique_code(self, code: str, ignore_id: UUID | None = None) -> None:
        normalized = code.strip().lower()
        for designation_id, designation in self._designations.items():
            if ignore_id is not None and designation_id == ignore_id:
                continue
            if designation.code.lower() == normalized:
                raise DesignationConflictError(f"Designation code {code} already exists")

    def _default_designations(self) -> list[DesignationCreate]:
        return [
            DesignationCreate(
                title="Trustee",
                code="TRUSTEE",
                department="Governance",
                level="board",
                reports_to=None,
                description="Provides governance oversight, policy direction, and statutory accountability for the trust.",
                assignment_scope="Board governance and trust-level approvals",
                responsibilities=[
                    "Approve strategic plans and budgets",
                    "Review compliance and audit actions",
                    "Represent trust governance decisions",
                ],
                required_documents=["Identity proof", "Address proof", "Board consent record"],
                staff_assigned=3,
                volunteer_slots=3,
                sort_order=10,
                cms_slug="trustee",
                notes="Reserved for legally appointed board members.",
            ),
            DesignationCreate(
                title="Project Manager",
                code="PM",
                department="Programmes",
                level="management",
                reports_to="Trustee",
                description="Owns project planning, field execution, donor reporting, timeline control, and delivery quality.",
                assignment_scope="Project execution and donor coordination",
                responsibilities=[
                    "Prepare project plans and implementation calendars",
                    "Coordinate field teams and partners",
                    "Submit progress, impact, and utilization reports",
                ],
                required_documents=["Appointment letter", "KYC", "Experience profile"],
                staff_assigned=1,
                volunteer_slots=2,
                sort_order=20,
                cms_slug="project-manager",
            ),
            DesignationCreate(
                title="Finance and Accounts Officer",
                code="FIN",
                department="Finance",
                level="management",
                reports_to="Trustee",
                description="Maintains donation, expense, voucher, receipt, bank, and audit-ready finance records.",
                assignment_scope="Finance controls, payment records, receipts, and compliance",
                responsibilities=[
                    "Record donations and expenses",
                    "Maintain vouchers and audit files",
                    "Prepare financial summaries",
                ],
                required_documents=["Appointment letter", "KYC", "Bank verification"],
                staff_assigned=1,
                volunteer_slots=1,
                sort_order=30,
                cms_slug="finance-accounts-officer",
            ),
            DesignationCreate(
                title="Volunteer Coordinator",
                code="VOL-COORD",
                department="Community",
                level="coordination",
                reports_to="Project Manager",
                description="Coordinates volunteer onboarding, assignments, attendance, conduct, and community activity support.",
                assignment_scope="Volunteer deployment and community activity coordination",
                responsibilities=[
                    "Maintain volunteer rosters",
                    "Assign volunteers to activities",
                    "Collect attendance and field updates",
                ],
                required_documents=["Volunteer form", "Identity proof", "Consent declaration"],
                staff_assigned=1,
                volunteer_slots=10,
                sort_order=40,
                cms_slug="volunteer-coordinator",
            ),
            DesignationCreate(
                title="Intern",
                code="INTERN",
                department="Internships",
                level="intern",
                reports_to="Internship Coordinator",
                description="Supports assigned projects, documentation, data collection, learning tasks, and completion deliverables.",
                assignment_scope="Internship tasks, learning milestones, and certificate workflow",
                responsibilities=[
                    "Complete assigned internship deliverables",
                    "Submit weekly progress updates",
                    "Follow mentor guidance and trust conduct rules",
                ],
                required_documents=["Internship application", "College ID", "Completion report"],
                staff_assigned=0,
                volunteer_slots=25,
                sort_order=50,
                cms_slug="intern",
            ),
        ]
