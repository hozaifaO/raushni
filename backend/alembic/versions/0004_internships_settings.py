"""Create internship triad, counters, and platform_settings singleton.

Revision ID: 0004_internships_settings
Revises: 0003_projects_crowdfunding
Create Date: 2026-07-15

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0004_internships_settings"
down_revision: Union[str, None] = "0003_projects_crowdfunding"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "internship_announcements",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("summary", sa.String(length=500), nullable=False),
        sa.Column("description", sa.String(length=1600), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("registration_deadline", sa.Date(), nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("event_time", sa.String(length=40), nullable=False, server_default="01:00 PM"),
        sa.Column("location", sa.String(length=160), nullable=False, server_default="Web/Virtual, India"),
        sa.Column("mode", sa.String(length=20), nullable=False, server_default="virtual"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="published"),
        sa.Column("poster_url", sa.String(length=260), nullable=False),
        sa.Column("apply_url", sa.String(length=160), nullable=False),
        sa.Column("github_url", sa.String(length=260), nullable=False),
        sa.Column("contact_phone", sa.String(length=30), nullable=False),
        sa.Column("benefits", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("tracks", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("eligibility", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.UniqueConstraint("slug", name="uq_internship_announcements_slug"),
    )
    op.create_index("ix_internship_announcements_status", "internship_announcements", ["status"])

    op.create_table(
        "internship_applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "announcement_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("internship_announcements.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("full_name", sa.String(length=140), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("college", sa.String(length=160), nullable=False),
        sa.Column("course", sa.String(length=160), nullable=False),
        sa.Column("track", sa.String(length=120), nullable=False),
        sa.Column("github_url", sa.String(length=260), nullable=True),
        sa.Column("portfolio_url", sa.String(length=260), nullable=True),
        sa.Column("motivation", sa.String(length=1000), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="registered"),
        sa.Column("completion_notes", sa.String(length=800), nullable=True),
        sa.Column("registration_number", sa.String(length=50), nullable=False),
        sa.Column("certificate_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.UniqueConstraint("registration_number", name="uq_internship_applications_registration_number"),
    )
    op.create_index("ix_internship_applications_announcement_id", "internship_applications", ["announcement_id"])
    op.create_index("ix_internship_applications_status", "internship_applications", ["status"])

    op.create_table(
        "internship_certificates",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("internship_applications.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("certificate_number", sa.String(length=50), nullable=False),
        sa.Column("verification_code", sa.String(length=50), nullable=False),
        sa.Column("verification_url", sa.String(length=400), nullable=False),
        sa.Column("participant_name", sa.String(length=140), nullable=False),
        sa.Column("program_title", sa.String(length=160), nullable=False),
        sa.Column("track", sa.String(length=120), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="issued"),
        sa.Column("qr_code_svg", sa.Text(), nullable=False),
        sa.Column("html_template", sa.Text(), nullable=False),
        sa.UniqueConstraint("application_id", name="uq_internship_certificates_application_id"),
        sa.UniqueConstraint("certificate_number", name="uq_internship_certificates_certificate_number"),
        sa.UniqueConstraint("verification_code", name="uq_internship_certificates_verification_code"),
    )

    op.create_table(
        "internship_counters",
        sa.Column("kind", sa.String(length=20), primary_key=True),
        sa.Column("year", sa.Integer(), primary_key=True),
        sa.Column("last_value", sa.Integer(), nullable=False, server_default="100"),
    )

    op.create_table(
        "platform_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("organization_name", sa.String(length=160), nullable=False),
        sa.Column("support_email", sa.String(length=255), nullable=False),
        sa.Column("cms_url", sa.String(length=180), nullable=False),
        sa.Column("timezone", sa.String(length=80), nullable=False),
        sa.Column("receipt_prefix", sa.String(length=20), nullable=False),
        sa.Column("public_donations_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("maintenance_mode", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("theme_name", sa.String(length=80), nullable=False),
        sa.Column("primary_color", sa.String(length=7), nullable=False),
        sa.Column("accent_color", sa.String(length=7), nullable=False),
        sa.Column("header_theme", sa.String(length=20), nullable=False),
        sa.Column("footer_theme", sa.String(length=20), nullable=False),
        sa.Column("page_background", sa.String(length=7), nullable=False),
        sa.Column("surface_radius", sa.String(length=12), nullable=False),
        sa.Column("logo_diameter", sa.String(length=12), nullable=False),
        sa.Column("public_logo_url", sa.String(length=240), nullable=False),
        sa.Column("stamp_logo_url", sa.String(length=240), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("platform_settings")
    op.drop_table("internship_counters")
    op.drop_table("internship_certificates")
    op.drop_index("ix_internship_applications_status", table_name="internship_applications")
    op.drop_index("ix_internship_applications_announcement_id", table_name="internship_applications")
    op.drop_table("internship_applications")
    op.drop_index("ix_internship_announcements_status", table_name="internship_announcements")
    op.drop_table("internship_announcements")
