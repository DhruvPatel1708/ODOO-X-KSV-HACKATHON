from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.quotation import Quotation
from app.models.rfq import RFQ
from app.models.user import User
from app.routers._helpers import as_dict


router = APIRouter()


@router.get("/rfq/{rfq_id}")
def compare_by_rfq(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    quotations = (
        db.query(Quotation)
        .filter(Quotation.rfq_id == rfq_id)
        .order_by(Quotation.total_amount.asc())
        .all()
    )
    quote_dicts = [as_dict(q) for q in quotations]
    lowest_total = quote_dicts[0]["id"] if quote_dicts else None

    lowest_item_prices = {}
    item_names = [item.get("item_name") for item in (rfq.items or [])]
    for item_name in item_names:
        prices = []
        for quote in quote_dicts:
            for item in quote.get("items", []):
                if item.get("item_name") == item_name and item.get("unit_price") is not None:
                    prices.append(item.get("unit_price"))
        if prices:
            lowest_item_prices[item_name] = min(prices)

    return {
        "rfq": as_dict(rfq),
        "quotations": quote_dicts,
        "lowest_total_quote_id": lowest_total,
        "lowest_item_prices": lowest_item_prices,
    }
