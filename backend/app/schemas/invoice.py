from typing import Any

from pydantic import BaseModel, EmailStr


class InvoiceCreate(BaseModel):
    purchase_order_id: int | None = None
    po_reference: str | None = None
    vendor_id: int | None = None
    vendor_name: str | None = None
    vendor_gst: str = ""
    vendor_address: str = ""
    vendor_email: EmailStr | str = ""
    items: list[dict[str, Any]] = []
    subtotal: float = 0
    cgst: float = 0
    sgst: float = 0
    igst: float = 0
    total: float = 0
    due_date: str | None = None
    status: str = "draft"
    bank_details: dict[str, Any] = {}


class InvoiceEmail(BaseModel):
    to: EmailStr | str
    subject: str
    body: str


class InvoiceUpdate(BaseModel):
    status: str | None = None
