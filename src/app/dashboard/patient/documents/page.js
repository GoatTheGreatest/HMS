const docs = [
  { name: 'CBC Blood Test Report', date: 'Mar 10, 2026', type: 'Lab Result', size: '1.2 MB', icon: '🔬' },
  { name: 'Chest X-Ray', date: 'Feb 28, 2026', type: 'Radiology', size: '3.8 MB', icon: '🩻' },
  { name: 'Prescription — Feb 2026', date: 'Feb 15, 2026', type: 'Prescription', size: '0.3 MB', icon: '💊' },
  { name: 'ECG Report', date: 'Jan 18, 2026', type: 'Cardiology', size: '0.9 MB', icon: '❤️' },
  { name: 'Allergy Test Results', date: 'Dec 5, 2025', type: 'Lab Result', size: '0.6 MB', icon: '🔬' },
];

export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Documents 📁</h2>
          <p className="text-gray-500 text-sm mt-1">All your medical records in one place.</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors">
          + Upload
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {docs.map((doc) => (
          <div key={doc.name} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-xl">{doc.icon}</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.type} · {doc.date} · {doc.size}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs text-teal-600 font-semibold hover:underline">View</button>
              <button className="text-xs text-gray-400 hover:text-gray-600 font-semibold">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
