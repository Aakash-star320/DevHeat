"""add isolated career coach conversations

Revision ID: 003_conversations
Revises: 874d04192ae1
Create Date: 2026-07-24
"""
from alembic import op
import sqlalchemy as sa


revision = "003_conversations"
down_revision = "874d04192ae1"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "conversations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("conversation_type", sa.String(length=30), nullable=False, server_default="career_coach"),
        sa.Column("title", sa.String(length=160), nullable=False, server_default="New conversation"),
        sa.Column("state_json", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_conversation_user_updated", "conversations", ["user_id", "updated_at"])
    op.create_index("idx_conversation_user_type", "conversations", ["user_id", "conversation_type"])

    # Some deployments created chat_messages via Base.metadata.create_all rather
    # than the historic Alembic chain. Alter it only when it already exists; a
    # fresh bootstrap creates it from the current ORM model with this field.
    inspector = sa.inspect(op.get_bind())
    if "chat_messages" in inspector.get_table_names():
        with op.batch_alter_table("chat_messages") as batch_op:
            batch_op.add_column(sa.Column("conversation_id", sa.String(length=36), nullable=True))
            batch_op.create_index("idx_chat_conversation_created", ["conversation_id", "created_at"])


def downgrade():
    inspector = sa.inspect(op.get_bind())
    if "chat_messages" in inspector.get_table_names():
        columns = {column["name"] for column in inspector.get_columns("chat_messages")}
        if "conversation_id" in columns:
            with op.batch_alter_table("chat_messages") as batch_op:
                batch_op.drop_index("idx_chat_conversation_created")
                batch_op.drop_column("conversation_id")
    op.drop_index("idx_conversation_user_type", table_name="conversations")
    op.drop_index("idx_conversation_user_updated", table_name="conversations")
    op.drop_table("conversations")
