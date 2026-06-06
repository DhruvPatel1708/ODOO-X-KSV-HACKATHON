from pydantic import BaseModel


class ActivityCreate(BaseModel):
    type: str
    action: str
    actor: str
    role: str
    entity: str
