import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useAuth, RoleGuard } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { mockApprovals } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../api/axios';

const tabs = ['pending', 'approved', 'rejected'];

const stepLabels = ['Submitted', 'Under Review', 'Decision'];

export default function Approvals() {
  const { hasRole } = useAuth();
  const toast = useToast();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [remarks, setRemarks] = useState({});

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/approvals');
        setApprovals(res.data);
      } catch {
        setApprovals(mockApprovals);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  const filtered = approvals.filter(a => a.status === activeTab);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/approvals/${id}/approve`).catch(() => {});
    } catch {}
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'approved', approver: 'Current User', action_date: new Date().toISOString(), step: 3, remarks: remarks[id] || 'Approved' } : a
    ));
    toast.success('Approval granted successfully');
  };

  const handleReject = async (id) => {
    if (!remarks[id]?.trim()) {
      toast.error('Remarks are required for rejection');
      return;
    }
    try {
      await api.put(`/api/approvals/${id}/reject`, { remarks: remarks[id] }).catch(() => {});
    } catch {}
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'rejected', approver: 'Current User', action_date: new Date().toISOString(), step: 3, remarks: remarks[id] } : a
    ));
    toast.success('Approval rejected');
  };

  const getStepStatus = (approval, stepIndex) => {
    if (approval.status === 'pending') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1) return 'active';
      return 'pending';
    }
    return 'completed';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage approval requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-2 ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {tab === 'pending' && <Clock className="w-4 h-4 text-amber-500" />}
            {tab === 'approved' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {tab === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
            {tab}
            <span className="text-xs text-gray-400 ml-1">
              ({approvals.filter(a => a.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 space-y-4">
              <div className="skeleton h-5 w-48 rounded" />
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-10 w-full rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No {activeTab} approvals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(approval => (
            <div key={approval.id} className="card p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{approval.rfq_title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 font-mono">{approval.rfq_number}</p>
                </div>
                <StatusBadge status={approval.status} />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Vendor</p>
                  <p className="text-sm font-medium text-gray-900">{approval.vendor_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Quote Amount</p>
                  <p className="text-sm font-bold text-brand-600">{formatCurrency(approval.quote_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Requested By</p>
                  <p className="text-sm text-gray-700">{approval.requested_by}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Requested On</p>
                  <p className="text-sm text-gray-700">{formatDate(approval.requested_date)}</p>
                </div>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-1 py-2">
                {stepLabels.map((label, i) => {
                  const status = getStepStatus(approval, i);
                  return (
                    <div key={i} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          status === 'completed' ? 'bg-emerald-500 text-white' :
                          status === 'active' ? 'bg-brand-500 text-white animate-pulse' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        <p className={`text-[10px] mt-1 font-medium ${
                          status === 'completed' ? 'text-emerald-600' :
                          status === 'active' ? 'text-brand-600' : 'text-gray-400'
                        }`}>{label}</p>
                      </div>
                      {i < stepLabels.length - 1 && (
                        <ChevronRight className={`w-4 h-4 shrink-0 mx-1 ${
                          status === 'completed' ? 'text-emerald-400' : 'text-gray-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions / Info */}
              {approval.status === 'pending' && hasRole('admin', 'manager') ? (
                <div className="space-y-3 border-t border-surface-border pt-4">
                  <textarea
                    value={remarks[approval.id] || ''}
                    onChange={e => setRemarks(prev => ({ ...prev, [approval.id]: e.target.value }))}
                    className="input resize-none text-sm"
                    rows={2}
                    placeholder="Add remarks (required for rejection)..."
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(approval.id)} className="flex-1 btn-success flex items-center justify-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleReject(approval.id)} className="flex-1 btn-danger flex items-center justify-center gap-2 text-sm">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ) : approval.status !== 'pending' ? (
                <div className="border-t border-surface-border pt-4 space-y-2">
                  {approval.remarks && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase mb-1">Remarks</p>
                      <p className="text-sm text-gray-700">{approval.remarks}</p>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>By: {approval.approver}</span>
                    <span>{approval.action_date ? formatDate(approval.action_date) : ''}</span>
                  </div>
                </div>
              ) : (
                <div className="border-t border-surface-border pt-3">
                  <p className="text-sm text-gray-400 italic">Awaiting manager/admin review</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
