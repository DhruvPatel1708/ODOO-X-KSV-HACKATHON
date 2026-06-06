from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.quotation import Quotation
from app.models.rfq import RFQ
from app.models.user import User
from app.routers._helpers import as_dict, log_activity, schema_dump
from app.schemas.quotation import QuotationCreate, QuotationUpdate


router = APIRouter()


def next_quote_number(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(Quotation).count()
    return f"QT-{year}-{str(count + 1).zfill(3)}"


@router.get("")
def list_quotations(
    rfq_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Quotation)
    if rfq_id is not None:
        query = query.filter(Quotation.rfq_id == rfq_id)
    return [as_dict(q) for q in query.order_by(Quotation.id.desc()).all()]


@router.get("/{quotation_id}")
def get_quotation(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return as_dict(quotation)


@router.post("")
def create_quotation(
    payload: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = schema_dump(payload)
    rfq = db.query(RFQ).filter(RFQ.id == data["rfq_id"]).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    quotation = Quotation(
        quote_number=next_quote_number(db),
        rfq_id=rfq.id,
        rfq_title=rfq.title,
        vendor_id=data.get("vendor_id") or current_user.id,
        vendor_name=data.get("vendor_name") or current_user.name,
        items=data["items"],
        subtotal=data.get("subtotal", 0),
        tax=data.get("tax", 0),
        total_amount=data.get("total_amount", 0),
        delivery_days=data.get("delivery_days", 0),
        notes=data.get("notes", ""),
        submitted_on=date.today().isoformat(),
        status=data.get("status", "submitted"),
    )
    rfq.quotations_received = (rfq.quotations_received or 0) + 1
    db.add(quotation)
    db.flush()
    log_activity(
        db,
        type="quotation",
        action=f"{quotation.vendor_name} submitted {quotation.quote_number}",
        actor=current_user.name,
        role=current_user.role,
        entity=quotation.quote_number,
    )
    db.commit()
    db.refresh(quotation)
    return as_dict(quotation)


@router.put("/{quotation_id}")
def update_quotation(
    quotation_id: int,
    payload: QuotationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    for key, value in schema_dump(payload, exclude_unset=True).items():
        setattr(quotation, key, value)

    log_activity(
        db,
        type="quotation",
        action=f"{quotation.quote_number} updated",
        actor=current_user.name,
        role=current_user.role,
        entity=quotation.quote_number,
    )
    db.commit()
    db.refresh(quotation)
    return as_dict(quotation)
