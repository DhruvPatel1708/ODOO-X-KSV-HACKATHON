from io import BytesIO


def build_invoice_pdf(invoice: dict) -> bytes:
    buffer = BytesIO()
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas

        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 50

        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(50, y, "VendorBridge Enterprises")
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawRightString(width - 50, y, "TAX INVOICE")

        y -= 35
        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y, f"Invoice: {invoice.get('invoice_number', '')}")
        pdf.drawRightString(width - 50, y, f"Date: {invoice.get('invoice_date', '')}")

        y -= 25
        pdf.drawString(50, y, f"Bill To: {invoice.get('vendor_name', '')}")
        y -= 15
        pdf.drawString(50, y, f"GST: {invoice.get('vendor_gst', '')}")
        y -= 15
        pdf.drawString(50, y, f"PO Reference: {invoice.get('po_reference', '')}")

        y -= 30
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(50, y, "Description")
        pdf.drawRightString(360, y, "Qty")
        pdf.drawRightString(450, y, "Rate")
        pdf.drawRightString(540, y, "Amount")
        pdf.setFont("Helvetica", 10)
        y -= 18

        for item in invoice.get("items", []):
            if y < 100:
                pdf.showPage()
                y = height - 50
            pdf.drawString(50, y, str(item.get("description", ""))[:45])
            pdf.drawRightString(360, y, str(item.get("quantity", "")))
            pdf.drawRightString(450, y, f"{float(item.get('rate') or 0):,.0f}")
            pdf.drawRightString(540, y, f"{float(item.get('amount') or 0):,.0f}")
            y -= 16

        y -= 20
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawRightString(540, y, f"Total: INR {float(invoice.get('total') or 0):,.0f}")
        pdf.save()
        return buffer.getvalue()
    except Exception:
        text = (
            f"VendorBridge Invoice\n\n"
            f"Invoice: {invoice.get('invoice_number', '')}\n"
            f"Vendor: {invoice.get('vendor_name', '')}\n"
            f"Total: {invoice.get('total', 0)}\n"
        )
        return text.encode("utf-8")
