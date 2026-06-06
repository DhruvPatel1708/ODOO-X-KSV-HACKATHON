from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.activity import Activity
from app.models.user import User
from app.routers._helpers import as_dict
from app.schemas.activity import ActivityCreate


router = APIRouter()


@router.get("")
def list_activity_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [as_dict(log) for log in db.query(Activity).order_by(Activity.timestamp.desc()).all()]


@router.post("")
def create_activity_log(
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = Activity(**payload.model_dump() if hasattr(payload, "model_dump") else payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return as_dict(log)
