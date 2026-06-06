from typing import Any

from pydantic import BaseModel


class QuotationBase(BaseModel):
    rfq_id: int
    vendor_id: int | None = None
    vendor_name: str | None = None
    items: list[dict[str, Any]]
    subtotal: float = 0
    tax: float = 0
    total_amount: float = 0
    delivery_days: int = 0
    notes: str = ""
    status: str = "submitted"


class QuotationCreate(QuotationBase):
    pass


class QuotationUpdate(BaseModel):
    items: list[dict[str, Any]] | None = None
    subtotal: float | None = None
    tax: float | None = None
    total_amount: float | None = None
    delivery_days: int | None = None
    notes: str | None = None
    status: str | None = None
