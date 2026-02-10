"""add_portfolio_versioning_system

Revision ID: 002_versioning
Revises: 001
Create Date: 2026-02-09 23:25:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '002_versioning'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    """Add versioning system to portfolios"""
    
    # Step 1: Add version_state column to portfolio_versions
    with op.batch_alter_table('portfolio_versions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('version_state', sa.String(20), nullable=False, server_default='committed'))
        batch_op.create_index('idx_version_state', ['version_state'])
        batch_op.create_index('idx_version_portfolio_number', ['portfolio_id', 'version_number'])
    
    # Step 2: Add current_version_id to portfolios (nullable for now)
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('current_version_id', sa.String(36), nullable=True))
    
    # Step 3: Migrate existing data - create version 1 for each portfolio
    connection = op.get_bind()
    
    # Import uuid for ID generation
    import uuid
    
    # Get all portfolios that have public_portfolio_json
    portfolios = connection.execute(
        sa.text("""
            SELECT id, slug, public_portfolio_json, private_coaching_json 
            FROM portfolios 
            WHERE public_portfolio_json IS NOT NULL
        """)
    ).fetchall()
    
    # For each portfolio, create a committed version 1
    for portfolio in portfolios:
        version_id = str(uuid.uuid4())
        
        # Insert version
        connection.execute(
            sa.text("""
                INSERT INTO portfolio_versions 
                (id, portfolio_id, version_number, version_state, public_portfolio_json, private_coaching_json, created_by, created_at)
                VALUES (:id, :portfolio_id, 1, 'committed', :public_json, :private_json, 'ai', datetime('now'))
            """),
            {
                'id': version_id,
                'portfolio_id': portfolio[0],
                'public_json': portfolio[2],
                'private_json': portfolio[3]
            }
        )
        
        # Update portfolio's current_version_id
        connection.execute(
            sa.text("""
                UPDATE portfolios 
                SET current_version_id = :version_id 
                WHERE id = :portfolio_id
            """),
            {'version_id': version_id, 'portfolio_id': portfolio[0]}
        )
    
    # Step 4: Add foreign key constraint for current_version_id
    # Note: SQLite doesn't support adding FK constraints after table creation
    # This will be enforced at the application level
    
    # Step 5: Drop old JSON columns from portfolios (commented out for safety)
    # Uncomment after verifying migration works correctly
    # with op.batch_alter_table('portfolios', schema=None) as batch_op:
    #     batch_op.drop_column('public_portfolio_json')
    #     batch_op.drop_column('private_coaching_json')


def downgrade():
    """Revert versioning system changes"""
    
    # Restore JSON columns to portfolios
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('public_portfolio_json', sqlite.JSON(), nullable=True))
        batch_op.add_column(sa.Column('private_coaching_json', sqlite.JSON(), nullable=True))
    
    # Copy current version data back to portfolio
    connection = op.get_bind()
    connection.execute(
        sa.text("""
            UPDATE portfolios
            SET public_portfolio_json = (
                SELECT public_portfolio_json 
                FROM portfolio_versions 
                WHERE portfolio_versions.id = portfolios.current_version_id
            ),
            private_coaching_json = (
                SELECT private_coaching_json 
                FROM portfolio_versions 
                WHERE portfolio_versions.id = portfolios.current_version_id
            )
            WHERE current_version_id IS NOT NULL
        """)
    )
    
    # Remove current_version_id from portfolios
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.drop_column('current_version_id')
    
    # Remove version_state from portfolio_versions
    with op.batch_alter_table('portfolio_versions', schema=None) as batch_op:
        batch_op.drop_index('idx_version_portfolio_number')
        batch_op.drop_index('idx_version_state')
        batch_op.drop_column('version_state')
