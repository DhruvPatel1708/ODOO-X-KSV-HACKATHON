import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, X, FileText, Calendar, Send, Save } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { RoleGuard } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { mockRFQs, mockVendors } from '../data/mockData';
import { formatDate } from '../utils/formatters';
import api from '../api/axios';

const statusTabs = ['All', 'draft', 'active', 'closed'];

export default function RFQs() {
  const toast = useToast();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: '', description: '', deadline: '',
      items: [{ item_name: '', description: '', quantity: '', unit: 'Nos' }],
      vendors_invited: [],
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/rfqs');
        setRfqs(res.data);
      } catch {
        setRfqs(mockRFQs);
      } finally {
        setLoading(false);
      }
    };
    fetchRFQs();
  }, []);

  const filtered = activeTab === 'All' ? rfqs : rfqs.filter(r => r.status === activeTab);

  const columns = [
    { key: 'rfq_number', label: 'RFQ #', render: (val) => <span className="font-mono text-brand-600 font-medium">{val}</span> },
    { key: 'title', label: 'Title', render: (val) => <span className="font-medium text-gray-900 max-w-[200px] truncate block">{val}</span> },
    { key: 'items', label: 'Items', render: (val) => <span className="text-gray-600">{val?.length || 0}</span> },
    { key: 'vendors_invited', label: 'Vendors', render: (val) => <span className="text-gray-600">{val?.length || 0}</span> },
    { key: 'deadline', label: 'Deadline', render: (val) => (
      <span className={`flex items-center gap-1.5 ${new Date(val) < new Date() ? 'text-red-500' : 'text-gray-600'}`}>
        <Calendar className="w-3.5 h-3.5" /> {formatDate(val)}
      </span>
    )},
    { key: 'quotations_received', label: 'Quotes', render: (val) => (
      <span className="px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold">{val}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  const onSubmit = (data, isDraft = false) => {
    const newRFQ = {
      ...data,
      id: Date.now(),
      rfq_number: `RFQ-${new Date().getFullYear()}-${String(rfqs.length + 1).padStart(3, '0')}`,
      status: isDraft ? 'draft' : 'active',
      quotations_received: 0,
      created_at: new Date().toISOString(),
      created_by: 'Arjun Mehta',
      vendors_invited: data.vendors_invited || [],
    };
    setRfqs(prev => [newRFQ, ...prev]);
    setShowModal(false);
    reset();
    toast.success(isDraft ? 'RFQ saved as draft' : 'RFQ published successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">RFQs</h1>
          <p className="text-gray-500 text-sm mt-1">Request for Quotations</p>
        </div>
        <RoleGuard roles={['admin', 'procurement_officer']}>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create RFQ
          </button>
        </RoleGuard>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {statusTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'All' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'All' && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({rfqs.filter(r => r.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No RFQs found" />

      {/* Create RFQ Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-3xl mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 rounded-xl">
                  <FileText className="w-5 h-5 text-brand-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Create New RFQ</h2>
              </div>
              <button onClick={() => { setShowModal(false); reset(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-5">
              <div>
                <label className="label">RFQ Title</label>
                <input {...register('title', { required: 'Title is required' })} className="input" placeholder="Enter RFQ title" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Describe your requirements..." />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Line Items</label>
                  <button
                    type="button"
                    onClick={() => append({ item_name: '', description: '', quantity: '', unit: 'Nos' })}
                    className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="col-span-2">
                          <input
                            {...register(`items.${index}.item_name`, { required: true })}
                            className="input text-sm"
                            placeholder="Item name"
                          />
                        </div>
                        <input
                          {...register(`items.${index}.quantity`, { required: true })}
                          type="number"
                          className="input text-sm"
                          placeholder="Qty"
                        />
                        <select {...register(`items.${index}.unit`)} className="input text-sm">
                          {['Nos', 'MT', 'KG', 'Ltrs', 'Units', 'Trips', 'Months', 'License', 'Users'].map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Deadline</label>
                  <input
                    {...register('deadline', { required: 'Deadline is required' })}
                    type="date"
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>}
                </div>
              </div>

              {/* Vendor Selection */}
              <div>
                <label className="label">Invite Vendors</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-xl">
                  {mockVendors.filter(v => v.status === 'active').map(vendor => (
                    <label key={vendor.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        value={vendor.id}
                        {...register('vendors_invited')}
                        className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700">{vendor.company_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={handleSubmit((data) => onSubmit(data, true))}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save as Draft
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Send className="w-4 h-4" /> Publish RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
