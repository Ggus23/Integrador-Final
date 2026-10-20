"""Add heuristic context to AI prediction history.

Revision ID: af30b662e3d1
Revises: c9d0e1f2a3b4
Create Date: 2026-10-14
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "af30b662e3d1"
down_revision: Union[str, Sequence[str], None] = "c9d0e1f2a3b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "ai_predictions",
        sa.Column("bad_days_count", sa.Integer(), nullable=True),
    )
    op.add_column(
        "ai_predictions",
        sa.Column("academic_pressure_avg", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("ai_predictions", "academic_pressure_avg")
    op.drop_column("ai_predictions", "bad_days_count")
