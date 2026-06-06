from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.routers._helpers import as_dict
from app.schemas.user import AuthResponse, UserCreate, UserLogin
from app.utils.auth import create_access_token, get_password_hash, verify_password


router = APIRouter()


def user_payload(user: User) -> dict:
    return as_dict(user, exclude={"password_hash", "created_at"})


@router.post("/signup", response_model=AuthResponse)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"token": token, "user": user_payload(user)}


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"token": token, "user": user_payload(user)}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return user_payload(current_user)
