from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.rfq import RFQ
from app.models.user import User
from app.routers._helpers import as_dict, log_activity, schema_dump
from app.schemas.rfq import RFQCreate, RFQUpdate


router = APIRouter()


def next_rfq_number(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(RFQ).count()
    return f"RFQ-{year}-{str(count + 1).zfill(3)}"


@router.get("")
def list_rfqs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [as_dict(rfq) for rfq in db.query(RFQ).order_by(RFQ.id.desc()).all()]


@router.get("/{rfq_id}")
def get_rfq(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    return as_dict(rfq)


@router.post("")
def create_rfq(
    payload: RFQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = schema_dump(payload)
    rfq = RFQ(
        **data,
        rfq_number=next_rfq_number(db),
        quotations_received=0,
        created_by=current_user.name,
    )
    db.add(rfq)
    db.flush()
    log_activity(
        db,
        type="rfq",
        action=f"{current_user.name} created {rfq.rfq_number}",
        actor=current_user.name,
        role=current_user.role,
        entity=rfq.rfq_number,
    )
    db.commit()
    db.refresh(rfq)
    return as_dict(rfq)


@router.put("/{rfq_id}")
def update_rfq(
    rfq_id: int,
    payload: RFQUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    for key, value in schema_dump(payload, exclude_unset=True).items():
        setattr(rfq, key, value)

    log_activity(
        db,
        type="rfq",
        action=f"{rfq.rfq_number} updated",
        actor=current_user.name,
        role=current_user.role,
        entity=rfq.rfq_number,
    )
    db.commit()
    db.refresh(rfq)
    return as_dict(rfq)


@router.delete("/{rfq_id}")
def delete_rfq(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    number = rfq.rfq_number
    db.delete(rfq)
    log_activity(
        db,
        type="rfq",
        action=f"{number} deleted",
        actor=current_user.name,
        role=current_user.role,
        entity=number,
    )
    db.commit()
    return {"success": True}
