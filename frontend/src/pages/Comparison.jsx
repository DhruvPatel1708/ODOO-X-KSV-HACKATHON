import { useState, useMemo } from 'react';
import { CheckCircle, ArrowUpDown, Star } from 'lucide-react';
import { useToast } from '../components/Toast';
import { mockRFQs, mockQuotations } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Comparison() {
  const toast = useToast();
  const [selectedRFQId, setSelectedRFQId] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedVendor, setSelectedVendor] = useState(null);

  const rfqsWithQuotes = mockRFQs.filter(rfq =>
    mockQuotations.some(q => q.rfq_id === rfq.id)
  );

  const selectedRFQ = rfqsWithQuotes.find(r => r.id === parseInt(selectedRFQId));

  const quotes = useMemo(() => {
    if (!selectedRFQ) return [];
    const rfqQuotes = mockQuotations.filter(q => q.rfq_id === selectedRFQ.id);
    return [...rfqQuotes].sort((a, b) =>
      sortOrder === 'asc' ? a.total_amount - b.total_amount : b.total_amount - a.total_amount
    );
  }, [selectedRFQ, sortOrder]);

  // Get all unique items from the RFQ
  const itemNames = selectedRFQ?.items?.map(i => i.item_name) || [];

  // Find lowest price per item
  const lowestPrices = useMemo(() => {
    const map = {};
    itemNames.forEach(itemName => {
      let min = Infinity;
      quotes.forEach(q => {
        const item = q.items.find(i => i.item_name === itemName);
        if (item && item.unit_price < min) min = item.unit_price;
      });
      map[itemName] = min;
    });
    return map;
  }, [quotes, itemNames]);

  const handleSelectVendor = (quote) => {
    if (window.confirm(`Are you sure you want to select ${quote.vendor_name}? This will proceed to the Approval workflow.`)) {
      setSelectedVendor(quote.id);
      toast.success(`${quote.vendor_name} selected. Proceeding to Approval workflow.`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Quotation Comparison</h1>
        <p className="text-gray-500 text-sm mt-1">Compare vendor quotations side-by-side</p>
      </div>

      {/* RFQ Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="w-full max-w-md">
          <label className="label">Select RFQ</label>
          <select
            value={selectedRFQId}
            onChange={e => { setSelectedRFQId(e.target.value); setSelectedVendor(null); }}
            className="input"
          >
            <option value="">Choose an RFQ to compare...</option>
            {rfqsWithQuotes.map(rfq => (
              <option key={rfq.id} value={rfq.id}>
                {rfq.rfq_number} — {rfq.title}
              </option>
            ))}
          </select>
        </div>
        {quotes.length > 0 && (
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort by Total {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        )}
      </div>

      {/* Comparison Table */}
      {selectedRFQ && quotes.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header: Vendor info */}
              <thead>
                <tr className="bg-gray-50 border-b border-surface-border">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 min-w-[180px] sticky left-0 bg-gray-50 z-10 border-r border-surface-border">
                    Items
                  </th>
                  {quotes.map(q => (
                    <th key={q.id} className={`px-4 py-4 text-center min-w-[200px] ${selectedVendor === q.id ? 'bg-emerald-50' : ''}`}>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900">{q.vendor_name}</p>
                        <div className="flex items-center justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">Submitted: {formatDate(q.submitted_on)}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-surface-border">
                {/* Item rows */}
                {itemNames.map(itemName => (
                  <tr key={itemName} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-surface-border">
                      {itemName}
                    </td>
                    {quotes.map(q => {
                      const item = q.items.find(i => i.item_name === itemName);
                      const isLowest = item && item.unit_price === lowestPrices[itemName];
                      return (
                        <td key={q.id} className={`px-4 py-3 text-center ${selectedVendor === q.id ? 'bg-emerald-50/50' : ''}`}>
                          {item ? (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${
                              isLowest ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700'
                            }`}>
                              {formatCurrency(item.unit_price)}
                              {isLowest && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Delivery */}
                <tr className="bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50/50 z-10 border-r border-surface-border">
                    Delivery Timeline
                  </td>
                  {quotes.map(q => (
                    <td key={q.id} className={`px-4 py-3 text-center text-sm font-medium ${selectedVendor === q.id ? 'bg-emerald-50' : ''}`}>
                      {q.delivery_days} days
                    </td>
                  ))}
                </tr>

                {/* Subtotal */}
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700 sticky left-0 bg-white z-10 border-r border-surface-border">Subtotal</td>
                  {quotes.map(q => (
                    <td key={q.id} className={`px-4 py-3 text-center text-sm font-medium ${selectedVendor === q.id ? 'bg-emerald-50/50' : ''}`}>
                      {formatCurrency(q.subtotal)}
                    </td>
                  ))}
                </tr>

                {/* Tax */}
                <tr className="bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50/50 z-10 border-r border-surface-border">Tax (18%)</td>
                  {quotes.map(q => (
                    <td key={q.id} className={`px-4 py-3 text-center text-sm ${selectedVendor === q.id ? 'bg-emerald-50' : ''}`}>
                      {formatCurrency(q.tax)}
                    </td>
                  ))}
                </tr>

                {/* Grand Total */}
                <tr className="border-t-2 border-gray-300">
                  <td className="px-4 py-4 text-base font-bold text-gray-900 sticky left-0 bg-white z-10 border-r border-surface-border">Grand Total</td>
                  {quotes.map(q => {
                    const isLowest = q.total_amount === Math.min(...quotes.map(qq => qq.total_amount));
                    return (
                      <td key={q.id} className={`px-4 py-4 text-center ${selectedVendor === q.id ? 'bg-emerald-50/50' : ''}`}>
                        <span className={`text-base font-bold ${isLowest ? 'text-emerald-600' : 'text-gray-900'}`}>
                          {formatCurrency(q.total_amount)}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Action row */}
                <tr>
                  <td className="px-4 py-4 sticky left-0 bg-white z-10 border-r border-surface-border">
                    <span className="text-sm font-semibold text-gray-700">Action</span>
                  </td>
                  {quotes.map(q => (
                    <td key={q.id} className={`px-4 py-4 text-center ${selectedVendor === q.id ? 'bg-emerald-50/50' : ''}`}>
                      {selectedVendor === q.id ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" /> Selected
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectVendor(q)}
                          className="btn-primary text-sm"
                          disabled={selectedVendor !== null}
                        >
                          Select This Vendor
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedRFQ ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No quotations found for this RFQ</p>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
              <ArrowUpDown className="w-8 h-8 text-brand-300" />
            </div>
            <p className="text-gray-500 font-medium">Select an RFQ to compare quotations</p>
            <p className="text-gray-400 text-sm">Choose from the dropdown above to view side-by-side comparison</p>
          </div>
        </div>
      )}
    </div>
  );
}
