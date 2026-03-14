const messages = [
  { from: 'Zainab Mirza', subject: 'Visit timing change', preview: 'Can we move my visit to 11 AM instead?', date: 'Mar 12', unread: true },
  { from: 'Dr. Sarah Ahmed', subject: 'Care plan update for Rafiq', preview: 'Please update the dressing schedule for...', date: 'Mar 11', unread: true },
  { from: 'HMS Admin', subject: 'Schedule Update', preview: 'Your Thursday schedule has been updated...', date: 'Mar 10', unread: false },
];

export default function NurseMessages() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Messages 💬</h2>
        <p className="text-gray-500 text-sm mt-1">Communications from patients and care team.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {messages.map((msg) => (
          <div key={msg.subject} className={`flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer ${msg.unread ? 'bg-pink-50/30' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-700 flex-shrink-0">{msg.from[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm ${msg.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.from}</p>
                <span className="text-xs text-gray-400 flex-shrink-0">{msg.date}</span>
              </div>
              <p className={`text-sm ${msg.unread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{msg.subject}</p>
              <p className="text-xs text-gray-400 truncate">{msg.preview}</p>
            </div>
            {msg.unread && <div className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
