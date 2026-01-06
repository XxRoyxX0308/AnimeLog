"""Add role field to users table

Revision ID: add_role_to_users
Revises: 312518ae6e98
Create Date: 2026-01-06

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_role_to_users'
down_revision = '312518ae6e98'
branch_labels = None
depends_on = None


def upgrade():
    # Add role column with default 'user' value
    op.add_column('users', sa.Column('role', sa.String(length=20), nullable=False, server_default='user'))
    # Create index for faster role-based queries
    op.create_index('ix_users_role', 'users', ['role'], unique=False)


def downgrade():
    op.drop_index('ix_users_role', table_name='users')
    op.drop_column('users', 'role')
