const expired = [
  { name: 'Penicillin V 250mg', category: 'Antibiotic', expiredOn: 'Feb 28, 2026', quantity: 30, unit: 'Tablets', action: 'Disposal' },
  { name: 'Dextrose 5% IV', category: 'IV Fluid', expiredOn: 'Jan 15, 2026', quantity: 5, unit: 'Bags', action: 'Disposal' },
  { name: 'Vitamin B Complex', category: 'Vitamin', expiredOn: 'Mar 1, 2026', quantity: 120, unit: 'Tablets', action: 'Return to Supplier' },
  { name: 'Cefixime 200mg', category: 'Antibiotic', expiredOn: 'Feb 20, 2026', quantity: 48, unit: 'Capsules', action: 'Disposal' },
  { name: 'Antacid Suspension', category: 'GI', expiredOn: 'Mar 5, 2026', quantity: 10, unit: 'Bottles', action: 'Disposal' },
  { name: 'Folic Acid 5mg', category: 'Supplement', expiredOn: 'Jan 31, 2026', quantity: 200, unit: 'Tablets', action: 'Return to Supplier' },
  { name: 'Hydrocortisone Cream', category: 'Topical', expiredOn: 'Feb 10, 2026', quantity: 8, unit: 'Tubes', action: 'Disposal' },
];

export default function ExpiredMedicines() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expired Medicines ⚠️</h2>
          <p className="text-gray-500 text-sm mt-1">Medicines past their expiry date that require action.</p>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
          Mark All Disposed
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <p className="text-sm text-red-700 font-medium">{expired.length} medicines have expired and require immediate disposal or return to supplier.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-semibold">Medicine</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Expired On</th>
                <th className="pb-3 font-semibold">Quantity</th>
                <th className="pb-3 font-semibold">Recommended Action</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expired.map((item) => (
                <tr key={item.name} className="hover:bg-red-50/50 transition-colors">
                  <td className="py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="py-3 text-gray-500">{item.category}</td>
                  <td className="py-3 text-red-600 font-medium">{item.expiredOn}</td>
                  <td className="py-3 text-gray-600">{item.quantity} {item.unit}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.action === 'Disposal' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{item.action}</span>
                  </td>
                  <td className="py-3">
                    <button className="text-xs bg-gray-800 text-white px-3 py-1 rounded-lg font-semibold hover:bg-gray-900 transition-colors">Confirm</button>
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
