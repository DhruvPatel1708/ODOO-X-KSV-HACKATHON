import { Inbox } from 'lucide-react';

export default function DataTable({ columns, data, onRowClick, loading, emptyMessage }) {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-surface-border">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-surface-border">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    <div className="skeleton h-4 rounded-md" style={{ width: `${60 + Math.random() * 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-surface-border bg-white p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-gray-50 rounded-full">
            <Inbox className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">{emptyMessage || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-border bg-white">
      <table className="w-full">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-50/80 backdrop-blur-sm border-b border-surface-border">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors duration-150 ${
                onRowClick ? 'cursor-pointer hover:bg-brand-50/40' : 'hover:bg-gray-50/50'
              } ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
