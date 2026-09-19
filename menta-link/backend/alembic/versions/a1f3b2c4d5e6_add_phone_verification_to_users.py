"""add phone verification to users and phone otp codes

Revision ID: a1f3b2c4d5e6
Revises: 84489c719acb
Create Date: 2026-09-17 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a1f3b2c4d5e6'
down_revision: Union[str, Sequence[str], None] = '84489c719acb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('phone_number', sa.String(), nullable=True))
    op.add_column('users', sa.Column('is_phone_verified', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    op.create_index(op.f('ix_users_phone_number'), 'users', ['phone_number'], unique=False)

    op.create_table(
        'phone_otp_codes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('code_hash', sa.String(), nullable=False),
        sa.Column('purpose', sa.String(), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_phone_otp_codes_id'), 'phone_otp_codes', ['id'], unique=False)
    op.create_index(
        op.f('ix_phone_otp_codes_phone_number'), 'phone_otp_codes', ['phone_number'], unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_phone_otp_codes_phone_number'), table_name='phone_otp_codes')
    op.drop_index(op.f('ix_phone_otp_codes_id'), table_name='phone_otp_codes')
    op.drop_table('phone_otp_codes')
    op.drop_index(op.f('ix_users_phone_number'), table_name='users')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'is_phone_verified')
    op.drop_column('users', 'phone_number')