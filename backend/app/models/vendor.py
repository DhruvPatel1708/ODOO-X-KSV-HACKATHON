from sqlalchemy import Column, Float, Integer, String

from app.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    gst_number = Column(String, unique=True, index=True, nullable=False)
    pan = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    status = Column(String, default="active")
    rating = Column(Float, default=0)
    total_orders = Column(Integer, default=0)
