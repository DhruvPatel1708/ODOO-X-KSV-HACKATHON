import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, Clock, ShoppingCart, Plus, TrendingUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AnalyticsCard from '../components/AnalyticsCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { approvalService } from '../services/approvalService';
import { poService } from '../services/poService';
import { rfqService } from '../services/rfqService';
import { vendorService } from '../services/vendorService';

const spendData = [
  { month: 'Jul', amount: 4200000 },
  { month: 'Aug', amount: 5800000 },
  { month: 'Sep', amount: 3500000 },
  { month: 'Oct', amount: 7200000 },
  { month: 'Nov', amount: 6100000 },
  { month: 'Dec', amount: 8500000 },
];

const categoryData = [
  { name: 'Manufacturing', value: 35, color: '#4f46e5' },
  { name: 'IT & Software', value: 28, color: '#818cf8' },
  { name: 'Logistics', value: 18, color: '#a5b4fc' },
  { name: 'Services', value: 12, color: '#c7d2fe' },
  { name: 'Others', value: 7, color: '#e0e7ff' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vendorsData, rfqsData, approvalsData, poData] = await Promise.all([
          vendorService.list(),
          rfqService.list(),
          approvalService.list(),
          poService.list(),
        ]);
        setVendors(vendorsData);
        setRfqs(rfqsData);
        setApprovals(approvalsData);
        setPurchaseOrders(poData);
      } catch {
        setVendors([]);
        setRfqs([]);
        setApprovals([]);
        setPurchaseOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const activeRfqs = rfqs.filter(r => r.status === 'active').length;
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0);

  const rfqColumns = [
    { key: 'rfq_number', label: 'RFQ #' },
    { key: 'title', label: 'Title', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'vendors_invited', label: 'Vendors', render: (val) => val?.length || 0 },
    { key: 'deadline', label: 'Deadline', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  const displayApprovals = approvals.filter(a => a.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Vendors"
          value={activeVendors}
          icon={Building2}
          trend={{ direction: 'up', value: '12% from last month' }}
          color="bg-brand-500"
        />
        <AnalyticsCard
          title="Active RFQs"
          value={activeRfqs}
          icon={FileText}
          trend={{ direction: 'up', value: '3 new this week' }}
          color="bg-amber-500"
        />
        <AnalyticsCard
          title="Pending Approvals"
          value={pendingApprovals}
          icon={Clock}
          trend={{ direction: 'down', value: '2 resolved today' }}
          color="bg-red-500"
        />
        <AnalyticsCard
          title="Total PO Value"
          value={formatCurrency(totalPOValue)}
          icon={ShoppingCart}
          trend={{ direction: 'up', value: '18% YoY growth' }}
          color="bg-emerald-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/rfqs')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New RFQ
        </button>
        <button onClick={() => navigate('/vendors')} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
        <button onClick={() => navigate('/purchase-orders')} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New PO
        </button>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent RFQs */}
        <div className="xl:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent RFQs</h2>
            <button onClick={() => navigate('/rfqs')} className="text-sm text-brand-500 hover:text-brand-600 font-medium">
              View all →
            </button>
          </div>
          <DataTable
            columns={rfqColumns}
            data={rfqs.slice(0, 5)}
            loading={loading}
            onRowClick={() => navigate('/rfqs')}
            emptyMessage="No RFQs found"
          />
        </div>

        {/* Pending Approvals */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Pending Approvals</h2>
            <button onClick={() => navigate('/approvals')} className="text-sm text-brand-500 hover:text-brand-600 font-medium">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {displayApprovals.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-gray-400 text-sm">No pending approvals</p>
              </div>
            ) : (
              displayApprovals.map(approval => (
                <div key={approval.id} className="card p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{approval.rfq_title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{approval.rfq_number} · {approval.vendor_name}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(approval.quote_amount)}</span>
                    <StatusBadge status={approval.status} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/approvals')}
                      className="flex-1 btn-success text-xs py-1.5"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => navigate('/approvals')}
                      className="flex-1 btn-danger text-xs py-1.5"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Line Chart */}
        <div className="xl:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Monthly Procurement Spend</h2>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +18.2%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={spendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
              <Tooltip
                formatter={(val) => [formatCurrency(val), 'Spend']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ fill: '#4f46e5', strokeWidth: 0, r: 5 }}
                activeDot={{ r: 7, fill: '#4f46e5', stroke: '#fff', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="xl:col-span-2 card p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Spend by Category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [`${val}%`, 'Share']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
