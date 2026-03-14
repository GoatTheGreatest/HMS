'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard, StatsGrid } from '@/components/DashboardCards';
import { SimpleLineChart } from '@/components/Charts';

const PRIORITY_COLORS = {
  HIGH: 'bg-red-100 text-red-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  LOW: 'bg-gray-100 text-gray-600',
};
const STATUS_COLORS = {
  NEW: 'bg-yellow-100 text-yellow-700',
  SCHEDULED: 'bg-teal-100 text-teal-700',
  EN_ROUTE: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function NurseDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/nurse');
      if (!res.ok) throw new Error('Failed to load dashboard data');
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateVisitStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/home-visits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600" />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{error}</div>
  );

  const { stats, homeVisitRequests = [], scheduleData = [], nurseName = 'Nurse' } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {nurseName} 🏥</h2>
        <p className="text-gray-500 text-sm mt-1">Your home visit schedule and patient overview.</p>
      </div>

      <StatsGrid>
        <StatCard icon="🏡" label="Home Visit Requests" value={stats?.todayRequestsCount ?? 0} sub="Today" />
        <StatCard icon="✅" label="Completed Today" value={stats?.completedToday ?? 0} sub="Finished visits" />
        <StatCard icon="👥" label="Active Patients" value={stats?.activePatients ?? 0} sub="Under your care" />
        <StatCard icon="📋" label="Pending Reports" value={stats?.pendingReports ?? 0} sub="Needs submission" />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="Weekly Visit Load"
          data={scheduleData}
          lines={[{ key: 'visits', color: '#ec4899' }]}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Today&apos;s Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Active Visits', value: String(stats?.activePatients ?? 0), color: 'bg-pink-100 text-pink-700' },
              { label: 'Completed Today', value: String(stats?.completedToday ?? 0), color: 'bg-teal-100 text-teal-700' },
              { label: 'Today\'s Requests', value: String(stats?.todayRequestsCount ?? 0), color: 'bg-blue-100 text-blue-700' },
              { label: 'Pending Reports', value: String(stats?.pendingReports ?? 0), color: 'bg-orange-100 text-orange-700' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Home Visit Requests</h3>
          <a href="/dashboard/nurse/home-visits" className="text-xs text-pink-600 font-semibold hover:underline">View All</a>
        </div>
        {homeVisitRequests.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No active home visit requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Patient</th>
                  <th className="pb-3 font-semibold">Address</th>
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">Priority</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {homeVisitRequests.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-800">{r.patient}</td>
                    <td className="py-3 text-gray-500 max-w-[140px] truncate">{r.address}</td>
                    <td className="py-3 text-gray-500">{r.time}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[r.priority] || ''}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 flex gap-1 flex-wrap">
                      {r.status === 'NEW' && (
                        <button
                          disabled={updating === r._id}
                          onClick={() => updateVisitStatus(r._id, 'EN_ROUTE')}
                          className="text-xs bg-teal-600 text-white px-2 py-1 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                        >
                          En Route
                        </button>
                      )}
                      {r.status === 'EN_ROUTE' && (
                        <button
                          disabled={updating === r._id}
                          onClick={() => updateVisitStatus(r._id, 'COMPLETED')}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Complete
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
