from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.database import Base


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, nullable=False)
    quotation_id = Column(Integer, nullable=True)
    rfq_title = Column(String, nullable=False)
    rfq_number = Column(String, nullable=False)
    vendor_name = Column(String, nullable=False)
    quote_amount = Column(Float, default=0)
    requested_by = Column(String, default="System")
    requested_date = Column(String, nullable=False)
    status = Column(String, default="pending")
    remarks = Column(Text, default="")
    approver = Column(String, nullable=True)
    action_date = Column(String, nullable=True)
    step = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
