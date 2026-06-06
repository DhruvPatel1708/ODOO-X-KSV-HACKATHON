import { useState, useEffect } from 'react';
import { X, FileText, Receipt, Building2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { RoleGuard } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { mockPurchaseOrders } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../api/axios';

const statusTabs = ['All', 'draft', 'sent', 'confirmed', 'closed'];

export default function PurchaseOrders() {
  const toast = useToast();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedPO, setSelectedPO] = useState(null);

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/purchase-orders');
        setPos(res.data);
      } catch {
        setPos(mockPurchaseOrders);
      } finally {
        setLoading(false);
      }
    };
    fetchPOs();
  }, []);

  const filtered = activeTab === 'All' ? pos : pos.filter(p => p.status === activeTab);

  const columns = [
    { key: 'po_number', label: 'PO #', render: (val) => <span className="font-mono text-brand-600 font-medium">{val}</span> },
    { key: 'vendor_name', label: 'Vendor', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'rfq_reference', label: 'RFQ Ref', render: (val) => <span className="font-mono text-xs text-gray-500">{val}</span> },
    { key: 'items', label: 'Items', render: (val) => val?.length || 0 },
    { key: 'total', label: 'Amount', render: (val) => <span className="font-bold text-gray-900">{formatCurrency(val)}</span> },
    { key: 'created_date', label: 'Created', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  const handleGenerateInvoice = (po) => {
    toast.success(`Invoice generated for ${po.po_number}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{pos.length} orders total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.info('CSV export coming soon')} className="btn-secondary text-sm">
            Export CSV
          </button>
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
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        onRowClick={(row) => setSelectedPO(row)}
        emptyMessage="No purchase orders found"
      />

      {/* PO Detail Side Panel */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedPO(null)} />
          <div className="side-panel w-full max-w-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 rounded-xl">
                  <FileText className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPO.po_number}</h2>
                  <StatusBadge status={selectedPO.status} />
                </div>
              </div>
              <button onClick={() => setSelectedPO(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vendor Info */}
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-5 h-5 text-brand-500" />
                <h3 className="font-semibold text-gray-900">Vendor Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{selectedPO.vendor_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">GST</p>
                  <p className="font-mono text-xs">{selectedPO.vendor_gst}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Address</p>
                  <p className="text-gray-700">{selectedPO.vendor_address}</p>
                </div>
              </div>
            </div>

            {/* Ship To */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Ship To</h3>
              <p className="text-sm text-gray-700">VendorBridge Enterprises Pvt. Ltd.</p>
              <p className="text-sm text-gray-500">42 MG Road, Fort, Mumbai, Maharashtra 400001</p>
              <p className="text-sm text-gray-500 font-mono">GST: 27AABCV1234E1ZT</p>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Line Items</h3>
              <div className="rounded-xl border border-surface-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Description</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Qty</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Unit</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Rate</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {selectedPO.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2.5 text-gray-900">{item.description}</td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{item.unit}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600">{formatCurrency(item.rate)}</td>
                        <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(selectedPO.subtotal)}</span>
              </div>
              {selectedPO.cgst > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">CGST (9%)</span>
                    <span>{formatCurrency(selectedPO.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">SGST (9%)</span>
                    <span>{formatCurrency(selectedPO.sgst)}</span>
                  </div>
                </>
              )}
              {selectedPO.igst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IGST (18%)</span>
                  <span>{formatCurrency(selectedPO.igst)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Grand Total</span>
                <span className="text-brand-600">{formatCurrency(selectedPO.total)}</span>
              </div>
            </div>

            {/* Terms */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPO.terms}</p>
            </div>

            {/* Actions */}
            <RoleGuard roles={['admin', 'procurement_officer']}>
              <div className="flex gap-3 pt-4 border-t border-surface-border">
                <button
                  onClick={() => handleGenerateInvoice(selectedPO)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4" /> Generate Invoice
                </button>
              </div>
            </RoleGuard>
          </div>
        </div>
      )}
    </div>
  );
}
