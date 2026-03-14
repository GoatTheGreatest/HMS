'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/apiClient';

const PRIORITY_COLORS = { HIGH: 'bg-red-100 text-red-700', NORMAL: 'bg-blue-100 text-blue-700', LOW: 'bg-gray-100 text-gray-600' };
const STATUS_COLORS = { NEW: 'bg-yellow-100 text-yellow-700', SCHEDULED: 'bg-teal-100 text-teal-700', EN_ROUTE: 'bg-purple-100 text-purple-700', COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-600' };

export default function NurseHomeVisitsPage() {
  const [visits, setVisits]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter]     = useState('active');
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const data = await apiFetch('/api/home-visits');
      setVisits(data.visits || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load home visits');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await apiFetch(`/api/home-visits/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      toast.success(`Visit marked as ${status.replace('_', ' ').toLowerCase()}.`);
      fetchData();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'active'
    ? visits.filter(v => !['COMPLETED', 'CANCELLED'].includes(v.status))
    : filter === 'completed'
    ? visits.filter(v => v.status === 'COMPLETED')
    : visits;

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Home Visit Requests 🏡</h2>
        <p className="text-gray-500 text-sm mt-1">{visits.length} total home visits assigned to you.</p>
      </div>

      <div className="flex gap-2">
        {[['active', 'Active'], ['completed', 'Completed'], ['all', 'All']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === val ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🏡</p>
          <p className="text-gray-500">No home visits found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => (
            <div key={v._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{v.patientName || 'Patient'}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[v.priority] || ''}`}>{v.priority}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[v.status] || ''}`}>{v.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">📍 {v.address}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    🕐 {v.scheduledTime || '—'} · 📅 {v.scheduledDate ? new Date(v.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                  {v.notes && <p className="text-xs text-gray-500 mt-1 italic">{v.notes}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {v.status === 'NEW' && (
                    <button disabled={updating === v._id} onClick={() => updateStatus(v._id, 'SCHEDULED')} className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50">
                      {updating === v._id ? '…' : 'Schedule'}
                    </button>
                  )}
                  {v.status === 'SCHEDULED' && (
                    <button disabled={updating === v._id} onClick={() => updateStatus(v._id, 'EN_ROUTE')} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                      {updating === v._id ? '…' : 'En Route'}
                    </button>
                  )}
                  {v.status === 'EN_ROUTE' && (
                    <button disabled={updating === v._id} onClick={() => updateStatus(v._id, 'COMPLETED')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                      {updating === v._id ? '…' : 'Complete'}
                    </button>
                  )}
                  {!['COMPLETED', 'CANCELLED'].includes(v.status) && (
                    <button disabled={updating === v._id} onClick={() => updateStatus(v._id, 'CANCELLED')} className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                      {updating === v._id ? '…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
