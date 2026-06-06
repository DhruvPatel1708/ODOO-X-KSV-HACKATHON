def send_invoice_email(to: str, subject: str, body: str) -> dict:
    return {
        "success": True,
        "message": "Email accepted for demo delivery",
        "to": to,
        "subject": subject,
    }
