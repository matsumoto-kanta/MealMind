"""add_meals_table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-01 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types using PL/pgSQL to handle existing types gracefully
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mealtypeenum') THEN
                CREATE TYPE mealtypeenum AS ENUM ('breakfast', 'lunch', 'dinner');
            END IF;
        END
        $$;
    """)
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mealstatusenum') THEN
                CREATE TYPE mealstatusenum AS ENUM ('draft', 'confirmed');
            END IF;
        END
        $$;
    """)

    # Enum types for SQLAlchemy
    meal_type_enum = postgresql.ENUM(
        "breakfast", "lunch", "dinner", name="mealtypeenum", create_type=False
    )
    meal_status_enum = postgresql.ENUM("draft", "confirmed", name="mealstatusenum", create_type=False)

    # Create meals table
    op.create_table(
        "meals",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("meal_date", sa.Date(), nullable=False),
        sa.Column("meal_type", meal_type_enum, nullable=False),
        sa.Column("status", meal_status_enum, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("kcal", sa.Integer(), nullable=False),
        sa.Column("cost", sa.Integer(), nullable=False),
        sa.Column("protein", sa.Integer(), nullable=False),
        sa.Column("fat", sa.Integer(), nullable=False),
        sa.Column("carbohydrates", sa.Integer(), nullable=False),
        sa.Column(
            "ingredients", postgresql.JSON(astext_type=sa.Text()), nullable=False
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id", "meal_date", "meal_type", name="uix_user_meal_date_type"
        ),
    )
    op.create_index(op.f("ix_meals_user_id"), "meals", ["user_id"], unique=False)
    op.create_index(op.f("ix_meals_meal_date"), "meals", ["meal_date"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_meals_meal_date"), table_name="meals")
    op.drop_index(op.f("ix_meals_user_id"), table_name="meals")
    op.drop_table("meals")

    # Drop enum types
    meal_type_enum = postgresql.ENUM(
        "breakfast", "lunch", "dinner", name="mealtypeenum"
    )
    meal_status_enum = postgresql.ENUM("draft", "confirmed", name="mealstatusenum")
    meal_type_enum.drop(op.get_bind())
    meal_status_enum.drop(op.get_bind())
