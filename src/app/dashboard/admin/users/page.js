'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/apiClient';

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [roleFilter, setRole] = useState('');
  const [toggling, setToggling] = useState(null);
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, ...(roleFilter && { role: roleFilter }) });
      const data = await apiFetch(`/api/admin/users?${q}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (e) {
      toast.error(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleActive = async (userId, isActive) => {
    setToggling(userId);
    try {
      await apiFetch('/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify({ userId, isActive }),
      });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully.`);
      fetchUsers();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally {
      setToggling(null);
    }
  };

  const ROLE_COLORS = {
    ADMIN:          'bg-slate-100 text-slate-700',
    DOCTOR:         'bg-blue-100 text-blue-700',
    NURSE:          'bg-pink-100 text-pink-700',
    PATIENT:        'bg-teal-100 text-teal-700',
    PHARMACEUTICAL: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management 👤</h2>
        <p className="text-gray-500 text-sm mt-1">{total.toLocaleString()} registered users on the platform.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'PATIENT', 'DOCTOR', 'NURSE', 'PHARMACEUTICAL', 'ADMIN'].map(r => (
          <button
            key={r}
            onClick={() => { setRole(r); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              roleFilter === r ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-gray-600 border-gray-200 hover:border-slate-400'
            }`}
          >
            {r || 'All Roles'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {`${u.firstName} ${u.lastName}`.trim() || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={toggling === u._id || u.role === 'ADMIN'}
                        onClick={() => toggleActive(u._id, !u.isActive)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-40 ${
                          u.isActive
                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {toggling === u._id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
          <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
        </div>
      )}
    </div>
  );
}
