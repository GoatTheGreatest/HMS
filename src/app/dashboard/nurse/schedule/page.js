const schedule = [
  { day: 'Monday', shift: '7:00 AM – 3:00 PM', area: 'Zone A – Garden Town', visits: 4, status: 'Completed' },
  { day: 'Tuesday', shift: '7:00 AM – 3:00 PM', area: 'Zone B – DHA', visits: 5, status: 'Completed' },
  { day: 'Wednesday', shift: '7:00 AM – 3:00 PM', area: 'Zone A – Garden Town', visits: 3, status: 'In Progress' },
  { day: 'Thursday', shift: '12:00 PM – 8:00 PM', area: 'Zone C – Johar Town', visits: 4, status: 'Upcoming' },
  { day: 'Friday', shift: '12:00 PM – 8:00 PM', area: 'Zone B – DHA', visits: 3, status: 'Upcoming' },
  { day: 'Saturday', shift: 'Off', area: '—', visits: 0, status: 'Off' },
  { day: 'Sunday', shift: 'On-Call', area: 'Emergency only', visits: 0, status: 'On-Call' },
];

const statusColors = { Completed: 'bg-green-100 text-green-700', 'In Progress': 'bg-blue-100 text-blue-700', Upcoming: 'bg-yellow-100 text-yellow-700', Off: 'bg-gray-100 text-gray-500', 'On-Call': 'bg-orange-100 text-orange-700' };

export default function NurseSchedule() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Schedule 🗓️</h2>
        <p className="text-gray-500 text-sm mt-1">Weekly shift and visit schedule.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-semibold">Day</th>
                <th className="pb-3 font-semibold">Shift</th>
                <th className="pb-3 font-semibold">Area</th>
                <th className="pb-3 font-semibold">Visits</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {schedule.map((s) => (
                <tr key={s.day} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-semibold text-gray-800">{s.day}</td>
                  <td className="py-3 text-gray-500 text-xs">{s.shift}</td>
                  <td className="py-3 text-gray-500">{s.area}</td>
                  <td className="py-3 text-gray-700 font-medium">{s.visits > 0 ? s.visits : '—'}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[s.status]}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
