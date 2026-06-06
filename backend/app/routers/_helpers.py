from datetime import date, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.activity import Activity


def schema_dump(schema: Any, *, exclude_unset: bool = False) -> dict[str, Any]:
    if hasattr(schema, "model_dump"):
        return schema.model_dump(exclude_unset=exclude_unset)
    return schema.dict(exclude_unset=exclude_unset)


def as_dict(obj: Any, exclude: set[str] | None = None) -> dict[str, Any]:
    exclude = exclude or set()
    data = {}
    for column in obj.__table__.columns:
        if column.name in exclude:
            continue
        value = getattr(obj, column.name)
        if isinstance(value, datetime):
            value = value.isoformat()
        elif isinstance(value, date):
            value = value.isoformat()
        data[column.name] = value
    return data


def make_number(prefix: str, count: int, year: int | None = None) -> str:
    year = year or datetime.utcnow().year
    return f"{prefix}-{year}-{str(count + 1).zfill(4)}"


def log_activity(
    db: Session,
    *,
    type: str,
    action: str,
    actor: str,
    role: str,
    entity: str,
) -> None:
    db.add(
        Activity(
            type=type,
            action=action,
            actor=actor,
            role=role,
            entity=entity,
        )
    )
