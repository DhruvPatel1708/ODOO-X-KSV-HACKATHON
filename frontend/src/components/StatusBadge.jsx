const statusConfig = {
  draft:    { bg: 'bg-gray-100',    text: 'text-gray-700',    dot: 'bg-gray-400' },
  pending:  { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-400' },
  approved: { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  rejected: { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-400' },
  sent:     { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400' },
  paid:     { bg: 'bg-violet-50',   text: 'text-violet-700',  dot: 'bg-violet-400' },
  active:   { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  inactive: { bg: 'bg-gray-100',    text: 'text-gray-700',    dot: 'bg-gray-400' },
  submitted:{ bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400' },
  accepted: { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  confirmed:{ bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  closed:   { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400' },
};

const defaultConfig = { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };

export default function StatusBadge({ status }) {
  const config = statusConfig[status?.toLowerCase()] || defaultConfig;
  const displayText = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {displayText}
    </span>
  );
}
