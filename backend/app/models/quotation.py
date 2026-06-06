from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, Text

from app.database import Base


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    quote_number = Column(String, unique=True, index=True, nullable=False)
    rfq_id = Column(Integer, nullable=False)
    rfq_title = Column(String, nullable=False)
    vendor_id = Column(Integer, nullable=False)
    vendor_name = Column(String, nullable=False)
    items = Column(JSON, default=list)
    subtotal = Column(Float, default=0)
    tax = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    delivery_days = Column(Integer, default=0)
    notes = Column(Text, default="")
    submitted_on = Column(String, nullable=False)
    status = Column(String, default="submitted")
    created_at = Column(DateTime, default=datetime.utcnow)
