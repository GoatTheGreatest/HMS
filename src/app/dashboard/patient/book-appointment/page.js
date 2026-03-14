'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM',
];

function BookAppointmentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialDoctorId   = searchParams.get('doctorId') || '';
  const initialDoctorName = searchParams.get('doctorName') || '';
  const initialSpecialty  = searchParams.get('specialty') || '';

  const [doctors, setDoctors]   = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(!initialDoctorId);
  const [form, setForm] = useState({
    doctorId: initialDoctorId,
    doctorName: initialDoctorName,
    specialty: initialSpecialty,
    date: '',
    timeSlot: '',
    type: 'PHYSICAL',
    chiefComplaint: '',
    priority: 'NORMAL',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!initialDoctorId) {
      fetch('/api/doctors').then(r => r.json()).then(d => {
        setDoctors(d.doctors || []);
        setLoadingDocs(false);
      });
    }
  }, [initialDoctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.date || !form.timeSlot) {
      setError('Please select a doctor, date, and time slot.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: form.doctorId,
          date: new Date(form.date).toISOString(),
          timeSlot: form.timeSlot,
          type: form.type,
          chiefComplaint: form.chiefComplaint,
          priority: form.priority,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Booking failed');
      }
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/patient'), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Appointment Booked!</h3>
      <p className="text-gray-500 text-sm">Redirecting to your dashboard…</p>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Book an Appointment 📅</h2>
        <p className="text-gray-500 text-sm mt-1">Schedule a visit with a verified doctor.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}

        {/* Doctor selection */}
        {initialDoctorId ? (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
            <p className="text-sm font-semibold text-teal-800">{form.doctorName}</p>
            <p className="text-xs text-teal-600">{form.specialty}</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Doctor</label>
            {loadingDocs ? <p className="text-sm text-gray-400">Loading doctors…</p> : (
              <select
                required
                value={form.doctorId}
                onChange={e => setForm({ ...form, doctorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">— Select a Doctor —</option>
                {doctors.map(d => (
                  <option key={d._id} value={d.userId}>{d.name} ({d.specialization})</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date</label>
          <input
            type="date"
            required
            min={today}
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Time Slot */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TIME_SLOTS.map(slot => (
              <button
                type="button"
                key={slot}
                onClick={() => setForm({ ...form, timeSlot: slot })}
                className={`text-xs px-2 py-1.5 rounded-lg border font-medium transition-colors ${
                  form.timeSlot === slot
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Appointment Type</label>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
          >
            <option value="PHYSICAL">In-Person Visit</option>
            <option value="VIRTUAL">Virtual / Online</option>
            <option value="HOME_VISIT">Home Visit</option>
          </select>
        </div>

        {/* Chief Complaint */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Visit</label>
          <textarea
            rows={3}
            value={form.chiefComplaint}
            onChange={e => setForm({ ...form, chiefComplaint: e.target.value })}
            placeholder="Briefly describe your symptoms or reason…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 resize-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={e => setForm({ ...form, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
          >
            <option value="LOW">Low — not urgent</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High — urgent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-teal-600 text-white font-semibold py-2.5 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Booking…' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" /></div>}>
      <BookAppointmentInner />
    </Suspense>
  );
}
