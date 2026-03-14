'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function MedicalHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      const completed = (data.appointments || []).filter(a => a.status === 'COMPLETED');
      setAppointments(completed);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const TYPE_COLORS = {
    PHYSICAL: 'bg-blue-100 text-blue-700',
    VIRTUAL: 'bg-yellow-100 text-yellow-700',
    HOME_VISIT: 'bg-green-100 text-green-700',
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Medical History 📋</h2>
        <p className="text-gray-500 text-sm mt-1">Your complete medical visit timeline.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">No completed visits yet.</p>
          <Link href="/dashboard/patient/find-doctors" className="mt-4 inline-block bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors">
            Find a Doctor
          </Link>
        </div>
      ) : (
        <div className="relative pl-6 space-y-0">
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-teal-100" />
          {appointments.map((item, i) => (
            <div key={item._id || i} className="relative pb-6">
              <div className="absolute -left-4 top-4 w-4 h-4 rounded-full border-2 border-teal-500 bg-white" />
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ml-4 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-600'}`}>
                    {item.type?.replace('_', ' ') || 'Visit'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.diagnosis || item.chiefComplaint || 'Appointment'}</h3>
                <p className="text-xs text-teal-600 font-medium mb-2">{item.doctorName || 'Doctor'}</p>
                {item.prescription && (
                  <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">Prescription:</span> {item.prescription}</p>
                )}
                {item.notes && (
                  <p className="text-sm text-gray-400 mt-1 italic">{item.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
