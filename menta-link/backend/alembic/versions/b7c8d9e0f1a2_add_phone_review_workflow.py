"""add psychologist and admin phone review workflow

Revision ID: b7c8d9e0f1a2
Revises: a1f3b2c4d5e6
Create Date: 2026-09-21 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "b7c8d9e0f1a2"
down_revision: Union[str, Sequence[str], None] = "a1f3b2c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "phone_verification_status",
            sa.String(),
            nullable=False,
            server_default="pending",
        ),
    )
    op.add_column(
        "users", sa.Column("phone_reviewed_by_id", sa.Integer(), nullable=True)
    )
    op.add_column(
        "users",
        sa.Column("phone_reviewed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column("users", sa.Column("phone_review_note", sa.String(), nullable=True))
    op.add_column(
        "users", sa.Column("phone_approved_by_id", sa.Integer(), nullable=True)
    )
    op.add_column(
        "users",
        sa.Column("phone_approved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute(
        "UPDATE users SET phone_verification_status = 'verified' "
        "WHERE is_phone_verified = TRUE"
    )
    op.alter_column("users", "phone_verification_status", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "phone_approved_at")
    op.drop_column("users", "phone_approved_by_id")
    op.drop_column("users", "phone_review_note")
    op.drop_column("users", "phone_reviewed_at")
    op.drop_column("users", "phone_reviewed_by_id")
    op.drop_column("users", "phone_verification_status")
