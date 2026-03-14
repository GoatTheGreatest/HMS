'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/apiClient';

const STATUS_COLORS = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  NO_SHOW:   'bg-gray-100 text-gray-600',
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState(null);
  const [filter, setFilter]             = useState('all');
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const data = await apiFetch('/api/appointments');
      setAppointments(data.appointments || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id, status, extra = {}) => {
    setUpdating(id);
    try {
      await apiFetch(`/api/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, ...extra }),
      });
      toast.success(`Appointment marked as ${status.toLowerCase()}.`);
      fetchData();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter.toUpperCase());

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Appointments 📅</h2>
        <p className="text-gray-500 text-sm mt-1">Manage and update your patient appointments.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
              filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">No appointments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Complaint</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(appt => (
                  <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{appt.patientName}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{appt.timeSlot || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{appt.type}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{appt.chiefComplaint || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[appt.status] || ''}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-1 flex-wrap">
                      {appt.status === 'PENDING' && (
                        <button
                          disabled={updating === appt._id}
                          onClick={() => updateStatus(appt._id, 'SCHEDULED')}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {updating === appt._id ? '…' : 'Confirm'}
                        </button>
                      )}
                      {appt.status === 'SCHEDULED' && (
                        <button
                          disabled={updating === appt._id}
                          onClick={() => updateStatus(appt._id, 'COMPLETED')}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {updating === appt._id ? '…' : 'Complete'}
                        </button>
                      )}
                      {!['COMPLETED', 'CANCELLED'].includes(appt.status) && (
                        <button
                          disabled={updating === appt._id}
                          onClick={() => updateStatus(appt._id, 'CANCELLED')}
                          className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {updating === appt._id ? '…' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
