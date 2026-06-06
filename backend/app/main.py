from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import activity, approval, invoice, purchase_order, quotation, rfq, user, vendor
from app.routers import (
    activity_logs,
    analytics,
    approvals,
    auth,
    comparison,
    invoices,
    purchase_orders,
    quotations,
    rfqs,
    vendors,
)
from app.utils.seed import seed_database


app = FastAPI(title="VendorBridge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()


@app.get("/")
def root():
    return {"status": "ok", "service": "VendorBridge API"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(vendors.router, prefix="/api/vendors", tags=["vendors"])
app.include_router(rfqs.router, prefix="/api/rfqs", tags=["rfqs"])
app.include_router(quotations.router, prefix="/api/quotations", tags=["quotations"])
app.include_router(comparison.router, prefix="/api/comparison", tags=["comparison"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["approvals"])
app.include_router(
    purchase_orders.router,
    prefix="/api/purchase-orders",
    tags=["purchase-orders"],
)
app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])
app.include_router(activity_logs.router, prefix="/api/activity-logs", tags=["activity-logs"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
