import { useState, useEffect } from 'react';
import { Download, Printer, Mail, X, Eye, ShoppingCart } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { RoleGuard } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { mockInvoices } from '../data/mockData';
import { formatCurrency, formatDate, numberToWords } from '../utils/formatters';
import { generateInvoicePDF } from '../utils/generatePDF';
import api from '../api/axios';

const statusTabs = ['All', 'draft', 'pending', 'sent', 'paid'];

export default function Invoices() {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/invoices');
        setInvoices(res.data);
      } catch {
        setInvoices(mockInvoices);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filtered = activeTab === 'All' ? invoices : invoices.filter(i => i.status === activeTab);

  const columns = [
    { key: 'invoice_number', label: 'Invoice #', render: (val) => <span className="font-mono text-brand-600 font-medium">{val}</span> },
    { key: 'po_reference', label: 'PO Ref', render: (val) => <span className="font-mono text-xs text-gray-500">{val}</span> },
    { key: 'vendor_name', label: 'Vendor', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'subtotal', label: 'Amount', render: (val) => formatCurrency(val) },
    { key: 'total', label: 'Total', render: (_, row) => <span className="font-bold text-gray-900">{formatCurrency(row.total)}</span> },
    { key: 'due_date', label: 'Due Date', render: (val) => {
      const isPast = new Date(val) < new Date();
      return <span className={isPast ? 'text-red-500 font-medium' : ''}>{formatDate(val)}</span>;
    }},
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'id', label: 'Actions', render: (_, row) => (
      <button onClick={(e) => { e.stopPropagation(); setViewInvoice(row); }} className="text-brand-500 hover:text-brand-600 p-1">
        <Eye className="w-4 h-4" />
      </button>
    )},
  ];

  const handleDownloadPDF = async () => {
    try {
      await generateInvoicePDF('invoice-print-area', `${viewInvoice.invoice_number}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const openEmailModal = () => {
    setEmailData({
      to: viewInvoice.vendor_email,
      subject: `Invoice ${viewInvoice.invoice_number} from VendorBridge`,
      body: `Dear ${viewInvoice.vendor_name},\n\nPlease find attached the invoice ${viewInvoice.invoice_number} for an amount of ${formatCurrency(viewInvoice.total)}.\n\nDue date: ${formatDate(viewInvoice.due_date)}\n\nKindly arrange the payment at the earliest.\n\nRegards,\nVendorBridge Enterprises`,
    });
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    try {
      await api.post(`/api/invoices/${viewInvoice.id}/send-email`, emailData).catch(() => {});
      toast.success('Invoice sent via email');
      setShowEmailModal(false);
    } catch {
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">{invoices.length} invoices total</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {statusTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {tab === 'All' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No invoices found" />

      {/* Invoice Detail / Print View */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewInvoice(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto mx-4" style={{ animation: 'slideUp 0.3s ease' }}>
            {/* Action bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-surface-border px-6 py-3 flex items-center justify-between no-print">
              <h2 className="text-lg font-bold text-gray-900">Invoice Preview</h2>
              <div className="flex items-center gap-2">
                <RoleGuard roles={['admin', 'procurement_officer']}>
                  <button onClick={handleDownloadPDF} className="btn-primary text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button onClick={handlePrint} className="btn-secondary text-sm flex items-center gap-2">
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button onClick={openEmailModal} className="btn-secondary text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </button>
                </RoleGuard>
                <button onClick={() => setViewInvoice(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice content — A4 proportioned */}
            <div id="invoice-print-area" className="invoice-print-area p-8 sm:p-12 bg-white">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">VendorBridge Enterprises</h1>
                    <p className="text-sm text-gray-500">42 MG Road, Fort, Mumbai, MH 400001</p>
                    <p className="text-xs text-gray-400 font-mono">GST: 27AABCV1234E1ZT</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-extrabold text-brand-600 tracking-tight">TAX INVOICE</h2>
                  <p className="text-sm font-mono text-gray-700 mt-1">{viewInvoice.invoice_number}</p>
                </div>
              </div>

              {/* Invoice meta */}
              <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="text-xs text-gray-500 uppercase font-semibold mb-2">Bill To</h3>
                  <p className="font-bold text-gray-900">{viewInvoice.vendor_name}</p>
                  <p className="text-sm text-gray-600">{viewInvoice.vendor_address}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">GST: {viewInvoice.vendor_gst}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm"><span className="text-gray-500">Invoice Date:</span> <span className="font-medium">{formatDate(viewInvoice.invoice_date)}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Due Date:</span> <span className="font-medium">{formatDate(viewInvoice.due_date)}</span></p>
                  <p className="text-sm"><span className="text-gray-500">PO Reference:</span> <span className="font-mono font-medium">{viewInvoice.po_reference}</span></p>
                  <div className="mt-2"><StatusBadge status={viewInvoice.status} /></div>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="bg-brand-600 text-white">
                    <th className="px-3 py-2.5 text-left rounded-tl-lg">#</th>
                    <th className="px-3 py-2.5 text-left">Description</th>
                    <th className="px-3 py-2.5 text-center">HSN/SAC</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-center">Unit</th>
                    <th className="px-3 py-2.5 text-right">Rate</th>
                    <th className="px-3 py-2.5 text-right rounded-tr-lg">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewInvoice.items.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2.5 text-gray-500">{item.sno}</td>
                      <td className="px-3 py-2.5 text-gray-900 font-medium">{item.description}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-500">{item.hsn}</td>
                      <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-center text-gray-500">{item.unit}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(item.rate)}</td>
                      <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tax & Total */}
              <div className="flex justify-end mb-6">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(viewInvoice.subtotal)}</span>
                  </div>
                  {viewInvoice.cgst > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">CGST (9%)</span>
                        <span>{formatCurrency(viewInvoice.cgst)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">SGST (9%)</span>
                        <span>{formatCurrency(viewInvoice.sgst)}</span>
                      </div>
                    </>
                  )}
                  {viewInvoice.igst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">IGST (18%)</span>
                      <span>{formatCurrency(viewInvoice.igst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t-2 border-brand-600 pt-2">
                    <span>Grand Total</span>
                    <span className="text-brand-600">{formatCurrency(viewInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Amount in words */}
              <div className="bg-brand-50 p-3 rounded-lg mb-6">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Amount in Words</p>
                <p className="text-sm font-medium text-brand-700">{numberToWords(viewInvoice.total)}</p>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border border-surface-border rounded-lg p-4">
                  <h4 className="text-xs text-gray-500 uppercase font-semibold mb-2">Bank Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Bank:</span> {viewInvoice.bank_details.bank_name}</p>
                    <p><span className="text-gray-500">A/C:</span> <span className="font-mono">{viewInvoice.bank_details.account_number}</span></p>
                    <p><span className="text-gray-500">IFSC:</span> <span className="font-mono">{viewInvoice.bank_details.ifsc}</span></p>
                    <p><span className="text-gray-500">Branch:</span> {viewInvoice.bank_details.branch}</p>
                  </div>
                </div>
                <div className="border border-surface-border rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase font-semibold mb-2">Authorized Signatory</h4>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-8">
                    <p className="text-sm text-gray-700 font-medium">VendorBridge Enterprises</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <p className="text-center text-xs text-gray-400 border-t border-surface-border pt-4">
                This is a computer generated invoice and does not require a physical signature.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Send Invoice via Email</h2>
              <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">To</label>
                <input
                  value={emailData.to}
                  onChange={e => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Subject</label>
                <input
                  value={emailData.subject}
                  onChange={e => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Body</label>
                <textarea
                  value={emailData.body}
                  onChange={e => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  className="input resize-none"
                  rows={8}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowEmailModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleSendEmail} className="btn-primary flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
