import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { DollarSign, TrendingUp, Building2, Truck, Download, Star } from 'lucide-react';
import AnalyticsCard from '../components/AnalyticsCard';
import { formatCurrency, generateCSV } from '../utils/formatters';

const monthlySpendByCategory = [
  { month: 'Jul', Manufacturing: 1800000, IT: 1200000, Logistics: 800000, Services: 400000 },
  { month: 'Aug', Manufacturing: 2200000, IT: 1500000, Logistics: 1200000, Services: 900000 },
  { month: 'Sep', Manufacturing: 1500000, IT: 900000, Logistics: 600000, Services: 500000 },
  { month: 'Oct', Manufacturing: 2800000, IT: 2000000, Logistics: 1400000, Services: 1000000 },
  { month: 'Nov', Manufacturing: 2400000, IT: 1600000, Logistics: 1100000, Services: 1000000 },
  { month: 'Dec', Manufacturing: 3200000, IT: 2200000, Logistics: 1800000, Services: 1300000 },
];

const winRateData = [
  { month: 'Jul', rate: 42 },
  { month: 'Aug', rate: 48 },
  { month: 'Sep', rate: 45 },
  { month: 'Oct', rate: 52 },
  { month: 'Nov', rate: 58 },
  { month: 'Dec', rate: 55 },
];

const vendorPerformance = [
  { vendor: 'Tata Steel Industries', quotes_submitted: 12, quotes_won: 8, win_rate: 67, avg_delivery: 14, total_po_value: 19588000, rating: 4.5 },
  { vendor: 'Infosys Technologies', quotes_submitted: 10, quotes_won: 7, win_rate: 70, avg_delivery: 5, total_po_value: 5970800, rating: 4.8 },
  { vendor: 'BlueDart Logistics', quotes_submitted: 8, quotes_won: 5, win_rate: 63, avg_delivery: 3, total_po_value: 18231000, rating: 3.9 },
  { vendor: 'Wipro Enterprises', quotes_submitted: 6, quotes_won: 2, win_rate: 33, avg_delivery: 8, total_po_value: 2500000, rating: 4.2 },
  { vendor: 'Mahindra Manufacturing', quotes_submitted: 9, quotes_won: 4, win_rate: 44, avg_delivery: 12, total_po_value: 3286300, rating: 3.7 },
  { vendor: 'Reliance Digital Services', quotes_submitted: 7, quotes_won: 5, win_rate: 71, avg_delivery: 7, total_po_value: 7251100, rating: 4.6 },
];

export default function Reports() {
  const [sortField, setSortField] = useState('win_rate');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = [...vendorPerformance].sort((a, b) =>
    sortDir === 'desc' ? b[sortField] - a[sortField] : a[sortField] - b[sortField]
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExport = () => {
    const headers = ['Vendor', 'Quotes Submitted', 'Quotes Won', 'Win Rate %', 'Avg Delivery Days', 'Total PO Value', 'Rating'];
    const rows = vendorPerformance.map(v => [
      v.vendor, v.quotes_submitted, v.quotes_won, v.win_rate, v.avg_delivery, v.total_po_value, v.rating
    ]);
    generateCSV(headers, rows, 'vendor-performance-report.csv');
  };

  const totalSpend = 56827200;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Analytics and performance insights</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Spend (YTD)" value={formatCurrency(totalSpend)} icon={DollarSign} trend={{ direction: 'up', value: '18% YoY' }} color="bg-brand-500" />
        <AnalyticsCard title="Avg PO Value" value={formatCurrency(Math.round(totalSpend / 4))} icon={TrendingUp} color="bg-emerald-500" />
        <AnalyticsCard title="Active Vendors" value="5" icon={Building2} trend={{ direction: 'up', value: '2 new' }} color="bg-violet-500" />
        <AnalyticsCard title="On-time Delivery" value="87%" icon={Truck} trend={{ direction: 'up', value: '4% improvement' }} color="bg-amber-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Spend by Category */}
        <div className="card p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Spend by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySpendByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
              <Tooltip
                formatter={(val) => [formatCurrency(val), '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="Manufacturing" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="IT" fill="#818cf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Logistics" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Services" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win Rate */}
        <div className="card p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Vendor Quotation Win Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={winRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(val) => `${val}%`} domain={[30, 70]} />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Win Rate']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 0, r: 5 }}
                activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Performance Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="text-lg font-bold text-gray-900">Vendor Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-surface-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                {[
                  ['quotes_submitted', 'Quotes Submitted'],
                  ['quotes_won', 'Quotes Won'],
                  ['win_rate', 'Win Rate'],
                  ['avg_delivery', 'Avg Delivery'],
                  ['total_po_value', 'Total PO Value'],
                  ['rating', 'Rating'],
                ].map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-brand-600 transition-colors"
                  >
                    <span className="flex items-center justify-center gap-1">
                      {label}
                      {sortField === key && (
                        <span className="text-brand-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {sorted.map((v, i) => (
                <tr key={v.vendor} className={`hover:bg-brand-50/30 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{v.vendor}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{v.quotes_submitted}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{v.quotes_won}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      v.win_rate >= 60 ? 'bg-emerald-100 text-emerald-700' :
                      v.win_rate >= 40 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {v.win_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{v.avg_delivery} days</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{formatCurrency(v.total_po_value)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(v.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-1 text-xs text-gray-500">{v.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
