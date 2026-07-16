from __future__ import annotations

from app.repositories.crowdfunding_repository import CrowdfundingRepository
from app.repositories.designation_repository import DesignationRepository
from app.repositories.donation_repository import DonationRepository
from app.repositories.internship_repository import InternshipRepository
from app.repositories.member_repository import MemberRepository
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.settings_repository import PlatformSettingsRepository
from app.repositories.simple_record_repository import SimpleRecordRepository

__all__ = [
    "CrowdfundingRepository",
    "DesignationRepository",
    "DonationRepository",
    "InternshipRepository",
    "MemberRepository",
    "OrganizationRepository",
    "PlatformSettingsRepository",
    "ProjectRepository",
    "SimpleRecordRepository",
]
