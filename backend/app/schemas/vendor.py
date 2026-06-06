from pydantic import BaseModel, EmailStr


class VendorBase(BaseModel):
    company_name: str
    category: str
    gst_number: str
    pan: str
    contact_person: str
    phone: str
    email: EmailStr
    address: str
    city: str
    state: str
    pincode: str
    status: str = "active"
    rating: float = 0
    total_orders: int = 0


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    company_name: str | None = None
    category: str | None = None
    gst_number: str | None = None
    pan: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    status: str | None = None
    rating: float | None = None
    total_orders: int | None = None
