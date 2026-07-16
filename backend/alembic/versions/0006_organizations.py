"""Organizations, memberships, and organization_id backfill.

Revision ID: 0006_organizations
Revises: 0005_donations_integrity
Create Date: 2026-07-15

"""
from __future__ import annotations

import os
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0006_organizations"
down_revision: Union[str, None] = "0005_donations_integrity"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_DOMAIN_TABLES = (
    "members",
    "donations",
    "donation_status_events",
    "designations",
    "simple_records",
    "projects",
    "campaigns",
    "campaign_donations",
    "internship_announcements",
    "internship_applications",
    "internship_certificates",
    "platform_settings",
)


def _seed_membership_emails() -> tuple[str, str]:
    admin = (os.getenv("NEXTAUTH_ADMIN_EMAIL") or "").strip() or "admin@raushni.com"
    staff = (os.getenv("NEXTAUTH_STAFF_EMAIL") or "").strip() or "staff@raushni.com"
    return admin.lower(), staff.lower()


def _add_org_fk(table: str) -> None:
    op.add_column(
        table,
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.execute(
        sa.text(
            f"UPDATE {table} SET organization_id = (SELECT id FROM organizations WHERE slug = 'raushni')"
        )
    )
    op.alter_column(table, "organization_id", nullable=False)
    op.create_foreign_key(
        f"fk_{table}_organization_id",
        table,
        "organizations",
        ["organization_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index(f"ix_{table}_organization_id", table, ["organization_id"])


def upgrade() -> None:
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

    for table in _DOMAIN_TABLES:
        _add_org_fk(table)

    # receipt_counters: composite PK (organization_id, year)
    op.add_column(
        "receipt_counters",
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.execute(
        sa.text(
            "UPDATE receipt_counters SET organization_id = "
            "(SELECT id FROM organizations WHERE slug = 'raushni')"
        )
    )
    op.alter_column("receipt_counters", "organization_id", nullable=False)
    op.drop_constraint("receipt_counters_pkey", "receipt_counters", type_="primary")
    op.create_primary_key(
        "pk_receipt_counters",
        "receipt_counters",
        ["organization_id", "year"],
    )
    op.create_foreign_key(
        "fk_receipt_counters_organization_id",
        "receipt_counters",
        "organizations",
        ["organization_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    # internship_counters: composite PK (organization_id, kind, year)
    op.add_column(
        "internship_counters",
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.execute(
        sa.text(
            "UPDATE internship_counters SET organization_id = "
            "(SELECT id FROM organizations WHERE slug = 'raushni')"
        )
    )
    op.alter_column("internship_counters", "organization_id", nullable=False)
    op.drop_constraint("internship_counters_pkey", "internship_counters", type_="primary")
    op.create_primary_key(
        "pk_internship_counters",
        "internship_counters",
        ["organization_id", "kind", "year"],
    )
    op.create_foreign_key(
        "fk_internship_counters_organization_id",
        "internship_counters",
        "organizations",
        ["organization_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    # Rewrite uniques to (organization_id, …)
    op.drop_index("uq_members_email_not_null", table_name="members")
    op.create_index(
        "uq_members_org_email_not_null",
        "members",
        ["organization_id", "email"],
        unique=True,
        postgresql_where=sa.text("email IS NOT NULL"),
    )

    op.drop_constraint("uq_donations_receipt_number", "donations", type_="unique")
    op.create_unique_constraint(
        "uq_donations_org_receipt_number",
        "donations",
        ["organization_id", "receipt_number"],
    )

    op.drop_constraint("uq_designations_code", "designations", type_="unique")
    op.create_unique_constraint(
        "uq_designations_org_code",
        "designations",
        ["organization_id", "code"],
    )

    op.drop_constraint("uq_projects_slug", "projects", type_="unique")
    op.create_unique_constraint(
        "uq_projects_org_slug",
        "projects",
        ["organization_id", "slug"],
    )

    op.drop_constraint("uq_campaigns_slug", "campaigns", type_="unique")
    op.create_unique_constraint(
        "uq_campaigns_org_slug",
        "campaigns",
        ["organization_id", "slug"],
    )

    op.drop_constraint("uq_internship_announcements_slug", "internship_announcements", type_="unique")
    op.create_unique_constraint(
        "uq_internship_announcements_org_slug",
        "internship_announcements",
        ["organization_id", "slug"],
    )

    op.drop_constraint(
        "uq_internship_applications_registration_number",
        "internship_applications",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_internship_applications_org_registration_number",
        "internship_applications",
        ["organization_id", "registration_number"],
    )

    op.drop_constraint(
        "uq_internship_certificates_certificate_number",
        "internship_certificates",
        type_="unique",
    )
    op.drop_constraint(
        "uq_internship_certificates_verification_code",
        "internship_certificates",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_internship_certificates_org_certificate_number",
        "internship_certificates",
        ["organization_id", "certificate_number"],
    )
    op.create_unique_constraint(
        "uq_internship_certificates_org_verification_code",
        "internship_certificates",
        ["organization_id", "verification_code"],
    )

    # One settings row per org
    op.create_unique_constraint(
        "uq_platform_settings_organization_id",
        "platform_settings",
        ["organization_id"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_platform_settings_organization_id", "platform_settings", type_="unique")

    op.drop_constraint(
        "uq_internship_certificates_org_verification_code",
        "internship_certificates",
        type_="unique",
    )
    op.drop_constraint(
        "uq_internship_certificates_org_certificate_number",
        "internship_certificates",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_internship_certificates_verification_code",
        "internship_certificates",
        ["verification_code"],
    )
    op.create_unique_constraint(
        "uq_internship_certificates_certificate_number",
        "internship_certificates",
        ["certificate_number"],
    )

    op.drop_constraint(
        "uq_internship_applications_org_registration_number",
        "internship_applications",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_internship_applications_registration_number",
        "internship_applications",
        ["registration_number"],
    )

    op.drop_constraint(
        "uq_internship_announcements_org_slug",
        "internship_announcements",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_internship_announcements_slug",
        "internship_announcements",
        ["slug"],
    )

    op.drop_constraint("uq_campaigns_org_slug", "campaigns", type_="unique")
    op.create_unique_constraint("uq_campaigns_slug", "campaigns", ["slug"])

    op.drop_constraint("uq_projects_org_slug", "projects", type_="unique")
    op.create_unique_constraint("uq_projects_slug", "projects", ["slug"])

    op.drop_constraint("uq_designations_org_code", "designations", type_="unique")
    op.create_unique_constraint("uq_designations_code", "designations", ["code"])

    op.drop_constraint("uq_donations_org_receipt_number", "donations", type_="unique")
    op.create_unique_constraint("uq_donations_receipt_number", "donations", ["receipt_number"])

    op.drop_index("uq_members_org_email_not_null", table_name="members")
    op.create_index(
        "uq_members_email_not_null",
        "members",
        ["email"],
        unique=True,
        postgresql_where=sa.text("email IS NOT NULL"),
    )

    op.drop_constraint("fk_internship_counters_organization_id", "internship_counters", type_="foreignkey")
    op.drop_constraint("pk_internship_counters", "internship_counters", type_="primary")
    op.create_primary_key("internship_counters_pkey", "internship_counters", ["kind", "year"])
    op.drop_column("internship_counters", "organization_id")

    op.drop_constraint("fk_receipt_counters_organization_id", "receipt_counters", type_="foreignkey")
    op.drop_constraint("pk_receipt_counters", "receipt_counters", type_="primary")
    op.create_primary_key("receipt_counters_pkey", "receipt_counters", ["year"])
    op.drop_column("receipt_counters", "organization_id")

    for table in reversed(_DOMAIN_TABLES):
        op.drop_index(f"ix_{table}_organization_id", table_name=table)
        op.drop_constraint(f"fk_{table}_organization_id", table, type_="foreignkey")
        op.drop_column(table, "organization_id")

    op.drop_index(
        "ix_organization_memberships_organization_id",
        table_name="organization_memberships",
    )
    op.drop_table("organization_memberships")
    op.drop_table("organizations")
