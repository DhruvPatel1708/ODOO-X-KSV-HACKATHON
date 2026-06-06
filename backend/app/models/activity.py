from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    action = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    role = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
