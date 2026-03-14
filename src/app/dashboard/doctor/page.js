'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard, StatsGrid } from '@/components/DashboardCards';
import { SimpleBarChart } from '@/components/Charts';

export default function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/doctor');
      if (!res.ok) throw new Error('Failed to load dashboard data');
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{error}</div>
  );

  const { stats, recentPatients = [], chartData = [], doctorName = 'Doctor' } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Good day, {doctorName} 👨‍⚕️</h2>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your clinical summary for today.</p>
      </div>

      <StatsGrid>
        <StatCard icon="👥" label="Total Patients Treated" value={stats?.totalPatients ?? 0} sub="Completed appointments" />
        <StatCard icon="📅" label="Today&apos;s Appointments" value={stats?.todayAppointments ?? 0} sub="Scheduled today" />
        <StatCard icon="💊" label="Pending Prescriptions" value={stats?.pendingPrescriptions ?? 0} sub="Needs review" />
        <StatCard icon="📊" label="This Month" value={stats?.monthlyConsultations ?? 0} sub="Consultations" />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Monthly Consultations"
          data={chartData}
          bars={[{ key: 'consultations', color: '#3b82f6' }]}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Write Prescription', icon: '💊', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', href: '/dashboard/doctor/prescriptions' },
              { label: 'View Appointments', icon: '📅', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100', href: '/dashboard/doctor/appointments' },
              { label: 'My Patients', icon: '👥', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100', href: '/dashboard/doctor/patients' },
              { label: 'Analytics', icon: '📊', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100', href: '/dashboard/doctor/analytics' },
            ].map((a) => (
              <a key={a.label} href={a.href} className={`${a.color} flex flex-col items-center gap-2 p-4 rounded-xl transition-colors text-sm font-medium text-center`}>
                <span className="text-2xl">{a.icon}</span>
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Recent Patients</h3>
          <a href="/dashboard/doctor/patients" className="text-xs text-blue-600 font-semibold hover:underline">View All</a>
        </div>
        {recentPatients.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No patients yet. Appointments will appear here once completed.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Patient Name</th>
                  <th className="pb-3 font-semibold">Diagnosis</th>
                  <th className="pb-3 font-semibold">Prescription</th>
                  <th className="pb-3 font-semibold">Last Visit</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                        {p.name?.[0] || '?'}
                      </div>
                      <span className="font-medium text-gray-800">{p.name}</span>
                    </td>
                    <td className="py-3 text-gray-600">{p.diagnosis}</td>
                    <td className="py-3 text-gray-600 max-w-[140px] truncate">{p.prescription}</td>
                    <td className="py-3 text-gray-500">{p.lastVisit}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        p.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{p.status}</span>
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
