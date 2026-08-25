from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text

from backend.database import Base


class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    id = Column(Integer, primary_key=True, index=True)

    surname = Column(String(100), nullable=False)
    othernames = Column(String(150), nullable=False)

    email = Column(String(255), nullable=False, index=True)

    project_type = Column(String(100), nullable=False)

    location = Column(String(255), nullable=False)

    budget = Column(String(100), nullable=True)
    timeline = Column(String(100), nullable=True)

    comments = Column(Text, nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="new",
        index=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

