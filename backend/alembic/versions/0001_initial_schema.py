"""Initial multi-tenant API schema (squashed baseline).

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-16

This is the first-party baseline for fresh installs. Domain tables are created
with organization_id and tenant-scoped uniques from day one — there is no
pre-tenant shape to migrate through.
"""
from __future__ import annotations

import os
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _seed_membership_emails() -> tuple[str, str]:
    admin = (os.getenv("NEXTAUTH_ADMIN_EMAIL") or "").strip() or "admin@raushni.com"
    staff = (os.getenv("NEXTAUTH_STAFF_EMAIL") or "").strip() or "staff@raushni.com"
    return admin.lower(), staff.lower()


def _org_id_column() -> sa.Column:
    return sa.Column(
        "organization_id",
        postgresql.UUID(as_uuid=True),
        sa.ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
    )


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "organizations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("primary_host", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.UniqueConstraint("slug", name="uq_organizations_slug"),
    )

    op.execute(
        sa.text(
            """
            INSERT INTO organizations (id, slug, name, status, primary_host)
            VALUES (
                gen_random_uuid(),
                'raushni',
                'Raushni Educational & Social Welfare Trust',
                'active',
                NULL
            )
            """
        )
    )

    op.create_table(
        "organization_memberships",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=40), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
            name="fk_organization_memberships_organization_id",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "organization_id",
            "email",
            name="uq_organization_memberships_org_email",
        ),
    )
    op.create_index(
        "ix_organization_memberships_organization_id",
        "organization_memberships",
        ["organization_id"],
    )

    admin_email, staff_email = _seed_membership_emails()
    op.execute(
        sa.text(
            """
            INSERT INTO organization_memberships (id, organization_id, email, role)
            SELECT gen_random_uuid(), o.id, :admin_email, 'ADMIN'
            FROM organizations o WHERE o.slug = 'raushni'
            """
        ).bindparams(admin_email=admin_email)
    )
    if staff_email != admin_email:
        op.execute(
            sa.text(
                """
                INSERT INTO organization_memberships (id, organization_id, email, role)
                SELECT gen_random_uuid(), o.id, :staff_email, 'STAFF'
                FROM organizations o WHERE o.slug = 'raushni'
                """
            ).bindparams(staff_email=staff_email)
        )

    op.create_table(
        "members",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("role", sa.String(length=80), nullable=False, server_default="Volunteer"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("joined_on", sa.Date(), nullable=False),
        sa.Column("address", sa.String(length=240), nullable=True),
        sa.Column("emergency_contact", sa.String(length=120), nullable=True),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
    )
    op.create_index("ix_members_organization_id", "members", ["organization_id"])
    op.create_index("ix_members_status", "members", ["status"])
    op.create_index(
        "uq_members_org_email_not_null",
        "members",
        ["organization_id", "email"],
        unique=True,
        postgresql_where=sa.text("email IS NOT NULL"),
    )

    op.create_table(
        "receipt_counters",
        sa.Column(
            "organization_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("organizations.id", ondelete="RESTRICT"),
            primary_key=True,
        ),
        sa.Column("year", sa.Integer(), primary_key=True),
        sa.Column("last_value", sa.Integer(), nullable=False, server_default="1000"),
    )

    op.create_table(
        "donations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
        sa.Column("donor_name", sa.String(length=140), nullable=False),
        sa.Column("donor_email", sa.String(length=255), nullable=True),
        sa.Column("donor_phone", sa.String(length=20), nullable=False),
        sa.Column("donor_address", sa.String(length=260), nullable=True),
        sa.Column("donor_pan", sa.String(length=20), nullable=True),
        sa.Column("donor_type", sa.String(length=40), nullable=False, server_default="individual"),
        sa.Column(
            "is_anonymous",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("purpose", sa.String(length=40), nullable=False, server_default="general"),
        sa.Column("payment_method", sa.String(length=40), nullable=False, server_default="upi"),
        sa.Column("payment_status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("transaction_reference", sa.String(length=120), nullable=True),
        sa.Column("donation_date", sa.Date(), nullable=False),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("gateway_provider", sa.String(length=40), nullable=True),
        sa.Column("gateway_session_id", sa.String(length=160), nullable=True),
        sa.Column("gateway_payment_intent", sa.String(length=160), nullable=True),
        sa.Column("checkout_url", sa.String(length=500), nullable=True),
        sa.Column("receipt_number", sa.String(length=50), nullable=False),
        sa.Column("receipt_issued", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("receipt_issued_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("receipt_snapshot", postgresql.JSONB(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "organization_id",
            "receipt_number",
            name="uq_donations_org_receipt_number",
        ),
    )
    op.create_index("ix_donations_organization_id", "donations", ["organization_id"])
    op.create_index("ix_donations_payment_status", "donations", ["payment_status"])
    op.create_index("ix_donations_gateway_session_id", "donations", ["gateway_session_id"])

    op.create_table(
        "donation_status_events",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
        sa.Column("donation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("from_status", sa.String(length=20), nullable=True),
        sa.Column("to_status", sa.String(length=20), nullable=False),
        sa.Column("transaction_reference", sa.String(length=120), nullable=True),
        sa.Column("actor_role", sa.String(length=40), nullable=True),
        sa.Column("actor_email", sa.String(length=255), nullable=True),
        sa.Column("note", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["donation_id"],
            ["donations.id"],
            name="fk_donation_status_events_donation_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "ix_donation_status_events_organization_id",
        "donation_status_events",
        ["organization_id"],
    )
    op.create_index(
        "ix_donation_status_events_donation_id",
        "donation_status_events",
        ["donation_id"],
    )
    op.create_index(
        "ix_donation_status_events_created_at",
        "donation_status_events",
        ["created_at"],
    )

    op.create_table(
        "designations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("code", sa.String(length=30), nullable=False),
        sa.Column("department", sa.String(length=80), nullable=False),
        sa.Column("level", sa.String(length=40), nullable=False, server_default="volunteer"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("reports_to", sa.String(length=120), nullable=True),
        sa.Column("description", sa.String(length=700), nullable=False),
        sa.Column("assignment_scope", sa.String(length=160), nullable=False),
        sa.Column(
            "responsibilities",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "required_documents",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("staff_assigned", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("volunteer_slots", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cms_slug", sa.String(length=120), nullable=True),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.UniqueConstraint("organization_id", "code", name="uq_designations_org_code"),
    )
    op.create_index("ix_designations_organization_id", "designations", ["organization_id"])
    op.create_index("ix_designations_status", "designations", ["status"])
    op.create_index("ix_designations_department", "designations", ["department"])

    op.create_table(
        "simple_records",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
        sa.Column("module", sa.String(length=40), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False, server_default="general"),
        sa.Column("summary", sa.String(length=1200), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("record_date", sa.Date(), nullable=False),
        sa.Column("contact_name", sa.String(length=140), nullable=True),
        sa.Column("contact_email", sa.String(length=255), nullable=True),
        sa.Column("amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("location", sa.String(length=180), nullable=True),
        sa.Column("notes", sa.String(length=1200), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
    )
    op.create_index("ix_simple_records_organization_id", "simple_records", ["organization_id"])
    op.create_index("ix_simple_records_module_status", "simple_records", ["module", "status"])
    op.create_index(
        "ix_simple_records_module_record_date",
        "simple_records",
        ["module", "record_date"],
    )

    op.create_table(
        "projects",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("summary", sa.String(length=1200), nullable=False),
        sa.Column("location", sa.String(length=180), nullable=False),
        sa.Column(
            "focus_area",
            sa.String(length=120),
            nullable=False,
            server_default="Education and WATSAN",
        ),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="proposed"),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="high"),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("budget", sa.Numeric(14, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("beneficiaries", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("schools_targeted", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("manager", sa.String(length=120), nullable=False, server_default="Project Manager"),
        sa.Column("donor", sa.String(length=160), nullable=True),
        sa.Column("proposal_url", sa.String(length=300), nullable=True),
        sa.Column("cms_slug", sa.String(length=160), nullable=True),
        sa.Column(
            "objectives",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "milestones",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "risks",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("notes", sa.String(length=1200), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.UniqueConstraint("organization_id", "slug", name="uq_projects_org_slug"),
    )
    op.create_index("ix_projects_organization_id", "projects", ["organization_id"])
    op.create_index("ix_projects_status", "projects", ["status"])

    op.create_table(
        "campaigns",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("summary", sa.String(length=900), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False, server_default="education"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("target_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("amount_raised", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("location", sa.String(length=180), nullable=False, server_default="India"),
        sa.Column("beneficiary_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cover_image_url", sa.String(length=400), nullable=True),
        sa.Column("public_url", sa.String(length=400), nullable=True),
        sa.Column("cms_slug", sa.String(length=160), nullable=True),
        sa.Column("owner", sa.String(length=120), nullable=False, server_default="Fundraising Team"),
        sa.Column(
            "highlights",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "impact_metrics",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("notes", sa.String(length=1200), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.UniqueConstraint("organization_id", "slug", name="uq_campaigns_org_slug"),
    )
    op.create_index("ix_campaigns_organization_id", "campaigns", ["organization_id"])
    op.create_index("ix_campaigns_status", "campaigns", ["status"])

    op.create_table(
        "campaign_donations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
        sa.Column(
            "campaign_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("campaigns.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("donor_name", sa.String(length=140), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_method", sa.String(length=80), nullable=False, server_default="upi"),
        sa.Column("receipt_no", sa.String(length=80), nullable=True),
        sa.Column("note", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_campaign_donations_organization_id",
        "campaign_donations",
        ["organization_id"],
    )
    op.create_index("ix_campaign_donations_campaign_id", "campaign_donations", ["campaign_id"])

    op.create_table(
        "internship_announcements",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("summary", sa.String(length=500), nullable=False),
        sa.Column("description", sa.String(length=1600), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("registration_deadline", sa.Date(), nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("event_time", sa.String(length=40), nullable=False, server_default="01:00 PM"),
        sa.Column(
            "location",
            sa.String(length=160),
            nullable=False,
            server_default="Web/Virtual, India",
        ),
        sa.Column("mode", sa.String(length=20), nullable=False, server_default="virtual"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="published"),
        sa.Column("poster_url", sa.String(length=260), nullable=False),
        sa.Column("apply_url", sa.String(length=160), nullable=False),
        sa.Column("github_url", sa.String(length=260), nullable=False),
        sa.Column("contact_phone", sa.String(length=30), nullable=False),
        sa.Column(
            "benefits",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "tracks",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "eligibility",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "organization_id",
            "slug",
            name="uq_internship_announcements_org_slug",
        ),
    )
    op.create_index(
        "ix_internship_announcements_organization_id",
        "internship_announcements",
        ["organization_id"],
    )
    op.create_index("ix_internship_announcements_status", "internship_announcements", ["status"])

    op.create_table(
        "internship_applications",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
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
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "organization_id",
            "registration_number",
            name="uq_internship_applications_org_registration_number",
        ),
    )
    op.create_index(
        "ix_internship_applications_organization_id",
        "internship_applications",
        ["organization_id"],
    )
    op.create_index(
        "ix_internship_applications_announcement_id",
        "internship_applications",
        ["announcement_id"],
    )
    op.create_index("ix_internship_applications_status", "internship_applications", ["status"])

    op.create_table(
        "internship_certificates",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        _org_id_column(),
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
        sa.UniqueConstraint(
            "application_id",
            name="uq_internship_certificates_application_id",
        ),
        sa.UniqueConstraint(
            "organization_id",
            "certificate_number",
            name="uq_internship_certificates_org_certificate_number",
        ),
        sa.UniqueConstraint(
            "organization_id",
            "verification_code",
            name="uq_internship_certificates_org_verification_code",
        ),
    )
    op.create_index(
        "ix_internship_certificates_organization_id",
        "internship_certificates",
        ["organization_id"],
    )

    op.create_table(
        "internship_counters",
        sa.Column(
            "organization_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("organizations.id", ondelete="RESTRICT"),
            primary_key=True,
        ),
        sa.Column("kind", sa.String(length=20), primary_key=True),
        sa.Column("year", sa.Integer(), primary_key=True),
        sa.Column("last_value", sa.Integer(), nullable=False, server_default="100"),
    )

    op.create_table(
        "platform_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        _org_id_column(),
        sa.Column("organization_name", sa.String(length=160), nullable=False),
        sa.Column("support_email", sa.String(length=255), nullable=False),
        sa.Column("cms_url", sa.String(length=180), nullable=False),
        sa.Column("timezone", sa.String(length=80), nullable=False),
        sa.Column("receipt_prefix", sa.String(length=20), nullable=False),
        sa.Column(
            "public_donations_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "maintenance_mode",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
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
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.UniqueConstraint("organization_id", name="uq_platform_settings_organization_id"),
    )
    op.create_index(
        "ix_platform_settings_organization_id",
        "platform_settings",
        ["organization_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_platform_settings_organization_id", table_name="platform_settings")
    op.drop_table("platform_settings")
    op.drop_table("internship_counters")
    op.drop_index(
        "ix_internship_certificates_organization_id",
        table_name="internship_certificates",
    )
    op.drop_table("internship_certificates")
    op.drop_index("ix_internship_applications_status", table_name="internship_applications")
    op.drop_index(
        "ix_internship_applications_announcement_id",
        table_name="internship_applications",
    )
    op.drop_index(
        "ix_internship_applications_organization_id",
        table_name="internship_applications",
    )
    op.drop_table("internship_applications")
    op.drop_index("ix_internship_announcements_status", table_name="internship_announcements")
    op.drop_index(
        "ix_internship_announcements_organization_id",
        table_name="internship_announcements",
    )
    op.drop_table("internship_announcements")
    op.drop_index("ix_campaign_donations_campaign_id", table_name="campaign_donations")
    op.drop_index("ix_campaign_donations_organization_id", table_name="campaign_donations")
    op.drop_table("campaign_donations")
    op.drop_index("ix_campaigns_status", table_name="campaigns")
    op.drop_index("ix_campaigns_organization_id", table_name="campaigns")
    op.drop_table("campaigns")
    op.drop_index("ix_projects_status", table_name="projects")
    op.drop_index("ix_projects_organization_id", table_name="projects")
    op.drop_table("projects")
    op.drop_index("ix_simple_records_module_record_date", table_name="simple_records")
    op.drop_index("ix_simple_records_module_status", table_name="simple_records")
    op.drop_index("ix_simple_records_organization_id", table_name="simple_records")
    op.drop_table("simple_records")
    op.drop_index("ix_designations_department", table_name="designations")
    op.drop_index("ix_designations_status", table_name="designations")
    op.drop_index("ix_designations_organization_id", table_name="designations")
    op.drop_table("designations")
    op.drop_index("ix_donation_status_events_created_at", table_name="donation_status_events")
    op.drop_index("ix_donation_status_events_donation_id", table_name="donation_status_events")
    op.drop_index(
        "ix_donation_status_events_organization_id",
        table_name="donation_status_events",
    )
    op.drop_table("donation_status_events")
    op.drop_index("ix_donations_gateway_session_id", table_name="donations")
    op.drop_index("ix_donations_payment_status", table_name="donations")
    op.drop_index("ix_donations_organization_id", table_name="donations")
    op.drop_table("donations")
    op.drop_table("receipt_counters")
    op.drop_index("uq_members_org_email_not_null", table_name="members")
    op.drop_index("ix_members_status", table_name="members")
    op.drop_index("ix_members_organization_id", table_name="members")
    op.drop_table("members")
    op.drop_index(
        "ix_organization_memberships_organization_id",
        table_name="organization_memberships",
    )
    op.drop_table("organization_memberships")
    op.drop_table("organizations")
