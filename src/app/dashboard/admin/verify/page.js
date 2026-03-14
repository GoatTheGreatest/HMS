'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/apiClient';

export default function AdminVerifyPage() {
  const [pending, setPending]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState(null);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const data = await apiFetch('/api/dashboard/admin');
      setPending(data.pendingVerifications || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load verifications');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (profileId, role, action) => {
    setActing(profileId);
    try {
      const data = await apiFetch(`/api/admin/verify/${profileId}`, {
        method: 'PUT',
        body: JSON.stringify({ action, role: role.toLowerCase() }),
      });
      toast.success(data.message || `${role} ${action === 'approve' ? 'approved' : 'rejected'}.`);
      fetchData();
    } catch (e) {
      toast.error(e.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Credential Verifications ✅</h2>
        <p className="text-gray-500 text-sm mt-1">Review and approve/reject doctor and nurse registrations.</p>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-gray-600 font-semibold">All verifications are up to date</p>
          <p className="text-gray-400 text-sm mt-1">New doctor/nurse sign-ups will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(v => (
            <div key={v._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{v.name || 'Unknown'}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v.role === 'Doctor' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {v.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{v.email}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                  <span>🏥 {v.specialty}</span>
                  <span className="font-mono">📋 {v.license}</span>
                  <span>📅 Submitted: {v.submitted}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  disabled={acting === v._id}
                  onClick={() => handleAction(v._id, v.role, 'approve')}
                  className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {acting === v._id ? '…' : '✓ Approve'}
                </button>
                <button
                  disabled={acting === v._id}
                  onClick={() => handleAction(v._id, v.role, 'reject')}
                  className="bg-red-50 text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {acting === v._id ? '…' : '✕ Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
