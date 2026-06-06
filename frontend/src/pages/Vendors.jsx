import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Plus, Edit2, Eye, ToggleLeft, ToggleRight, X, Building2, Phone, Mail, MapPin } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useAuth, RoleGuard } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { mockVendors } from '../data/mockData';
import api from '../api/axios';

const categories = ['All', 'Manufacturing', 'IT', 'Logistics', 'Services', 'Other'];

export default function Vendors() {
  const { hasRole } = useAuth();
  const toast = useToast();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [viewVendor, setViewVendor] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/vendors');
        setVendors(res.data);
      } catch {
        setVendors(mockVendors);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filtered = vendors.filter(v => {
    const matchesSearch = v.company_name.toLowerCase().includes(search.toLowerCase()) ||
      v.gst_number.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openEdit = (vendor) => {
    setEditVendor(vendor);
    Object.keys(vendor).forEach(key => setValue(key, vendor[key]));
    setShowModal(true);
  };

  const openAdd = () => {
    setEditVendor(null);
    reset({ status: 'active' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditVendor(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editVendor) {
        try {
          await api.put(`/api/vendors/${editVendor.id}`, data);
        } catch {}
        setVendors(prev => prev.map(v => v.id === editVendor.id ? { ...v, ...data } : v));
        toast.success('Vendor updated successfully');
      } else {
        const newVendor = { ...data, id: Date.now(), rating: 0, total_orders: 0 };
        try {
          const res = await api.post('/api/vendors', data);
          newVendor.id = res.data.id || newVendor.id;
        } catch {}
        setVendors(prev => [...prev, newVendor]);
        toast.success('Vendor added successfully');
      }
      closeModal();
    } catch {
      toast.error('Failed to save vendor');
    }
  };

  const toggleStatus = (id) => {
    setVendors(prev => prev.map(v => {
      if (v.id === id) {
        const newStatus = v.status === 'active' ? 'inactive' : 'active';
        toast.info(`Vendor marked as ${newStatus}`);
        return { ...v, status: newStatus };
      }
      return v;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} vendors found</p>
        </div>
        <RoleGuard roles={['admin', 'procurement_officer']}>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </RoleGuard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, GST, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                categoryFilter === cat
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white border border-surface-border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-4">
              <div className="skeleton h-5 w-48 rounded" />
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-4 w-40 rounded" />
              <div className="skeleton h-8 w-full rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No vendors found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(vendor => (
            <div key={vendor.id} className="card p-5 space-y-4 group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{vendor.company_name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-600">
                    {vendor.category}
                  </span>
                </div>
                <StatusBadge status={vendor.status} />
              </div>

              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-500 font-mono text-xs">
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded">GST</span>
                  {vendor.gst_number}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {vendor.contact_person}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {vendor.phone}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {vendor.email}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-surface-border">
                <button
                  onClick={() => setViewVendor(vendor)}
                  className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <RoleGuard roles={['admin', 'procurement_officer']}>
                  <button
                    onClick={() => openEdit(vendor)}
                    className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(vendor.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    title={vendor.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {vendor.status === 'active'
                      ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                      : <ToggleLeft className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                </RoleGuard>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Vendor Side Panel */}
      {viewVendor && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewVendor(null)} />
          <div className="side-panel w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
              <button onClick={() => setViewVendor(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-brand-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{viewVendor.company_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={viewVendor.status} />
                    <span className="text-xs text-gray-500">{viewVendor.category}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['GST Number', viewVendor.gst_number],
                  ['PAN', viewVendor.pan],
                  ['Contact Person', viewVendor.contact_person],
                  ['Phone', viewVendor.phone],
                  ['Email', viewVendor.email],
                  ['Total Orders', viewVendor.total_orders],
                  ['Rating', `${viewVendor.rating} / 5`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                <p className="text-sm text-gray-900 mt-0.5 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  {viewVendor.address}, {viewVendor.city}, {viewVendor.state} - {viewVendor.pincode}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Vendor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content w-full max-w-2xl mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Company Name</label>
                  <input {...register('company_name', { required: 'Required' })} className="input" placeholder="Enter company name" />
                  {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
                </div>

                <div>
                  <label className="label">Category</label>
                  <select {...register('category', { required: 'Required' })} className="input">
                    <option value="">Select category</option>
                    {['Manufacturing', 'IT', 'Logistics', 'Services', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="label">GST Number</label>
                  <input
                    {...register('gst_number', {
                      required: 'Required',
                      pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GST format' }
                    })}
                    className="input font-mono"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                  {errors.gst_number && <p className="text-red-500 text-xs mt-1">{errors.gst_number.message}</p>}
                </div>

                <div>
                  <label className="label">PAN</label>
                  <input {...register('pan', { required: 'Required' })} className="input font-mono" placeholder="AAAAA0000A" maxLength={10} />
                  {errors.pan && <p className="text-red-500 text-xs mt-1">{errors.pan.message}</p>}
                </div>

                <div>
                  <label className="label">Contact Person</label>
                  <input {...register('contact_person', { required: 'Required' })} className="input" placeholder="Contact name" />
                  {errors.contact_person && <p className="text-red-500 text-xs mt-1">{errors.contact_person.message}</p>}
                </div>

                <div>
                  <label className="label">Phone</label>
                  <input
                    {...register('phone', {
                      required: 'Required',
                      pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' }
                    })}
                    className="input"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    {...register('email', {
                      required: 'Required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                    })}
                    type="email"
                    className="input"
                    placeholder="email@company.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input {...register('address', { required: 'Required' })} className="input" placeholder="Street address" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>

                <div>
                  <label className="label">City</label>
                  <input {...register('city', { required: 'Required' })} className="input" placeholder="City" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="label">State</label>
                  <input {...register('state', { required: 'Required' })} className="input" placeholder="State" />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>

                <div>
                  <label className="label">Pincode</label>
                  <input {...register('pincode', { required: 'Required' })} className="input" placeholder="400001" maxLength={6} />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                </div>

                <div>
                  <label className="label">Status</label>
                  <select {...register('status')} className="input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editVendor ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
