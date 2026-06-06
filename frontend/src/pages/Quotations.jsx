import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, ClipboardList, Eye } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useAuth, RoleGuard } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { mockQuotations, mockRFQs } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../api/axios';

export default function Quotations() {
  const { user } = useAuth();
  const toast = useToast();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('procurement'); // 'procurement' | 'vendor'
  const [showModal, setShowModal] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [viewQuote, setViewQuote] = useState(null);
  const [lineItems, setLineItems] = useState([]);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/quotations');
        setQuotations(res.data);
      } catch {
        setQuotations(mockQuotations);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  const columns = [
    { key: 'quote_number', label: 'Quote #', render: (val) => <span className="font-mono text-brand-600 font-medium">{val}</span> },
    { key: 'rfq_title', label: 'RFQ Title', render: (val) => <span className="font-medium text-gray-900 max-w-[180px] truncate block">{val}</span> },
    { key: 'vendor_name', label: 'Vendor', render: (val) => <span className="text-gray-700">{val}</span> },
    { key: 'total_amount', label: 'Amount', render: (val) => <span className="font-semibold text-gray-900">{formatCurrency(val)}</span> },
    { key: 'delivery_days', label: 'Delivery', render: (val) => <span className="text-gray-600">{val} days</span> },
    { key: 'submitted_on', label: 'Submitted', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'id', label: 'Actions', render: (_, row) => (
      <button onClick={(e) => { e.stopPropagation(); setViewQuote(row); }} className="text-brand-500 hover:text-brand-600 p-1">
        <Eye className="w-4 h-4" />
      </button>
    )},
  ];

  const openRFQs = mockRFQs.filter(r => r.status === 'active');

  const handleRFQSelect = (rfqId) => {
    const rfq = mockRFQs.find(r => r.id === parseInt(rfqId));
    setSelectedRFQ(rfq);
    if (rfq) {
      setLineItems(rfq.items.map(item => ({
        ...item,
        unit_price: '',
        tax_percent: 18,
      })));
    }
  };

  const updateLineItem = (index, field, value) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: Number(value) || 0 };
        updated.total = updated.quantity * updated.unit_price * (1 + updated.tax_percent / 100);
        return updated;
      }
      return item;
    }));
  };

  const grandTotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * (item.unit_price || 0)), 0);
  const totalTax = grandTotal - subtotal;

  const onSubmitQuotation = (data) => {
    if (!selectedRFQ) return;
    const newQuote = {
      id: Date.now(),
      quote_number: `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      rfq_id: selectedRFQ.id,
      rfq_title: selectedRFQ.title,
      vendor_id: user.id,
      vendor_name: user.name,
      items: lineItems,
      subtotal,
      tax: totalTax,
      total_amount: grandTotal,
      delivery_days: parseInt(data.delivery_days) || 0,
      notes: data.notes,
      submitted_on: new Date().toISOString().split('T')[0],
      status: 'submitted',
    };
    setQuotations(prev => [newQuote, ...prev]);
    setShowModal(false);
    setSelectedRFQ(null);
    setLineItems([]);
    reset();
    toast.success('Quotation submitted successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Quotations</h1>
          <p className="text-gray-500 text-sm mt-1">{quotations.length} quotations total</p>
        </div>
        <RoleGuard roles={['vendor']}>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Submit Quotation
          </button>
        </RoleGuard>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setView('procurement')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'procurement' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          All Quotations
        </button>
        <button
          onClick={() => setView('vendor')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'vendor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Vendor Submissions
        </button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={quotations} loading={loading} emptyMessage="No quotations found" />

      {/* View Quote Detail */}
      {viewQuote && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewQuote(null)} />
          <div className="side-panel w-full max-w-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Quotation Details</h2>
              <button onClick={() => setViewQuote(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Quote #</p>
                <p className="font-mono font-medium text-brand-600">{viewQuote.quote_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Status</p>
                <StatusBadge status={viewQuote.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Vendor</p>
                <p className="font-medium">{viewQuote.vendor_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Delivery</p>
                <p className="font-medium">{viewQuote.delivery_days} days</p>
              </div>
            </div>
            <div className="border-t border-surface-border pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Line Items</h3>
              <div className="space-y-2">
                {viewQuote.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.item_name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-surface-border pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(viewQuote.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span>{formatCurrency(viewQuote.tax)}</span></div>
              <div className="flex justify-between text-base font-bold border-t pt-2"><span>Grand Total</span><span className="text-brand-600">{formatCurrency(viewQuote.total_amount)}</span></div>
            </div>
            {viewQuote.notes && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Notes</p>
                <p className="text-sm text-gray-700">{viewQuote.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Quotation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-3xl mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 rounded-xl"><ClipboardList className="w-5 h-5 text-brand-500" /></div>
                <h2 className="text-xl font-bold text-gray-900">Submit Quotation</h2>
              </div>
              <button onClick={() => { setShowModal(false); reset(); setSelectedRFQ(null); setLineItems([]); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitQuotation)} className="space-y-5">
              <div>
                <label className="label">Select RFQ</label>
                <select
                  onChange={e => handleRFQSelect(e.target.value)}
                  className="input"
                >
                  <option value="">Choose an open RFQ</option>
                  {openRFQs.map(rfq => (
                    <option key={rfq.id} value={rfq.id}>{rfq.rfq_number} — {rfq.title}</option>
                  ))}
                </select>
              </div>

              {selectedRFQ && (
                <>
                  <div>
                    <label className="label">Line Items</label>
                    <div className="rounded-xl border border-surface-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Item</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Qty</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Unit Price (₹)</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Tax %</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                          {lineItems.map((item, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2">
                                <p className="font-medium text-gray-900">{item.item_name}</p>
                                <p className="text-xs text-gray-500">{item.description}</p>
                              </td>
                              <td className="px-3 py-2 text-gray-600">{item.quantity} {item.unit}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.unit_price || ''}
                                  onChange={e => updateLineItem(i, 'unit_price', e.target.value)}
                                  className="input w-28 text-sm"
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.tax_percent}
                                  onChange={e => updateLineItem(i, 'tax_percent', e.target.value)}
                                  className="input w-20 text-sm"
                                />
                              </td>
                              <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.total || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-right">
                      <p className="text-gray-500">Subtotal: <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span></p>
                      <p className="text-gray-500">Tax: <span className="font-medium text-gray-900">{formatCurrency(totalTax)}</span></p>
                      <p className="text-lg font-bold text-brand-600">Grand Total: {formatCurrency(grandTotal)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Delivery Timeline (days)</label>
                      <input {...register('delivery_days', { required: 'Required' })} type="number" className="input" placeholder="21" />
                      {errors.delivery_days && <p className="text-red-500 text-xs mt-1">{errors.delivery_days.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label">Notes / Comments</label>
                    <textarea {...register('notes')} rows={3} className="input resize-none" placeholder="Any additional remarks..." />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                    <button type="button" onClick={() => { setShowModal(false); reset(); setSelectedRFQ(null); setLineItems([]); }} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Submit Quotation</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
