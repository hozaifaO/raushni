from __future__ import annotations

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_organization
from app.core.db import get_db
from app.models.organization import OrganizationModel
from app.repositories.crowdfunding_repository import CrowdfundingRepository
from app.repositories.designation_repository import DesignationRepository
from app.repositories.donation_repository import DonationRepository
from app.repositories.internship_repository import InternshipRepository
from app.repositories.member_repository import MemberRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.settings_repository import PlatformSettingsRepository
from app.repositories.simple_record_repository import SimpleRecordRepository
from app.services.crowdfunding_service import CrowdfundingService
from app.services.designation_service import DesignationService
from app.services.donation_service import DonationService
from app.services.internship_service import InternshipService
from app.services.member_service import MemberService
from app.services.project_service import ProjectService
from app.services.settings_service import SettingsService, UserAccountStore
from app.services.simple_crud_service import SimpleCrudService


def get_member_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> MemberService:
    return MemberService(MemberRepository(session, organization_id=organization.id))


def get_donation_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> DonationService:
    return DonationService(
        DonationRepository(session, organization_id=organization.id),
        PlatformSettingsRepository(session, organization_id=organization.id),
    )


def get_designation_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> DesignationService:
    return DesignationService(DesignationRepository(session, organization_id=organization.id))


def get_project_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> ProjectService:
    return ProjectService(ProjectRepository(session, organization_id=organization.id))


def get_crowdfunding_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> CrowdfundingService:
    return CrowdfundingService(CrowdfundingRepository(session, organization_id=organization.id))


def get_internship_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> InternshipService:
    return InternshipService(InternshipRepository(session, organization_id=organization.id))


def get_user_account_store(request: Request) -> UserAccountStore:
    return request.app.state.user_account_store


def get_settings_service(
    request: Request,
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> SettingsService:
    return SettingsService(
        PlatformSettingsRepository(session, organization_id=organization.id),
        OrganizationRepository(session),
        organization,
        get_user_account_store(request),
    )


def _simple_service(session: AsyncSession, module: str, organization_id) -> SimpleCrudService:
    return SimpleCrudService(
        SimpleRecordRepository(session, module=module, organization_id=organization_id)
    )


def get_activity_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> SimpleCrudService:
    return _simple_service(session, "activities", organization.id)


def get_beneficiary_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> SimpleCrudService:
    return _simple_service(session, "beneficiaries", organization.id)


def get_enquiry_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> SimpleCrudService:
    return _simple_service(session, "enquiries", organization.id)


def get_event_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> SimpleCrudService:
    return _simple_service(session, "events", organization.id)


def get_expense_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> SimpleCrudService:
    return _simple_service(session, "expenses", organization.id)


def get_news_service(
    session: AsyncSession = Depends(get_db),
    organization: OrganizationModel = Depends(get_current_organization),
) -> SimpleCrudService:
    return _simple_service(session, "news", organization.id)
