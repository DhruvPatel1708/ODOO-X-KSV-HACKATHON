from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.rfq import RFQ
from app.models.user import User
from app.models.vendor import Vendor


router = APIRouter()


@router.get("")
def analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vendor_count = db.query(Vendor).count()
    rfq_count = db.query(RFQ).count()
    invoice_count = db.query(Invoice).count()
    total_spend = db.query(func.coalesce(func.sum(Invoice.total), 0)).scalar() or 0
    po_total = db.query(func.coalesce(func.sum(PurchaseOrder.total), 0)).scalar() or 0
    active_vendors = db.query(Vendor).filter(Vendor.status == "active").count()
    active_rfqs = db.query(RFQ).filter(RFQ.status == "active").count()

    return {
        "vendor_count": vendor_count,
        "rfq_count": rfq_count,
        "invoice_count": invoice_count,
        "total_spend": total_spend,
        "po_total": po_total,
        "active_vendors": active_vendors,
        "active_rfqs": active_rfqs,
    }
