from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.purchase_order import PurchaseOrder
from app.models.quotation import Quotation
from app.models.rfq import RFQ
from app.models.user import User
from app.models.vendor import Vendor
from app.routers._helpers import as_dict, log_activity, schema_dump
from app.schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderUpdate


router = APIRouter()


def next_po_number(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(PurchaseOrder).count()
    return f"PO-{year}-{str(count + 1).zfill(4)}"


def create_po_from_quotation(
    db: Session,
    quotation: Quotation,
    actor: str = "System",
    role: str = "admin",
) -> PurchaseOrder:
    existing = (
        db.query(PurchaseOrder)
        .filter(PurchaseOrder.quotation_id == quotation.id)
        .first()
    )
    if existing:
        return existing

    vendor = db.query(Vendor).filter(Vendor.id == quotation.vendor_id).first()
    rfq = db.query(RFQ).filter(RFQ.id == quotation.rfq_id).first()
    items = []
    for item in quotation.items or []:
        quantity = float(item.get("quantity") or 0)
        rate = float(item.get("unit_price") or item.get("rate") or 0)
        items.append(
            {
                "description": item.get("item_name") or item.get("description") or "Item",
                "hsn": item.get("hsn", ""),
                "quantity": quantity,
                "unit": item.get("unit", "Nos"),
                "rate": rate,
                "amount": quantity * rate,
            }
        )

    tax = float(quotation.tax or 0)
    po = PurchaseOrder(
        po_number=next_po_number(db),
        quotation_id=quotation.id,
        vendor_id=quotation.vendor_id,
        vendor_name=quotation.vendor_name,
        vendor_gst=vendor.gst_number if vendor else "",
        vendor_address=(
            f"{vendor.address}, {vendor.city}, {vendor.state} {vendor.pincode}"
            if vendor
            else ""
        ),
        rfq_reference=rfq.rfq_number if rfq else f"RFQ-{quotation.rfq_id}",
        items=items,
        subtotal=quotation.subtotal,
        cgst=tax / 2,
        sgst=tax / 2,
        igst=0,
        total=quotation.total_amount,
        created_date=date.today().isoformat(),
        status="draft",
        terms="Payment within 30 days of invoice. Delivery as per agreed timelines.",
    )
    db.add(po)
    db.flush()
    log_activity(
        db,
        type="po",
        action=f"Purchase Order {po.po_number} generated",
        actor=actor,
        role=role,
        entity=po.po_number,
    )
    return po


@router.get("")
def list_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [as_dict(po) for po in db.query(PurchaseOrder).order_by(PurchaseOrder.id.desc()).all()]


@router.get("/{po_id}")
def get_purchase_order(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return as_dict(po)


@router.post("")
def create_purchase_order(
    payload: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = schema_dump(payload)
    if data.get("quotation_id"):
        quotation = db.query(Quotation).filter(Quotation.id == data["quotation_id"]).first()
        if not quotation:
            raise HTTPException(status_code=404, detail="Quotation not found")
        po = create_po_from_quotation(db, quotation, current_user.name, current_user.role)
    else:
        po = PurchaseOrder(
            po_number=next_po_number(db),
            vendor_id=data.get("vendor_id") or 0,
            vendor_name=data.get("vendor_name") or "",
            vendor_gst=data.get("vendor_gst", ""),
            vendor_address=data.get("vendor_address", ""),
            rfq_reference=data.get("rfq_reference", ""),
            items=data.get("items", []),
            subtotal=data.get("subtotal", 0),
            cgst=data.get("cgst", 0),
            sgst=data.get("sgst", 0),
            igst=data.get("igst", 0),
            total=data.get("total", 0),
            created_date=date.today().isoformat(),
            status=data.get("status", "draft"),
            terms=data.get("terms", ""),
        )
        db.add(po)
        db.flush()
        log_activity(
            db,
            type="po",
            action=f"Purchase Order {po.po_number} generated",
            actor=current_user.name,
            role=current_user.role,
            entity=po.po_number,
        )
    db.commit()
    db.refresh(po)
    return as_dict(po)


@router.post("/generate/{quotation_id}")
def generate_purchase_order(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    po = create_po_from_quotation(db, quotation, current_user.name, current_user.role)
    db.commit()
    db.refresh(po)
    return as_dict(po)


@router.put("/{po_id}")
def update_purchase_order(
    po_id: int,
    payload: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    for key, value in schema_dump(payload, exclude_unset=True).items():
        setattr(po, key, value)
    db.commit()
    db.refresh(po)
    return as_dict(po)
