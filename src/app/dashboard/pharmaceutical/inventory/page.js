'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/apiClient';
import { io } from 'socket.io-client';

export default function PharmaceuticalInventoryPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentMed, setCurrentMed] = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const toast = useToast();

  const fetchInventory = useCallback(async () => {
    try {
      const data = await apiFetch('/api/medicines');
      setMedicines(data.medicines || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { 
    fetchInventory(); 
    
    // Socket.IO real-time updates
    const socket = io('http://localhost:3001');
    socket.on('inventoryUpdated', (payload) => {
      if (!payload) return;
      const { action, medicine, id } = payload;
      
      if (action === 'create' && medicine) {
        setMedicines(prev => {
          // Prevent duplicates
          if (prev.find(m => m._id === medicine._id)) return prev;
          return [...prev, medicine];
        });
      } else if (action === 'update' && medicine) {
        setMedicines(prev => prev.map(m => m._id === medicine._id ? medicine : m));
      } else if (action === 'delete' && id) {
        setMedicines(prev => prev.filter(m => m._id !== id));
      }
    });

    return () => socket.disconnect();
  }, [fetchInventory]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    setDeleting(id);
    try {
      await apiFetch(`/api/medicines/${id}`, { method: 'DELETE' });
      toast.success('Medicine removed entirely.');
      fetchInventory();
    } catch (e) {
      toast.error(e.message || 'Deletion failed');
    } finally {
      setDeleting(null);
    }
  };

  const openForm = (med = null) => {
    setCurrentMed(med ? { ...med, expiryDate: med.expiryDate.split('T')[0] } : { name: '', category: '', stock: 0, price: 0, expiryDate: '', unit: 'tablet', lowStockThreshold: 10 });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!currentMed._id;
      const url = isEdit ? `/api/medicines/${currentMed._id}` : '/api/medicines';
      await apiFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(currentMed),
      });
      toast.success(isEdit ? 'Medicine updated.' : 'Medicine added to inventory.');
      setShowModal(false);
      fetchInventory();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    }
  };

  const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Drug Inventory 🧪</h2>
          <p className="text-gray-500 text-sm mt-1">Manage medicines, stock, and pricing.</p>
        </div>
        <button onClick={() => openForm()} className="bg-purple-600 text-white font-semibold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors">
          <span>+</span> Add Medicine
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>
        ) : filteredMeds.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No medicines found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Price ($)</th>
                  <th className="px-4 py-3 font-semibold">Expiry Date</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMeds.map(m => (
                  <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {m.name} <span className="text-xs text-gray-400 font-normal block">{m.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.category}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md font-semibold ${m.stock <= m.lowStockThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {m.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">${m.price?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(m.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openForm(m)} className="text-xs text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                      <button disabled={deleting === m._id} onClick={() => handleDelete(m._id)} className="text-xs text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                        {deleting === m._id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{currentMed._id ? 'Edit Medicine' : 'Add Medicine'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required value={currentMed.name} onChange={e => setCurrentMed({ ...currentMed, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input required value={currentMed.category} onChange={e => setCurrentMed({ ...currentMed, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input required value={currentMed.unit} onChange={e => setCurrentMed({ ...currentMed, unit: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. tablet, syrup" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input required type="number" min="0" value={currentMed.stock} onChange={e => setCurrentMed({ ...currentMed, stock: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert at</label>
                  <input required type="number" min="0" value={currentMed.lowStockThreshold} onChange={e => setCurrentMed({ ...currentMed, lowStockThreshold: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" min="0" value={currentMed.price} onChange={e => setCurrentMed({ ...currentMed, price: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input required type="date" value={currentMed.expiryDate} onChange={e => setCurrentMed({ ...currentMed, expiryDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
