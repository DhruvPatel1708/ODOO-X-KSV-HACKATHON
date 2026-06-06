from datetime import date, datetime, timedelta
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.user import User
from app.models.vendor import Vendor
from app.routers._helpers import as_dict, log_activity, schema_dump
from app.schemas.invoice import InvoiceCreate, InvoiceEmail, InvoiceUpdate
from app.services.email_service import send_invoice_email
from app.services.pdf_service import build_invoice_pdf


router = APIRouter()


DEFAULT_BANK_DETAILS = {
    "bank_name": "HDFC Bank",
    "account_number": "50100123456789",
    "ifsc": "HDFC0001234",
    "branch": "BKC Mumbai",
}


def next_invoice_number(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(Invoice).count()
    return f"INV-{year}-{str(count + 1).zfill(4)}"


def create_invoice_from_po(
    db: Session,
    po: PurchaseOrder,
    actor: str = "System",
    role: str = "admin",
) -> Invoice:
    existing = (
        db.query(Invoice)
        .filter(Invoice.purchase_order_id == po.id)
        .first()
    )
    if existing:
        return existing

    vendor = db.query(Vendor).filter(Vendor.id == po.vendor_id).first()
    items = []
    for index, item in enumerate(po.items or [], start=1):
        items.append(
            {
                "sno": index,
                "description": item.get("description", ""),
                "hsn": item.get("hsn", ""),
                "quantity": item.get("quantity", 0),
                "unit": item.get("unit", "Nos"),
                "rate": item.get("rate", 0),
                "amount": item.get("amount", 0),
            }
        )

    invoice_date = date.today()
    invoice = Invoice(
        invoice_number=next_invoice_number(db),
        purchase_order_id=po.id,
        po_reference=po.po_number,
        vendor_id=po.vendor_id,
        vendor_name=po.vendor_name,
        vendor_gst=po.vendor_gst,
        vendor_address=po.vendor_address,
        vendor_email=vendor.email if vendor else "",
        items=items,
        subtotal=po.subtotal,
        cgst=po.cgst,
        sgst=po.sgst,
        igst=po.igst,
        total=po.total,
        invoice_date=invoice_date.isoformat(),
        due_date=(invoice_date + timedelta(days=30)).isoformat(),
        status="draft",
        bank_details=DEFAULT_BANK_DETAILS,
    )
    db.add(invoice)
    db.flush()
    log_activity(
        db,
        type="invoice",
        action=f"Invoice {invoice.invoice_number} created for {po.po_number}",
        actor=actor,
        role=role,
        entity=invoice.invoice_number,
    )
    return invoice


@router.get("")
def list_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [as_dict(invoice) for invoice in db.query(Invoice).order_by(Invoice.id.desc()).all()]


@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return as_dict(invoice)


@router.post("")
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = schema_dump(payload)
    if data.get("purchase_order_id"):
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == data["purchase_order_id"]).first()
        if not po:
            raise HTTPException(status_code=404, detail="Purchase order not found")
        invoice = create_invoice_from_po(db, po, current_user.name, current_user.role)
    else:
        invoice_date = date.today()
        invoice = Invoice(
            invoice_number=next_invoice_number(db),
            po_reference=data.get("po_reference") or "",
            vendor_id=data.get("vendor_id") or 0,
            vendor_name=data.get("vendor_name") or "",
            vendor_gst=data.get("vendor_gst", ""),
            vendor_address=data.get("vendor_address", ""),
            vendor_email=data.get("vendor_email", ""),
            items=data.get("items", []),
            subtotal=data.get("subtotal", 0),
            cgst=data.get("cgst", 0),
            sgst=data.get("sgst", 0),
            igst=data.get("igst", 0),
            total=data.get("total", 0),
            invoice_date=invoice_date.isoformat(),
            due_date=data.get("due_date") or (invoice_date + timedelta(days=30)).isoformat(),
            status=data.get("status", "draft"),
            bank_details=data.get("bank_details") or DEFAULT_BANK_DETAILS,
        )
        db.add(invoice)
        db.flush()
        log_activity(
            db,
            type="invoice",
            action=f"Invoice {invoice.invoice_number} created",
            actor=current_user.name,
            role=current_user.role,
            entity=invoice.invoice_number,
        )
    db.commit()
    db.refresh(invoice)
    return as_dict(invoice)


@router.post("/generate/{po_id}")
def generate_invoice(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    invoice = create_invoice_from_po(db, po, current_user.name, current_user.role)
    db.commit()
    db.refresh(invoice)
    return as_dict(invoice)


@router.put("/{invoice_id}")
def update_invoice(
    invoice_id: int,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    for key, value in schema_dump(payload, exclude_unset=True).items():
        setattr(invoice, key, value)
    db.commit()
    db.refresh(invoice)
    return as_dict(invoice)


@router.get("/{invoice_id}/download-pdf")
def download_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice_data = as_dict(invoice)
    pdf_bytes = build_invoice_pdf(invoice_data)
    filename = f"{invoice.invoice_number}.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/{invoice_id}/send-email")
def send_email(
    invoice_id: int,
    payload: InvoiceEmail,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    result = send_invoice_email(payload.to, payload.subject, payload.body)
    log_activity(
        db,
        type="invoice",
        action=f"Invoice {invoice.invoice_number} emailed to {payload.to}",
        actor=current_user.name,
        role=current_user.role,
        entity=invoice.invoice_number,
    )
    db.commit()
    return result
