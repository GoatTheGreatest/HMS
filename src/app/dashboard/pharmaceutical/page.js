'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard, StatsGrid } from '@/components/DashboardCards';
import { SimpleBarChart } from '@/components/Charts';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/apiClient';

export default function PharmaceuticalDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [ordering, setOrdering] = useState(null);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/pharmaceutical');
      if (!res.ok) throw new Error('Failed to load dashboard data');
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOrderNow = async (med) => {
    setOrdering(med._id);
    try {
      await apiFetch('/api/supply-requests', {
        method: 'POST',
        body: JSON.stringify({ medicineId: med._id, quantity: med.threshold || 50, notes: 'Automated low stock restock' }),
      });
      toast.success(`Restock request sent for ${med.name}.`);
    } catch (e) {
      toast.error(e.message || 'Failed to place order');
    } finally {
      setOrdering(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{error}</div>
  );

  const { stats, lowStockItems = [], expiredMeds = [], stockData = [], pharmaName = 'Pharmacist' } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inventory Dashboard 🧪</h2>
        <p className="text-gray-500 text-sm mt-1">Hello {pharmaName}, here is the current pharmacy overview.</p>
      </div>

      <StatsGrid>
        <StatCard icon="📦" label="Total Stock" value={(stats?.totalStock ?? 0).toLocaleString()} sub="Units available" />
        <StatCard icon="📉" label="Low Stock Items" value={stats?.lowStockCount ?? 0} sub="Needs restocking" />
        <StatCard icon="⚠️" label="Expired Medicines" value={stats?.expiredCount ?? 0} sub="Requires disposal" />
        <StatCard icon="🚚" label="Pending Orders" value={stats?.pendingOrders ?? 0} sub="In transit" />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Stock Levels by Category"
          data={stockData}
          bars={[{ key: 'stock', color: '#9333ea' }]}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mt-1">Expired & Expiring Soon</h3>
            {expiredMeds.length > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{expiredMeds.length} items</span>}
          </div>
          {expiredMeds.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
              <span className="text-3xl mb-2">✅</span>
              <p className="text-sm font-medium">All medicines are well within expiry dates.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
              {expiredMeds.map((med) => (
                <div key={med._id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{med.name}</p>
                    <p className="text-xs text-red-500 font-semibold mb-1">Exp: {med.expiryDate}</p>
                    <p className="text-[11px] text-gray-500">{med.category} · {med.stock} in stock</p>
                  </div>
                  <button className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Low Stock Alerts</h3>
          <a href="/dashboard/pharmaceutical/inventory" className="text-xs text-purple-600 font-semibold hover:underline">Manage Inventory</a>
        </div>
        {lowStockItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-green-600 font-semibold text-sm">✅ Inventory levels are optimal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Medicine</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Current Stock</th>
                  <th className="pb-3 font-semibold">Threshold</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lowStockItems.map((med) => (
                  <tr key={med._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-800">{med.name}</td>
                    <td className="py-3 text-gray-500">{med.category}</td>
                    <td className="py-3">
                      <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md">{med.stock}</span>
                    </td>
                    <td className="py-3 text-gray-500">{med.threshold}</td>
                    <td className="py-3">
                      <button
                        disabled={ordering === med._id}
                        onClick={() => handleOrderNow(med)}
                        className="text-xs bg-purple-600 text-white font-semibold px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {ordering === med._id ? 'Ordering…' : 'Order Now'}
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
