const orders = [
  { orderId: 'ORD-0021', medicine: 'Amoxicillin 500mg', quantity: 500, supplier: 'PharmaCo', orderDate: 'Mar 10, 2026', expectedDelivery: 'Mar 16, 2026', status: 'In Transit' },
  { orderId: 'ORD-0020', medicine: 'Paracetamol 500mg', quantity: 1000, supplier: 'MedPlus', orderDate: 'Mar 8, 2026', expectedDelivery: 'Mar 14, 2026', status: 'Delivered' },
  { orderId: 'ORD-0019', medicine: 'Insulin Glargine', quantity: 100, supplier: 'NovoNord', orderDate: 'Mar 5, 2026', expectedDelivery: 'Mar 20, 2026', status: 'Processing' },
  { orderId: 'ORD-0018', medicine: 'Atorvastatin 20mg', quantity: 300, supplier: 'PharmaCo', orderDate: 'Mar 1, 2026', expectedDelivery: 'Mar 12, 2026', status: 'Delivered' },
];

const sc = { 'In Transit': 'bg-blue-100 text-blue-700', Delivered: 'bg-green-100 text-green-700', Processing: 'bg-yellow-100 text-yellow-700', Cancelled: 'bg-red-100 text-red-600' };

export default function Orders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders 🛒</h2>
          <p className="text-gray-500 text-sm mt-1">Medicine procurement orders and delivery tracking.</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">+ New Order</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-semibold">Order ID</th>
                <th className="pb-3 font-semibold">Medicine</th>
                <th className="pb-3 font-semibold">Qty</th>
                <th className="pb-3 font-semibold">Supplier</th>
                <th className="pb-3 font-semibold">Order Date</th>
                <th className="pb-3 font-semibold">Expected</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.orderId} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-mono text-xs text-purple-700">{o.orderId}</td>
                  <td className="py-3 font-medium text-gray-800">{o.medicine}</td>
                  <td className="py-3 text-gray-600">{o.quantity}</td>
                  <td className="py-3 text-gray-500">{o.supplier}</td>
                  <td className="py-3 text-gray-400 text-xs">{o.orderDate}</td>
                  <td className="py-3 text-gray-400 text-xs">{o.expectedDelivery}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${sc[o.status]}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
