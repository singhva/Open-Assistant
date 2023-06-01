"""Adding category column to Message table

Revision ID: f6480e9f3891
Revises: 048ef2ca8bca
Create Date: 2023-06-01 12:39:27.703024

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = 'f6480e9f3891'
down_revision = '048ef2ca8bca'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("message", sa.Column("category", sqlmodel.sql.sqltypes.AutoString(length=512), nullable=False,
                                       default='General'))


def downgrade() -> None:
    op.drop_column("message", "category")
