'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard, StatsGrid } from '@/components/DashboardCards';
import { SimpleLineChart, SimpleBarChart } from '@/components/Charts';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/apiClient';

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [acting, setActing]   = useState(null);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/admin');
      if (!res.ok) throw new Error('Failed to load dashboard data');
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleVerify = async (profileId, role, action) => {
    setActing(profileId);
    try {
      await apiFetch(`/api/admin/verify/${profileId}`, {
        method: 'PUT',
        body: JSON.stringify({ action, role: role.toLowerCase() }),
      });
      toast.success(`${role} ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      fetchData();
    } catch (e) {
      toast.error(e.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600" />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{error}</div>
  );

  const {
    stats,
    pendingVerifications = [],
    roleData = [],
    registrationData = [],
  } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Control Panel 🛡️</h2>
        <p className="text-gray-500 text-sm mt-1">Platform overview — users, verifications, and system health.</p>
      </div>

      <StatsGrid>
        <StatCard icon="👤" label="Total Users" value={(stats?.totalUsers ?? 0).toLocaleString()} sub="Registered accounts" />
        <StatCard icon="⏳" label="Pending Verifications" value={stats?.pendingCount ?? 0} sub="Doctors & Nurses" />
        <StatCard icon="🩺" label="Verified Doctors" value={stats?.verifiedDoctors ?? 0} sub="Active on platform" />
        <StatCard icon="🏥" label="Verified Nurses" value={stats?.verifiedNurses ?? 0} sub="Active nurses" />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="User Registrations — Last 7 Months"
          data={registrationData}
          lines={[{ key: 'users', color: 'red' }]}
        />
        <SimpleBarChart
          title="Users by Role"
          data={roleData}
          bars={[{ key: 'count', color: 'red' }]}
        />
      </div>

      {/* Pending Verifications */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Pending Credential Verifications</h3>
            {pendingVerifications.length > 0 && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                {pendingVerifications.length} pending
              </span>
            )}
          </div>
          <a href="/dashboard/admin/verify" className="text-xs text-slate-600 font-semibold hover:underline">View All</a>
        </div>

        {pendingVerifications.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-green-600 font-semibold text-sm">✅ All verifications are up to date.</p>
            <p className="text-gray-400 text-xs mt-1">New doctor/nurse registrations will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Specialty</th>
                  <th className="pb-3 font-semibold">License #</th>
                  <th className="pb-3 font-semibold">Submitted</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingVerifications.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-800">{v.name || '—'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v.role === 'Doctor' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {v.role}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{v.specialty}</td>
                    <td className="py-3 text-gray-400 font-mono text-xs">{v.license}</td>
                    <td className="py-3 text-gray-500">{v.submitted}</td>
                    <td className="py-3 flex items-center gap-2">
                      <button
                        disabled={acting === v._id}
                        onClick={() => handleVerify(v._id, v.role, 'approve')}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {acting === v._id ? '…' : 'Approve'}
                      </button>
                      <button
                        disabled={acting === v._id}
                        onClick={() => handleVerify(v._id, v.role, 'reject')}
                        className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-lg font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {acting === v._id ? '…' : 'Reject'}
                      </button>
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
