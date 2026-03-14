'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard, StatsGrid } from '@/components/DashboardCards';
import { SimpleLineChart } from '@/components/Charts';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/apiClient';

export default function PatientDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [cancelling, setCancelling] = useState(null);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/patient');
      if (!res.ok) throw new Error('Failed to load dashboard data');
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCancel = async (apptId) => {
    if (!confirm('Cancel this appointment?')) return;
    setCancelling(apptId);
    try {
      await apiFetch(`/api/appointments/${apptId}`, { method: 'DELETE' });
      toast.success('Appointment cancelled.');
      fetchData();
    } catch (e) {
      toast.error(e.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{error}</div>
  );

  const { stats, upcomingAppointments = [], recentDocuments = [], chartData = [], patientName = 'Patient' } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {patientName} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your health overview for today.</p>
      </div>

      <StatsGrid>
        <StatCard icon="🩺" label="Last Doctor Visit" value={stats?.lastVisit?.doctor || 'None yet'} sub={stats?.lastVisit?.date || '—'} />
        <StatCard icon="📅" label="Upcoming Appointments" value={stats?.upcomingCount ?? 0} sub="Scheduled" />
        <StatCard icon="📋" label="Medical Records" value={stats?.totalRecords ?? 0} sub="All time" />
        <StatCard icon="📁" label="Uploaded Documents" value={stats?.totalDocuments ?? 0} sub="All time" />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="Doctor Visits — Last 7 Months"
          data={chartData}
          lines={[{ key: 'visits', color: '#0d9488' }]}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Documents</h3>
          {recentDocuments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.type} · {doc.date}</p>
                  </div>
                  <a href={`/dashboard/patient/documents`} className="text-xs text-teal-600 font-semibold hover:underline">View</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Upcoming Appointments</h3>
          <a href="/dashboard/patient/book-appointment" className="text-xs text-teal-600 font-semibold hover:underline">Book New</a>
        </div>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm mb-3">No upcoming appointments.</p>
            <a href="/dashboard/patient/find-doctors" className="inline-flex items-center gap-2 bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
              🔍 Find a Doctor
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Doctor</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcomingAppointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-800">{appt.doctor}</td>
                    <td className="py-3 text-gray-500">{appt.date}</td>
                    <td className="py-3 text-gray-500">{appt.time}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        appt.status === 'SCHEDULED' ? 'bg-green-100 text-green-700' :
                        appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{appt.status}</span>
                    </td>
                    <td className="py-3">
                      {!['COMPLETED', 'CANCELLED'].includes(appt.status) && (
                        <button
                          disabled={cancelling === appt._id}
                          onClick={() => handleCancel(appt._id)}
                          className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          {cancelling === appt._id ? '…' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
