import {
  mockActivityLogs,
  mockApprovals,
  mockInvoices,
  mockPurchaseOrders,
  mockQuotations,
  mockRFQs,
  mockUser,
  mockVendors,
} from '../data/mockData';

const clone = (value) => JSON.parse(JSON.stringify(value));
const today = () => new Date().toISOString().split('T')[0];
const nextId = (items) => Math.max(0, ...items.map(item => Number(item.id) || 0)) + 1;

let users = [
  { ...mockUser, password: 'admin123' },
  { id: 2, name: 'Suresh Iyer', email: 'manager@vendorbridge.com', role: 'manager', password: 'manager123' },
  { id: 3, name: 'Priya Sharma', email: 'vendor@vendorbridge.com', role: 'vendor', password: 'vendor123' },
];
let vendors = clone(mockVendors);
let rfqs = clone(mockRFQs);
let quotations = clone(mockQuotations);
let approvals = clone(mockApprovals);
let purchaseOrders = clone(mockPurchaseOrders);
let invoices = clone(mockInvoices);
let activities = clone(mockActivityLogs);

const addActivity = ({ type, action, actor = 'Demo User', role = 'admin', entity = '' }) => {
  activities = [
    { id: nextId(activities), type, action, actor, role, entity, timestamp: new Date().toISOString() },
    ...activities,
  ];
};

export const mockStore = {
  login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const safeUser = { ...user };
    delete safeUser.password;
    return { token: `mock-jwt-token-${Date.now()}`, user: clone(safeUser) };
  },
  signup({ name, email, password, role }) {
    const user = { id: nextId(users), name, email, role, password };
    users = [...users, user];
    const safeUser = { ...user };
    delete safeUser.password;
    return { token: `mock-jwt-token-${Date.now()}`, user: clone(safeUser) };
  },
  listVendors: () => clone(vendors),
  createVendor(data) {
    const vendor = { ...data, id: nextId(vendors), rating: 0, total_orders: 0 };
    vendors = [vendor, ...vendors];
    addActivity({ type: 'vendor', action: `Vendor ${vendor.company_name} created`, entity: vendor.company_name });
    return clone(vendor);
  },
  updateVendor(id, data) {
    let updated;
    vendors = vendors.map(v => {
      if (v.id === Number(id)) {
        updated = { ...v, ...data };
        return updated;
      }
      return v;
    });
    addActivity({ type: 'vendor', action: `Vendor ${updated?.company_name || id} updated`, entity: updated?.company_name || String(id) });
    return clone(updated);
  },
  deleteVendor(id) {
    vendors = vendors.filter(v => v.id !== Number(id));
    return { success: true };
  },
  listRFQs: () => clone(rfqs),
  createRFQ(data) {
    const rfq = {
      ...data,
      id: nextId(rfqs),
      rfq_number: `RFQ-${new Date().getFullYear()}-${String(rfqs.length + 1).padStart(3, '0')}`,
      quotations_received: 0,
      created_at: new Date().toISOString(),
      created_by: 'Arjun Mehta',
    };
    rfqs = [rfq, ...rfqs];
    addActivity({ type: 'rfq', action: `RFQ ${rfq.rfq_number} created`, entity: rfq.rfq_number });
    return clone(rfq);
  },
  updateRFQ(id, data) {
    let updated;
    rfqs = rfqs.map(r => {
      if (r.id === Number(id)) {
        updated = { ...r, ...data };
        return updated;
      }
      return r;
    });
    return clone(updated);
  },
  deleteRFQ(id) {
    rfqs = rfqs.filter(r => r.id !== Number(id));
    return { success: true };
  },
  listQuotations: () => clone(quotations),
  createQuotation(data) {
    const rfq = rfqs.find(r => r.id === Number(data.rfq_id));
    const quote = {
      ...data,
      id: nextId(quotations),
      quote_number: `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      rfq_title: rfq?.title || data.rfq_title || '',
      submitted_on: today(),
      status: data.status || 'submitted',
    };
    quotations = [quote, ...quotations];
    rfqs = rfqs.map(r => r.id === Number(data.rfq_id) ? { ...r, quotations_received: (r.quotations_received || 0) + 1 } : r);
    addActivity({ type: 'quotation', action: `${quote.vendor_name} submitted ${quote.quote_number}`, entity: quote.quote_number });
    return clone(quote);
  },
  updateQuotation(id, data) {
    let updated;
    quotations = quotations.map(q => {
      if (q.id === Number(id)) {
        updated = { ...q, ...data };
        return updated;
      }
      return q;
    });
    return clone(updated);
  },
  compareRFQ(id) {
    const rfq = rfqs.find(r => r.id === Number(id));
    const quoteList = quotations.filter(q => q.rfq_id === Number(id)).sort((a, b) => a.total_amount - b.total_amount);
    return { rfq: clone(rfq), quotations: clone(quoteList), lowest_total_quote_id: quoteList[0]?.id || null };
  },
  listApprovals: () => clone(approvals),
  createApproval(data) {
    const existing = approvals.find(a => a.quotation_id && a.quotation_id === data.quotation_id && a.status === 'pending');
    if (existing) return clone(existing);
    const approval = {
      ...data,
      id: nextId(approvals),
      requested_date: today(),
      status: 'pending',
      remarks: data.remarks || '',
      approver: null,
      action_date: null,
      step: 1,
    };
    approvals = [approval, ...approvals];
    addActivity({ type: 'approval', action: `Approval requested for ${approval.rfq_number}`, entity: approval.rfq_number });
    return clone(approval);
  },
  approve(id, remarks = 'Approved') {
    let updated;
    approvals = approvals.map(a => {
      if (a.id === Number(id)) {
        updated = { ...a, status: 'approved', remarks, approver: 'Current User', action_date: today(), step: 3 };
        return updated;
      }
      return a;
    });
    if (updated?.quotation_id) {
      quotations = quotations.map(q => q.id === updated.quotation_id ? { ...q, status: 'accepted' } : q);
      const quote = quotations.find(q => q.id === updated.quotation_id);
      if (quote) this.generatePO(quote.id);
    }
    return clone(updated);
  },
  reject(id, remarks) {
    let updated;
    approvals = approvals.map(a => {
      if (a.id === Number(id)) {
        updated = { ...a, status: 'rejected', remarks, approver: 'Current User', action_date: today(), step: 3 };
        return updated;
      }
      return a;
    });
    return clone(updated);
  },
  listPOs: () => clone(purchaseOrders),
  generatePO(quotationId) {
    const existing = purchaseOrders.find(po => po.quotation_id === Number(quotationId));
    if (existing) return clone(existing);
    const quote = quotations.find(q => q.id === Number(quotationId));
    if (!quote) throw new Error('Quotation not found');
    const vendor = vendors.find(v => v.id === quote.vendor_id);
    const rfq = rfqs.find(r => r.id === quote.rfq_id);
    const po = {
      id: nextId(purchaseOrders),
      po_number: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(4, '0')}`,
      quotation_id: quote.id,
      vendor_id: quote.vendor_id,
      vendor_name: quote.vendor_name,
      vendor_gst: vendor?.gst_number || '',
      vendor_address: vendor ? `${vendor.address}, ${vendor.city}, ${vendor.state} ${vendor.pincode}` : '',
      rfq_reference: rfq?.rfq_number || '',
      items: quote.items.map(item => ({
        description: item.item_name,
        hsn: item.hsn || '',
        quantity: item.quantity,
        unit: item.unit || 'Nos',
        rate: item.unit_price,
        amount: item.quantity * item.unit_price,
      })),
      subtotal: quote.subtotal,
      cgst: quote.tax / 2,
      sgst: quote.tax / 2,
      igst: 0,
      total: quote.total_amount,
      created_date: today(),
      status: 'draft',
      terms: 'Payment within 30 days of invoice. Delivery as per agreed timelines.',
    };
    purchaseOrders = [po, ...purchaseOrders];
    addActivity({ type: 'po', action: `Purchase Order ${po.po_number} generated`, entity: po.po_number });
    return clone(po);
  },
  listInvoices: () => clone(invoices),
  generateInvoice(poId) {
    const existing = invoices.find(invoice => invoice.purchase_order_id === Number(poId));
    if (existing) return clone(existing);
    const po = purchaseOrders.find(p => p.id === Number(poId));
    if (!po) throw new Error('Purchase order not found');
    const vendor = vendors.find(v => v.id === po.vendor_id);
    const invoice = {
      id: nextId(invoices),
      invoice_number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      purchase_order_id: po.id,
      po_reference: po.po_number,
      vendor_id: po.vendor_id,
      vendor_name: po.vendor_name,
      vendor_gst: po.vendor_gst,
      vendor_address: po.vendor_address,
      vendor_email: vendor?.email || '',
      items: po.items.map((item, index) => ({ sno: index + 1, ...item })),
      subtotal: po.subtotal,
      cgst: po.cgst,
      sgst: po.sgst,
      igst: po.igst,
      total: po.total,
      invoice_date: today(),
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'draft',
      bank_details: {
        bank_name: 'HDFC Bank',
        account_number: '50100123456789',
        ifsc: 'HDFC0001234',
        branch: 'BKC Mumbai',
      },
    };
    invoices = [invoice, ...invoices];
    addActivity({ type: 'invoice', action: `Invoice ${invoice.invoice_number} created for ${po.po_number}`, entity: invoice.invoice_number });
    return clone(invoice);
  },
  sendInvoiceEmail: () => ({ success: true }),
  listActivities: () => clone(activities),
  analytics() {
    return {
      vendor_count: vendors.length,
      rfq_count: rfqs.length,
      invoice_count: invoices.length,
      total_spend: invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
      po_total: purchaseOrders.reduce((sum, po) => sum + Number(po.total || 0), 0),
      active_vendors: vendors.filter(v => v.status === 'active').length,
      active_rfqs: rfqs.filter(r => r.status === 'active').length,
    };
  },
};
