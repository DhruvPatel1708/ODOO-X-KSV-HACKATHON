from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.vendor import Vendor
from app.routers._helpers import as_dict, log_activity, schema_dump
from app.schemas.vendor import VendorCreate, VendorUpdate


router = APIRouter()


@router.get("")
def list_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [as_dict(vendor) for vendor in db.query(Vendor).order_by(Vendor.id).all()]


@router.get("/{vendor_id}")
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return as_dict(vendor)


@router.post("")
def create_vendor(
    payload: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vendor = Vendor(**schema_dump(payload))
    db.add(vendor)
    db.flush()
    log_activity(
        db,
        type="vendor",
        action=f"Vendor {vendor.company_name} created",
        actor=current_user.name,
        role=current_user.role,
        entity=vendor.company_name,
    )
    db.commit()
    db.refresh(vendor)
    return as_dict(vendor)


@router.put("/{vendor_id}")
def update_vendor(
    vendor_id: int,
    payload: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    for key, value in schema_dump(payload, exclude_unset=True).items():
        setattr(vendor, key, value)

    log_activity(
        db,
        type="vendor",
        action=f"Vendor {vendor.company_name} updated",
        actor=current_user.name,
        role=current_user.role,
        entity=vendor.company_name,
    )
    db.commit()
    db.refresh(vendor)
    return as_dict(vendor)


@router.delete("/{vendor_id}")
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    name = vendor.company_name
    db.delete(vendor)
    log_activity(
        db,
        type="vendor",
        action=f"Vendor {name} deleted",
        actor=current_user.name,
        role=current_user.role,
        entity=name,
    )
    db.commit()
    return {"success": True}
