"""merge phone field and phone review migration heads

Revision ID: c9d0e1f2a3b4
Revises: e0007c453356, b7c8d9e0f1a2
Create Date: 2026-09-21 00:00:00.000000

"""

from typing import Sequence, Union

revision: str = "c9d0e1f2a3b4"
down_revision: Union[str, Sequence[str], None] = (
    "e0007c453356",
    "b7c8d9e0f1a2",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
