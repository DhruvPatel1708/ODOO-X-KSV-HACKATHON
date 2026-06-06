from pydantic import BaseModel


class ApprovalCreate(BaseModel):
    rfq_id: int
    quotation_id: int | None = None
    rfq_title: str
    rfq_number: str
    vendor_name: str
    quote_amount: float
    requested_by: str = "System"
    remarks: str = ""


class ApprovalDecision(BaseModel):
    remarks: str = ""
