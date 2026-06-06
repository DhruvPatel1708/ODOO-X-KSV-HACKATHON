# VendorBridge

VendorBridge is a Procurement & Vendor Management ERP designed to streamline procurement workflows through a centralized platform.

## Problem Statement

Traditional procurement processes often involve manual communication, scattered vendor records, delayed approvals, and poor visibility into purchasing activities.

VendorBridge addresses these challenges by providing a unified workflow for vendor management, RFQ creation, quotation comparison, approvals, purchase orders, invoices, and procurement tracking.

---

## Features

### Authentication & Roles

* Secure Login & Signup
* Role-based access control
* Admin
* Procurement Officer
* Vendor
* Manager / Approver

### Vendor Management

* Vendor registration
* Contact information
* GST details
* Vendor status tracking

### RFQ Management

* Create RFQs
* Define products/services
* Manage quantities
* Assign vendors

### Quotation Management

* Vendor quotation submission
* Editable quotations
* Delivery timeline tracking

### Quotation Comparison

* Side-by-side comparison
* Price comparison
* Delivery comparison
* Vendor evaluation

### Approval Workflow

* Approve or reject requests
* Approval remarks
* Status tracking

### Purchase Orders & Invoices

* Purchase order generation
* Invoice generation
* Tax and total calculations
* PDF export support

### Analytics & Tracking

* Procurement dashboard
* Activity logs
* Procurement statistics
* Spending overview

---

## Workflow

Procurement Officer → Create RFQ

Vendor → Submit Quotation

Manager → Approve / Reject

System → Generate Purchase Order

System → Generate Invoice

Dashboard → Track Activities & Analytics

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* Recharts

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* JWT Authentication

### Utilities

* ReportLab (PDF Generation)

---

## Project Structure

vendorbridge/

* frontend/
* backend/

---

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Frontend:

```env
VITE_USE_MOCK_DATA=false
VITE_API_URL=http://localhost:8001/api
```

Backend:

```env
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## Future Scope

* Multi-level approval workflows
* Email notifications
* Advanced analytics
* Vendor performance scoring
* Cloud database support
* Enterprise integrations

---

## Team

Developed during the Odoo KSV Hackathon as a rapid MVP demonstrating end-to-end procurement digitization through a modern ERP workflow.
