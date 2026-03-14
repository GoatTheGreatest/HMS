const messages = [
  { from: 'Ali Hassan', subject: 'Question about medication', preview: 'Doctor, I have a question about the dosage...', date: 'Mar 12', unread: true },
  { from: 'Sara Khan', subject: 'Re: Follow-up appointment', preview: 'Thank you for the prescription, I will...', date: 'Mar 11', unread: true },
  { from: 'HMS System', subject: 'Lab results available', preview: 'Patient Bilal Ahmed has new lab results...', date: 'Mar 10', unread: false },
  { from: 'Fatima Noor', subject: 'Side effects concern', preview: 'Hi Doctor, I have been experiencing...', date: 'Mar 9', unread: false },
];

export default function DoctorMessages() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages 💬</h2>
          <p className="text-gray-500 text-sm mt-1">Patient communications and system notifications.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          + Compose
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {messages.map((msg) => (
          <div key={msg.subject} className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${msg.unread ? 'bg-blue-50/30' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 flex-shrink-0">{msg.from[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm ${msg.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.from}</p>
                <span className="text-xs text-gray-400 flex-shrink-0">{msg.date}</span>
              </div>
              <p className={`text-sm ${msg.unread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{msg.subject}</p>
              <p className="text-xs text-gray-400 truncate">{msg.preview}</p>
            </div>
            {msg.unread && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
