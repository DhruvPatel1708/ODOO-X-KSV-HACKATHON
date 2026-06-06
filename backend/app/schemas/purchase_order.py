from typing import Any

from pydantic import BaseModel


class PurchaseOrderCreate(BaseModel):
    quotation_id: int | None = None
    vendor_id: int | None = None
    vendor_name: str | None = None
    vendor_gst: str = ""
    vendor_address: str = ""
    rfq_reference: str = ""
    items: list[dict[str, Any]] = []
    subtotal: float = 0
    cgst: float = 0
    sgst: float = 0
    igst: float = 0
    total: float = 0
    status: str = "draft"
    terms: str = "Payment within 30 days of invoice. Delivery as per agreed timelines."


class PurchaseOrderUpdate(BaseModel):
    status: str | None = None
    terms: str | None = None
