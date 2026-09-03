"""merge heads

Revision ID: 84489c719acb
Revises: 58b38960cc5f, b1c2d3e4f5g6
Create Date: 2026-05-28 21:33:53.849391

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '84489c719acb'
down_revision: Union[str, Sequence[str], None] = ('58b38960cc5f', 'b1c2d3e4f5g6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
