import { useState, useEffect } from 'react';
import { FileText, ClipboardList, CheckSquare, ShoppingCart, Receipt, Filter, Calendar } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { mockActivityLogs } from '../data/mockData';
import { formatRelativeTime } from '../utils/formatters';
import api from '../api/axios';

const typeConfig = {
  rfq: { icon: FileText, color: 'bg-blue-500', label: 'RFQ' },
  quotation: { icon: ClipboardList, color: 'bg-violet-500', label: 'Quotation' },
  approval: { icon: CheckSquare, color: 'bg-amber-500', label: 'Approval' },
  po: { icon: ShoppingCart, color: 'bg-emerald-500', label: 'PO' },
  invoice: { icon: Receipt, color: 'bg-indigo-500', label: 'Invoice' },
};

const typeFilters = ['All', 'rfq', 'quotation', 'approval', 'po', 'invoice'];

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/activity-logs');
        setLogs(res.data);
      } catch {
        setLogs(mockActivityLogs);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = typeFilter === 'All' ? logs : logs.filter(l => l.type === typeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Activity Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Track all actions across the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {typeFilters.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              typeFilter === t
                ? 'bg-brand-500 text-white shadow-md'
                : 'bg-white border border-surface-border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t !== 'All' && (() => {
              const cfg = typeConfig[t];
              const Icon = cfg.icon;
              return <Icon className="w-3.5 h-3.5" />;
            })()}
            {t === 'All' ? 'All' : typeConfig[t]?.label || t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No activity logs found</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

          <div className="space-y-4">
            {filtered.map((log, index) => {
              const config = typeConfig[log.type] || typeConfig.rfq;
              const Icon = config.icon;
              const isLeft = index % 2 === 0;

              return (
                <div key={log.id} className="flex gap-4 items-start group">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center shrink-0 z-10 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 card p-4 group-hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{log.action}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-gray-500">{log.actor}</span>
                          <StatusBadge status={log.role} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400 font-medium">{formatRelativeTime(log.timestamp)}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
