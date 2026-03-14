'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/apiClient';

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [appointments, setAppointments]   = useState([]);
  const [form, setForm]                   = useState({ patientId: '', diagnosis: '', notes: '', medicines: [{ name: '', dosage: '', duration: '' }] });
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');
  const toast = useToast();

  const fetchAll = useCallback(async () => {
    try {
      const [pData, aData] = await Promise.all([
        apiFetch('/api/prescriptions'),
        apiFetch('/api/appointments?status=COMPLETED'),
      ]);
      setPrescriptions(pData.prescriptions || []);
      // Unique patients from completed appointments
      const seen = new Set();
      const unique = (aData.appointments || []).filter(a => {
        if (seen.has(a.patientId)) return false;
        seen.add(a.patientId);
        return true;
      });
      setAppointments(unique);
    } catch (e) {
      toast.error(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addMedicineRow = () => setForm(f => ({ ...f, medicines: [...f.medicines, { name: '', dosage: '', duration: '' }] }));
  const updateMed = (i, field, val) => setForm(f => {
    const meds = [...f.medicines];
    meds[i] = { ...meds[i], [field]: val };
    return { ...f, medicines: meds };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.diagnosis) { setError('Patient and diagnosis required'); return; }
    setSubmitting(true); setError('');
    try {
      await apiFetch('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      toast.success('Prescription saved successfully.');
      setShowForm(false);
      setForm({ patientId: '', diagnosis: '', notes: '', medicines: [{ name: '', dosage: '', duration: '' }] });
      fetchAll();
    } catch (e) {
      setError(e.message || 'Failed to save prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prescriptions 💊</h2>
          <p className="text-gray-500 text-sm mt-1">Write and manage patient prescriptions.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
          {showForm ? 'Cancel' : '+ New Prescription'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">New Prescription</h3>
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Patient</label>
            <select required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800">
              <option value="">— Select Patient —</option>
              {appointments.map(a => <option key={a.patientId} value={a.patientId}>{a.patientName}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis</label>
            <input required value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800" placeholder="e.g. Hypertension" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Medicines</label>
              <button type="button" onClick={addMedicineRow} className="text-xs text-blue-600 font-semibold hover:underline">+ Add</button>
            </div>
            {form.medicines.map((m, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                <input value={m.name} onChange={e => updateMed(i, 'name', e.target.value)} placeholder="Medicine name" className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800" />
                <input value={m.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="Dosage" className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800" />
                <input value={m.duration} onChange={e => updateMed(i, 'duration', e.target.value)} placeholder="Duration" className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 resize-none" placeholder="Additional instructions…" />
          </div>

          <button type="submit" disabled={submitting} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
            {submitting ? 'Saving…' : 'Save Prescription'}
          </button>
        </form>
      )}

      {prescriptions.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">No prescriptions written yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{p.patientName}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">Prescription</span>
              </div>
              <p className="text-sm text-gray-700 font-medium mb-2">Diagnosis: <span className="font-normal">{p.diagnosis}</span></p>
              {p.medicines?.length > 0 && (
                <div className="space-y-1">
                  {p.medicines.map((m, i) => (
                    <p key={i} className="text-xs text-gray-500">💊 {m.name} — {m.dosage} for {m.duration}</p>
                  ))}
                </div>
              )}
              {p.notes && <p className="text-xs text-gray-400 mt-2 italic">{p.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
