from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import UUID, uuid4

from app.schemas.project import (
    Project,
    ProjectCreate,
    ProjectListResponse,
    ProjectStatus,
    ProjectUpdate,
)


class ProjectNotFoundError(LookupError):
    pass


class ProjectService:
    def __init__(self) -> None:
        self._projects: dict[UUID, Project] = {}
        self._seed_defaults()

    def list_projects(
        self,
        *,
        search: str | None = None,
        status_filter: ProjectStatus | None = None,
    ) -> ProjectListResponse:
        items = list(self._projects.values())
        if search:
            query = search.strip().lower()
            items = [
                item for item in items
                if query in item.title.lower()
                or query in item.summary.lower()
                or query in item.location.lower()
                or query in item.focus_area.lower()
            ]
        if status_filter is not None:
            items = [item for item in items if item.status == status_filter]
        items.sort(key=lambda item: (item.start_date, item.created_at), reverse=True)
        all_projects = list(self._projects.values())
        return ProjectListResponse(
            items=items,
            total=len(all_projects),
            proposed=sum(1 for item in all_projects if item.status == ProjectStatus.PROPOSED),
            active=sum(1 for item in all_projects if item.status == ProjectStatus.ACTIVE),
            completed=sum(1 for item in all_projects if item.status == ProjectStatus.COMPLETED),
            total_budget=sum(item.budget for item in all_projects),
            total_beneficiaries=sum(item.beneficiaries for item in all_projects),
        )

    def create_project(self, payload: ProjectCreate) -> Project:
        now = datetime.now(timezone.utc)
        project = Project(id=uuid4(), created_at=now, updated_at=now, **payload.model_dump())
        self._projects[project.id] = project
        return project

    def get_project(self, project_id: UUID) -> Project:
        try:
            return self._projects[project_id]
        except KeyError as exc:
            raise ProjectNotFoundError(f"Project {project_id} was not found") from exc

    def update_project(self, project_id: UUID, payload: ProjectUpdate) -> Project:
        project = self.get_project(project_id)
        updated = project.model_copy(
            update={**payload.model_dump(exclude_unset=True), "updated_at": datetime.now(timezone.utc)},
        )
        self._projects[project_id] = updated
        return updated

    def delete_project(self, project_id: UUID) -> None:
        self.get_project(project_id)
        del self._projects[project_id]

    def _seed_defaults(self) -> None:
        self.create_project(
            ProjectCreate(
                title="Project Sparsh: WATSAN Intervention Programme",
                slug="project-sparsh-watsan-muzaffarpur",
                summary=(
                    "Integrated school WATSAN intervention for 10 marginalized schools in Muzaffarpur, "
                    "covering RO drinking water systems, gender-segregated toilets, handwashing stations, "
                    "MHM awareness, teacher sensitization, and community-led maintenance."
                ),
                location="Muzaffarpur District, Bihar",
                focus_area="Education, WATSAN, health, gender inclusion",
                status=ProjectStatus.PROPOSED,
                start_date=date(2026, 6, 1),
                end_date=date(2027, 5, 31),
                budget=4811136,
                beneficiaries=2500,
                schools_targeted=10,
                progress=12,
                manager="Project Manager",
                donor="CSR / institutional partner",
                proposal_url="/cms/project-proposals/project-sparsh-watsan-muzaffarpur.docx",
                cms_slug="project-sparsh-watsan-muzaffarpur",
                objectives=[
                    "Install RO-based drinking water systems, gender-segregated toilets, and handwashing stations.",
                    "Conduct hygiene awareness, MHM counselling, and teacher sensitization programmes.",
                    "Build school and community capacity for operation and maintenance.",
                    "Strengthen convergence with government schemes for sustainability.",
                ],
                milestones=[
                    "Baseline assessment and school selection",
                    "Infrastructure procurement and installation",
                    "Hygiene, MHM, teacher, and community sessions",
                    "Endline assessment, documentation, and closure report",
                ],
                risks=[
                    "Seasonal floods may affect infrastructure timelines.",
                    "Long-term maintenance requires school and community ownership.",
                ],
                notes="Seeded from the Project Sparsh WATSAN proposal.",
            ),
        )
