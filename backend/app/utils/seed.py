from datetime import date, datetime, timedelta

from app.database import SessionLocal
from app.models.activity import Activity
from app.models.approval import Approval
from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.quotation import Quotation
from app.models.rfq import RFQ
from app.models.user import User
from app.models.vendor import Vendor
from app.utils.auth import get_password_hash


def seed_database() -> None:
    db = SessionLocal()
    try:
        if db.query(User).first():
            return

        users = [
            User(
                id=1,
                name="Arjun Mehta",
                email="admin@vendorbridge.com",
                password_hash=get_password_hash("admin123"),
                role="admin",
            ),
            User(
                id=2,
                name="Suresh Iyer",
                email="manager@vendorbridge.com",
                password_hash=get_password_hash("manager123"),
                role="manager",
            ),
            User(
                id=3,
                name="Priya Sharma",
                email="vendor@vendorbridge.com",
                password_hash=get_password_hash("vendor123"),
                role="vendor",
            ),
        ]

        vendors = [
            Vendor(
                id=1,
                company_name="Tata Steel Industries",
                category="Manufacturing",
                gst_number="27AABCT1332L1ZL",
                pan="AABCT1332L",
                contact_person="Rajesh Kumar",
                phone="9876543210",
                email="rajesh@tatasteel.com",
                address="45 Industrial Area, Phase II",
                city="Mumbai",
                state="Maharashtra",
                pincode="400076",
                status="active",
                rating=4.5,
                total_orders=24,
            ),
            Vendor(
                id=2,
                company_name="Infosys Technologies",
                category="IT",
                gst_number="29AABCI5978K1ZI",
                pan="AABCI5978K",
                contact_person="Priya Sharma",
                phone="9845123456",
                email="priya.sharma@infosys.com",
                address="23 Electronics City",
                city="Bengaluru",
                state="Karnataka",
                pincode="560100",
                status="active",
                rating=4.8,
                total_orders=18,
            ),
            Vendor(
                id=3,
                company_name="BlueDart Logistics",
                category="Logistics",
                gst_number="27AABCB0123N1ZP",
                pan="AABCB0123N",
                contact_person="Vikram Patel",
                phone="9812345678",
                email="vikram@bluedart.com",
                address="78 Transport Nagar",
                city="Delhi",
                state="Delhi",
                pincode="110020",
                status="active",
                rating=3.9,
                total_orders=32,
            ),
            Vendor(
                id=4,
                company_name="Wipro Enterprises",
                category="Services",
                gst_number="29AABCW4567L1ZQ",
                pan="AABCW4567L",
                contact_person="Sneha Reddy",
                phone="9901234567",
                email="sneha.reddy@wipro.com",
                address="12 Sarjapur Road",
                city="Bengaluru",
                state="Karnataka",
                pincode="560035",
                status="active",
                rating=4.2,
                total_orders=15,
            ),
        ]

        rfqs = [
            RFQ(
                id=1,
                rfq_number="RFQ-2026-001",
                title="Office IT Infrastructure Upgrade",
                description="Servers, networking equipment, and workstations.",
                items=[
                    {"id": 1, "item_name": "Dell PowerEdge R740 Server", "description": "Rack-mounted server, 32GB RAM", "quantity": 5, "unit": "Nos"},
                    {"id": 2, "item_name": "Cisco Catalyst Switch 9300", "description": "48-port managed switch", "quantity": 10, "unit": "Nos"},
                    {"id": 3, "item_name": "HP EliteDesk 800 G6", "description": "Desktop workstation, i7, 16GB", "quantity": 50, "unit": "Nos"},
                ],
                vendors_invited=[2, 4],
                deadline="2026-07-20",
                status="active",
                quotations_received=2,
                created_at=datetime.utcnow() - timedelta(days=10),
                created_by="Arjun Mehta",
            ),
            RFQ(
                id=2,
                rfq_number="RFQ-2026-002",
                title="Raw Material Procurement - Steel",
                description="Steel bars and sheets for Q3 manufacturing requirements.",
                items=[
                    {"id": 1, "item_name": "TMT Steel Bars 12mm", "description": "Fe500D grade", "quantity": 200, "unit": "MT"},
                    {"id": 2, "item_name": "HR Steel Sheet 2mm", "description": "Hot rolled, IS2062", "quantity": 100, "unit": "MT"},
                ],
                vendors_invited=[1],
                deadline="2026-07-25",
                status="active",
                quotations_received=1,
                created_at=datetime.utcnow() - timedelta(days=8),
                created_by="Arjun Mehta",
            ),
            RFQ(
                id=3,
                rfq_number="RFQ-2026-003",
                title="Annual Logistics Contract",
                description="Pan-India logistics and freight forwarding services.",
                items=[
                    {"id": 1, "item_name": "Intra-city Delivery", "description": "Same-day delivery within city", "quantity": 5000, "unit": "Trips"},
                    {"id": 2, "item_name": "Interstate Freight", "description": "Full truck load, pan-India", "quantity": 500, "unit": "Trips"},
                ],
                vendors_invited=[3],
                deadline="2026-08-05",
                status="draft",
                quotations_received=0,
                created_at=datetime.utcnow() - timedelta(days=4),
                created_by="Arjun Mehta",
            ),
        ]

        quotations = [
            Quotation(
                id=1,
                quote_number="QT-2026-001",
                rfq_id=1,
                rfq_title="Office IT Infrastructure Upgrade",
                vendor_id=2,
                vendor_name="Infosys Technologies",
                items=[
                    {"item_name": "Dell PowerEdge R740 Server", "quantity": 5, "unit": "Nos", "unit_price": 285000, "tax_percent": 18, "total": 1681500},
                    {"item_name": "Cisco Catalyst Switch 9300", "quantity": 10, "unit": "Nos", "unit_price": 145000, "tax_percent": 18, "total": 1711000},
                    {"item_name": "HP EliteDesk 800 G6", "quantity": 50, "unit": "Nos", "unit_price": 68000, "tax_percent": 18, "total": 4012000},
                ],
                subtotal=6275000,
                tax=1129500,
                total_amount=7404500,
                delivery_days=21,
                notes="Includes 3-year warranty and on-site installation.",
                submitted_on="2026-06-01",
                status="submitted",
            ),
            Quotation(
                id=2,
                quote_number="QT-2026-002",
                rfq_id=1,
                rfq_title="Office IT Infrastructure Upgrade",
                vendor_id=4,
                vendor_name="Wipro Enterprises",
                items=[
                    {"item_name": "Dell PowerEdge R740 Server", "quantity": 5, "unit": "Nos", "unit_price": 275000, "tax_percent": 18, "total": 1622500},
                    {"item_name": "Cisco Catalyst Switch 9300", "quantity": 10, "unit": "Nos", "unit_price": 152000, "tax_percent": 18, "total": 1793600},
                    {"item_name": "HP EliteDesk 800 G6", "quantity": 50, "unit": "Nos", "unit_price": 65000, "tax_percent": 18, "total": 3835000},
                ],
                subtotal=6075000,
                tax=1093500,
                total_amount=7168500,
                delivery_days=28,
                notes="Free shipping and standard warranty.",
                submitted_on="2026-06-02",
                status="submitted",
            ),
            Quotation(
                id=3,
                quote_number="QT-2026-003",
                rfq_id=2,
                rfq_title="Raw Material Procurement - Steel",
                vendor_id=1,
                vendor_name="Tata Steel Industries",
                items=[
                    {"item_name": "TMT Steel Bars 12mm", "quantity": 200, "unit": "MT", "unit_price": 52000, "tax_percent": 18, "total": 12272000},
                    {"item_name": "HR Steel Sheet 2mm", "quantity": 100, "unit": "MT", "unit_price": 62000, "tax_percent": 18, "total": 7316000},
                ],
                subtotal=16600000,
                tax=2988000,
                total_amount=19588000,
                delivery_days=14,
                notes="Ex-factory price.",
                submitted_on="2026-06-03",
                status="accepted",
            ),
        ]

        approvals = [
            Approval(
                id=1,
                rfq_id=1,
                quotation_id=2,
                rfq_title="Office IT Infrastructure Upgrade",
                rfq_number="RFQ-2026-001",
                vendor_name="Wipro Enterprises",
                quote_amount=7168500,
                requested_by="Arjun Mehta",
                requested_date="2026-06-03",
                status="pending",
                remarks="",
                approver=None,
                action_date=None,
                step=1,
            ),
            Approval(
                id=2,
                rfq_id=2,
                quotation_id=3,
                rfq_title="Raw Material Procurement - Steel",
                rfq_number="RFQ-2026-002",
                vendor_name="Tata Steel Industries",
                quote_amount=19588000,
                requested_by="Arjun Mehta",
                requested_date="2026-06-04",
                status="approved",
                remarks="Best price for required quality.",
                approver="Suresh Iyer",
                action_date="2026-06-05",
                step=3,
            ),
        ]

        purchase_orders = [
            PurchaseOrder(
                id=1,
                po_number="PO-2026-0001",
                quotation_id=3,
                vendor_id=1,
                vendor_name="Tata Steel Industries",
                vendor_gst="27AABCT1332L1ZL",
                vendor_address="45 Industrial Area, Phase II, Mumbai, Maharashtra 400076",
                rfq_reference="RFQ-2026-002",
                items=[
                    {"description": "TMT Steel Bars 12mm", "hsn": "7214", "quantity": 200, "unit": "MT", "rate": 52000, "amount": 10400000},
                    {"description": "HR Steel Sheet 2mm", "hsn": "7208", "quantity": 100, "unit": "MT", "rate": 62000, "amount": 6200000},
                ],
                subtotal=16600000,
                cgst=1494000,
                sgst=1494000,
                igst=0,
                total=19588000,
                created_date="2026-06-05",
                status="sent",
                terms="Payment within 45 days. Material quality as per BIS standards.",
            )
        ]

        invoices = [
            Invoice(
                id=1,
                invoice_number="INV-2026-0001",
                purchase_order_id=1,
                po_reference="PO-2026-0001",
                vendor_id=1,
                vendor_name="Tata Steel Industries",
                vendor_gst="27AABCT1332L1ZL",
                vendor_address="45 Industrial Area, Phase II, Mumbai, Maharashtra 400076",
                vendor_email="rajesh@tatasteel.com",
                items=[
                    {"sno": 1, "description": "TMT Steel Bars 12mm", "hsn": "7214", "quantity": 200, "unit": "MT", "rate": 52000, "amount": 10400000},
                    {"sno": 2, "description": "HR Steel Sheet 2mm", "hsn": "7208", "quantity": 100, "unit": "MT", "rate": 62000, "amount": 6200000},
                ],
                subtotal=16600000,
                cgst=1494000,
                sgst=1494000,
                igst=0,
                total=19588000,
                invoice_date="2026-06-05",
                due_date="2026-07-05",
                status="sent",
                bank_details={
                    "bank_name": "HDFC Bank",
                    "account_number": "50100123456789",
                    "ifsc": "HDFC0001234",
                    "branch": "BKC Mumbai",
                },
            )
        ]

        now = datetime.utcnow()
        activities = [
            Activity(id=1, type="rfq", action="Arjun Mehta created RFQ-2026-001", actor="Arjun Mehta", role="admin", entity="RFQ-2026-001", timestamp=now - timedelta(hours=2)),
            Activity(id=2, type="quotation", action="Wipro Enterprises submitted QT-2026-002", actor="Sneha Reddy", role="vendor", entity="QT-2026-002", timestamp=now - timedelta(hours=5)),
            Activity(id=3, type="quotation", action="Infosys Technologies submitted QT-2026-001", actor="Priya Sharma", role="vendor", entity="QT-2026-001", timestamp=now - timedelta(hours=8)),
            Activity(id=4, type="approval", action="Suresh Iyer approved RFQ-2026-002 for Tata Steel Industries", actor="Suresh Iyer", role="manager", entity="RFQ-2026-002", timestamp=now - timedelta(days=1)),
            Activity(id=5, type="po", action="Purchase Order PO-2026-0001 generated", actor="Arjun Mehta", role="admin", entity="PO-2026-0001", timestamp=now - timedelta(days=1, hours=2)),
            Activity(id=6, type="invoice", action="Invoice INV-2026-0001 created for PO-2026-0001", actor="Arjun Mehta", role="admin", entity="INV-2026-0001", timestamp=now - timedelta(days=1, hours=3)),
        ]

        db.add_all(users + vendors + rfqs + quotations + approvals + purchase_orders + invoices + activities)
        db.commit()
    finally:
        db.close()
