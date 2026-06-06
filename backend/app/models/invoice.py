from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String

from app.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    po_reference = Column(String, nullable=False)
    purchase_order_id = Column(Integer, nullable=True)
    vendor_id = Column(Integer, nullable=False)
    vendor_name = Column(String, nullable=False)
    vendor_gst = Column(String, default="")
    vendor_address = Column(String, default="")
    vendor_email = Column(String, default="")
    items = Column(JSON, default=list)
    subtotal = Column(Float, default=0)
    cgst = Column(Float, default=0)
    sgst = Column(Float, default=0)
    igst = Column(Float, default=0)
    total = Column(Float, default=0)
    invoice_date = Column(String, nullable=False)
    due_date = Column(String, nullable=False)
    status = Column(String, default="draft")
    bank_details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
