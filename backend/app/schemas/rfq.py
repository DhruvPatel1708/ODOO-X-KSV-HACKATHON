from typing import Any

from pydantic import BaseModel


class RFQBase(BaseModel):
    title: str
    description: str = ""
    items: list[dict[str, Any]] = []
    vendors_invited: list[int] = []
    deadline: str
    status: str = "active"


class RFQCreate(RFQBase):
    pass


class RFQUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    items: list[dict[str, Any]] | None = None
    vendors_invited: list[int] | None = None
    deadline: str | None = None
    status: str | None = None
    quotations_received: int | None = None
