from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.approval import Approval
from app.models.quotation import Quotation
from app.models.user import User
from app.routers._helpers import as_dict, log_activity, schema_dump
from app.routers.purchase_orders import create_po_from_quotation
from app.schemas.approval import ApprovalCreate, ApprovalDecision


router = APIRouter()


@router.get("")
def list_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [as_dict(approval) for approval in db.query(Approval).order_by(Approval.id.desc()).all()]


@router.post("")
def create_approval(
    payload: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = schema_dump(payload)
    existing = None
    if data.get("quotation_id"):
        existing = (
            db.query(Approval)
            .filter(Approval.quotation_id == data["quotation_id"], Approval.status == "pending")
            .first()
        )
    if existing:
        return as_dict(existing)

    approval = Approval(
        **data,
        requested_by=data.get("requested_by") or current_user.name,
        requested_date=date.today().isoformat(),
        status="pending",
        step=1,
    )
    db.add(approval)
    db.flush()
    log_activity(
        db,
        type="approval",
        action=f"Approval requested for {approval.rfq_number} and {approval.vendor_name}",
        actor=current_user.name,
        role=current_user.role,
        entity=approval.rfq_number,
    )
    db.commit()
    db.refresh(approval)
    return as_dict(approval)


@router.put("/{approval_id}/approve")
def approve(
    approval_id: int,
    payload: ApprovalDecision | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")

    approval.status = "approved"
    approval.remarks = payload.remarks if payload and payload.remarks else "Approved"
    approval.approver = current_user.name
    approval.action_date = date.today().isoformat()
    approval.step = 3

    if approval.quotation_id:
        quotation = db.query(Quotation).filter(Quotation.id == approval.quotation_id).first()
        if quotation:
            quotation.status = "accepted"
            create_po_from_quotation(db, quotation, current_user.name, current_user.role)

    log_activity(
        db,
        type="approval",
        action=f"{current_user.name} approved {approval.rfq_number} for {approval.vendor_name}",
        actor=current_user.name,
        role=current_user.role,
        entity=approval.rfq_number,
    )
    db.commit()
    db.refresh(approval)
    return as_dict(approval)


@router.put("/{approval_id}/reject")
def reject(
    approval_id: int,
    payload: ApprovalDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")

    approval.status = "rejected"
    approval.remarks = payload.remarks
    approval.approver = current_user.name
    approval.action_date = date.today().isoformat()
    approval.step = 3

    if approval.quotation_id:
        quotation = db.query(Quotation).filter(Quotation.id == approval.quotation_id).first()
        if quotation:
            quotation.status = "rejected"

    log_activity(
        db,
        type="approval",
        action=f"{current_user.name} rejected {approval.rfq_number} for {approval.vendor_name}",
        actor=current_user.name,
        role=current_user.role,
        entity=approval.rfq_number,
    )
    db.commit()
    db.refresh(approval)
    return as_dict(approval)
