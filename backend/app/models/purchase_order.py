from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, Text

from app.database import Base


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True, index=True, nullable=False)
    vendor_id = Column(Integer, nullable=False)
    vendor_name = Column(String, nullable=False)
    vendor_gst = Column(String, default="")
    vendor_address = Column(String, default="")
    rfq_reference = Column(String, default="")
    quotation_id = Column(Integer, nullable=True)
    items = Column(JSON, default=list)
    subtotal = Column(Float, default=0)
    cgst = Column(Float, default=0)
    sgst = Column(Float, default=0)
    igst = Column(Float, default=0)
    total = Column(Float, default=0)
    created_date = Column(String, nullable=False)
    status = Column(String, default="draft")
    terms = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
