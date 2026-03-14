const reports = [
  { title: 'Monthly Patient Report — Feb 2026', type: 'Patient', generated: 'Mar 1, 2026', size: '2.4 MB' },
  { title: 'Doctor Performance Report — Q1 2026', type: 'Performance', generated: 'Mar 1, 2026', size: '1.8 MB' },
  { title: 'Pharmaceutical Inventory Report', type: 'Inventory', generated: 'Mar 5, 2026', size: '3.1 MB' },
  { title: 'Revenue & Billing Report — Jan 2026', type: 'Financial', generated: 'Feb 3, 2026', size: '4.2 MB' },
  { title: 'Nurse Compliance Report', type: 'Compliance', generated: 'Feb 28, 2026', size: '1.2 MB' },
];

const typeColors = { Patient: 'bg-teal-100 text-teal-700', Performance: 'bg-blue-100 text-blue-700', Inventory: 'bg-purple-100 text-purple-700', Financial: 'bg-green-100 text-green-700', Compliance: 'bg-orange-100 text-orange-700' };

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports 📄</h2>
          <p className="text-gray-500 text-sm mt-1">Platform reports and analytics exports.</p>
        </div>
        <button className="px-4 py-2 bg-slate-700 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">+ Generate Report</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {reports.map((r) => (
          <div key={r.title} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl">📄</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{r.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">Generated: {r.generated} · {r.size}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeColors[r.type]}`}>{r.type}</span>
              <button className="text-xs text-slate-600 font-semibold hover:underline">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
