"""Add expo_push_token to User

Revision ID: fed61bf1699f
Revises: 1d367e018e2d
Create Date: 2026-05-09 00:22:19.965649

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'fed61bf1699f'
down_revision: Union[str, Sequence[str], None] = '1d367e018e2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('expo_push_token', sa.String(), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'expo_push_token')
    # ### end Alembic commands ###
