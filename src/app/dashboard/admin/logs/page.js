const logs = [
  { time: '2026-03-13 14:32:10', level: 'INFO', action: 'User Login', user: 'ali@example.com', ip: '192.168.1.10', message: 'Successful login from Patient portal' },
  { time: '2026-03-13 14:28:44', level: 'WARN', action: 'Failed Login', user: 'unknown@example.com', ip: '45.32.11.88', message: 'Invalid credentials — 3rd attempt' },
  { time: '2026-03-13 13:55:02', level: 'INFO', action: 'Doctor Approved', user: 'admin@hms.com', ip: '192.168.1.1', message: 'Dr. Sarah Ahmed credentials approved' },
  { time: '2026-03-13 12:10:33', level: 'ERROR', action: 'DB Connection', user: 'system', ip: '127.0.0.1', message: 'MongoDB timeout — retried successfully' },
  { time: '2026-03-13 11:20:11', level: 'INFO', action: 'New User Registered', user: 'system', ip: '203.10.8.77', message: 'New patient registered: Omar Siddiqui' },
  { time: '2026-03-13 10:05:44', level: 'INFO', action: 'Appointment Booked', user: 'ali@example.com', ip: '192.168.1.10', message: 'Appointment booked with Dr. James Malik' },
  { time: '2026-03-13 09:00:01', level: 'INFO', action: 'Server Start', user: 'system', ip: '127.0.0.1', message: 'HMS application server started successfully' },
];

const levelColors = { INFO: 'bg-blue-100 text-blue-700', WARN: 'bg-yellow-100 text-yellow-700', ERROR: 'bg-red-100 text-red-700' };

export default function AdminLogs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Logs 🖥️</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time platform activity and error logs.</p>
        </div>
        <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">Export Logs</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Level</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">IP</th>
                <th className="pb-3 font-semibold">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log, i) => (
                <tr key={i} className={`hover:bg-gray-50 transition-colors ${log.level === 'ERROR' ? 'bg-red-50/30' : log.level === 'WARN' ? 'bg-yellow-50/30' : ''}`}>
                  <td className="py-3 font-mono text-gray-400">{log.time}</td>
                  <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${levelColors[log.level]}`}>{log.level}</span></td>
                  <td className="py-3 font-medium text-gray-700">{log.action}</td>
                  <td className="py-3 text-gray-500">{log.user}</td>
                  <td className="py-3 font-mono text-gray-400">{log.ip}</td>
                  <td className="py-3 text-gray-500">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
