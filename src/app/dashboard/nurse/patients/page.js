const patients = [
  { name: 'Zainab Mirza', age: 68, condition: 'Post-fracture recovery', visits: 8, lastVisit: 'Mar 12', status: 'Active' },
  { name: 'Rafiq Ahmed', age: 75, condition: 'Wound dressing (leg ulcer)', visits: 12, lastVisit: 'Mar 12', status: 'Active' },
  { name: 'Maria Shahid', age: 52, condition: 'IV antibiotics administration', visits: 3, lastVisit: 'Mar 11', status: 'Active' },
  { name: 'Tariq Mehmood', age: 80, condition: 'Palliative care support', visits: 20, lastVisit: 'Mar 10', status: 'Long-term' },
  { name: 'Aisha Raza', age: 45, condition: 'Post-op monitoring', visits: 5, lastVisit: 'Mar 9', status: 'Recovered' },
];

export default function NursePatients() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Patients 👥</h2>
        <p className="text-gray-500 text-sm mt-1">Patients under your home nursing care.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-semibold">Patient</th>
                <th className="pb-3 font-semibold">Age</th>
                <th className="pb-3 font-semibold">Condition</th>
                <th className="pb-3 font-semibold">Total Visits</th>
                <th className="pb-3 font-semibold">Last Visit</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.map((p) => (
                <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="py-3 text-gray-500">{p.age}</td>
                  <td className="py-3 text-gray-600 text-xs">{p.condition}</td>
                  <td className="py-3 text-gray-700 font-medium">{p.visits}</td>
                  <td className="py-3 text-gray-500">{p.lastVisit}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'Active' ? 'bg-pink-100 text-pink-700' : p.status === 'Long-term' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {p.status}
                    </span>
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
