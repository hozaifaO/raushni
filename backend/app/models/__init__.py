from __future__ import annotations

from app.models.base import Base
from app.models.crowdfunding import CampaignDonationModel, CampaignModel
from app.models.designation import DesignationModel
from app.models.donation import DonationModel, DonationStatusEventModel, ReceiptCounterModel
from app.models.internship import (
    InternshipAnnouncementModel,
    InternshipApplicationModel,
    InternshipCertificateModel,
    InternshipCounterModel,
)
from app.models.member import MemberModel
from app.models.organization import OrganizationMembershipModel, OrganizationModel
from app.models.project import ProjectModel
from app.models.settings import PlatformSettingsModel
from app.models.simple_record import SimpleRecordModel

__all__ = [
    "Base",
    "CampaignDonationModel",
    "CampaignModel",
    "DesignationModel",
    "DonationModel",
    "DonationStatusEventModel",
    "InternshipAnnouncementModel",
    "InternshipApplicationModel",
    "InternshipCertificateModel",
    "InternshipCounterModel",
    "MemberModel",
    "OrganizationMembershipModel",
    "OrganizationModel",
    "PlatformSettingsModel",
    "ProjectModel",
    "ReceiptCounterModel",
    "SimpleRecordModel",
]
