"""SQLAlchemy ORM models for database tables"""
import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Boolean, Text, DateTime, Integer, ForeignKey, Index, Enum
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.orm import relationship
from app.database import Base


# Enums for versioning system
class VersionState(str, PyEnum):
    """State of a portfolio version"""
    DRAFT = "draft"
    COMMITTED = "committed"


class VersionCreatedBy(str, PyEnum):
    """Source that created a version"""
    AI = "ai"
    USER_MANUAL = "user_manual"
    AI_REFINEMENT = "ai_refinement"


# Use UUID type that works with both PostgreSQL and SQLite
def get_uuid():
    return str(uuid.uuid4())


class Portfolio(Base):
    """Portfolio table storing all user portfolio data"""
    __tablename__ = "portfolios"

    # Primary key
    id = Column(String(36), primary_key=True, default=get_uuid)

    # Portfolio identification
    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    portfolio_focus = Column(
        String(50),
        nullable=False,
        default="general"
    )  # Options: fullstack, backend, ml, competitive, general

    # Portfolio status
    status = Column(
        String(20),
        nullable=False,
        default="draft"
    )  # Options: draft, generating, completed, error

    # Data source flags
    has_linkedin = Column(Boolean, default=False)
    has_resume = Column(Boolean, default=False)
    has_github = Column(Boolean, default=False)
    has_codeforces = Column(Boolean, default=False)
    has_leetcode = Column(Boolean, default=False)

    # Raw input data (stored as JSON)
    linkedin_data = Column(SQLiteJSON, nullable=True)
    resume_text = Column(Text, nullable=True)
    github_data = Column(SQLiteJSON, nullable=True)
    codeforces_data = Column(SQLiteJSON, nullable=True)
    leetcode_data = Column(SQLiteJSON, nullable=True)

    # Generated output (stored as JSON)
    public_portfolio_json = Column(SQLiteJSON, nullable=True)
    private_coaching_json = Column(SQLiteJSON, nullable=True)
    ai_generation_metadata = Column(SQLiteJSON, nullable=True)

    # Error tracking
    error_message = Column(Text, nullable=True)

    # Current version reference
    current_version_id = Column(String(36), ForeignKey("portfolio_versions.id"), nullable=True)

    # Timestamps
    generation_started_at = Column(DateTime, nullable=True)
    generation_completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    versions = relationship("PortfolioVersion", back_populates="portfolio", foreign_keys="PortfolioVersion.portfolio_id", cascade="all, delete-orphan")
    current_version = relationship("PortfolioVersion", foreign_keys=[current_version_id], uselist=False, post_update=True)

    # Indexes for performance
    __table_args__ = (
        Index('idx_portfolio_slug', 'slug'),
        Index('idx_portfolio_status', 'status'),
        Index('idx_portfolio_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<Portfolio(slug='{self.slug}', name='{self.name}', status='{self.status}')>"


class PortfolioVersion(Base):
    """Portfolio version table for tracking edit history"""
    __tablename__ = "portfolio_versions"

    # Primary key
    id = Column(String(36), primary_key=True, default=get_uuid)

    # Foreign key to portfolio
    portfolio_id = Column(String(36), ForeignKey("portfolios.id"), nullable=False)

    # Version tracking
    version_number = Column(Integer, nullable=False)
    version_state = Column(Enum(VersionState), default=VersionState.DRAFT, nullable=False)

    # Snapshot of portfolio content at this version
    public_portfolio_json = Column(SQLiteJSON, nullable=False)
    private_coaching_json = Column(SQLiteJSON, nullable=True)

    # Version metadata
    changes_summary = Column(Text, nullable=True)
    created_by = Column(Enum(VersionCreatedBy), default=VersionCreatedBy.AI, nullable=False)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    portfolio = relationship("Portfolio", back_populates="versions", foreign_keys=[portfolio_id])

    # Indexes for performance
    __table_args__ = (
        Index('idx_version_portfolio_id', 'portfolio_id'),
        Index('idx_version_state', 'version_state'),
        Index('idx_version_created_at', 'created_at'),
        Index('idx_version_portfolio_number', 'portfolio_id', 'version_number'),
    )

    def __repr__(self):
        return f"<PortfolioVersion(portfolio_id='{self.portfolio_id}', version={self.version_number})>"
