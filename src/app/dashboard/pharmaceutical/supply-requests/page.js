const requests = [
  { medicine: 'Amoxicillin 500mg', quantity: 200, requestedBy: 'Dr. Ashar Raza', date: 'Mar 13, 2026', status: 'Pending', priority: 'Urgent' },
  { medicine: 'Insulin Glargine', quantity: 50, requestedBy: 'Dr. Sara Khalid', date: 'Mar 12, 2026', status: 'Approved', priority: 'High' },
  { medicine: 'Methotrexate 2.5mg', quantity: 100, requestedBy: 'Dr. Rizwan Shah', date: 'Mar 11, 2026', status: 'Pending', priority: 'Normal' },
  { medicine: 'IV Normal Saline', quantity: 30, requestedBy: 'Nurse Sana Tariq', date: 'Mar 10, 2026', status: 'Processing', priority: 'High' },
  { medicine: 'Ceftriaxone 1g', quantity: 80, requestedBy: 'Dr. Usman Qureshi', date: 'Mar 9, 2026', status: 'Approved', priority: 'Normal' },
];

const sc = { Pending: 'bg-yellow-100 text-yellow-700', Approved: 'bg-green-100 text-green-700', Processing: 'bg-blue-100 text-blue-700' };
const pc = { Urgent: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Normal: 'bg-gray-100 text-gray-600' };

export default function SupplyRequests() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Supply Requests 📦</h2>
        <p className="text-gray-500 text-sm mt-1">Incoming medicine requests from doctors and nurses.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-semibold">Medicine</th>
                <th className="pb-3 font-semibold">Qty</th>
                <th className="pb-3 font-semibold">Requested By</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium text-gray-800">{r.medicine}</td>
                  <td className="py-3 text-gray-600">{r.quantity}</td>
                  <td className="py-3 text-gray-500">{r.requestedBy}</td>
                  <td className="py-3 text-gray-400 text-xs">{r.date}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${pc[r.priority]}`}>{r.priority}</span></td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${sc[r.status]}`}>{r.status}</span></td>
                  <td className="py-3">
                    {r.status === 'Pending' && (
                      <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-purple-700 transition-colors">Approve</button>
                    )}
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
