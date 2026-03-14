'use client';

import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useToast } from '@/components/Toast';

export default function DoctorPatientsPage() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments?status=COMPLETED');
      const data = await res.json();
      const seen = new Set();
      const unique = (data.appointments || []).filter(a => {
        if (seen.has(a.patientId)) return false;
        seen.add(a.patientId);
        return true;
      });
      setAppointments(unique);
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { 
    fetchData(); 

    // Socket.IO real-time updates
    const socket = io('http://localhost:3001');
    socket.on('patientStatusUpdated', (payload) => {
      if (payload && payload.patientId && payload.admissionStatus) {
        setAppointments(prev => prev.map(appt => 
          appt.patientId === payload.patientId 
            ? { ...appt, admissionStatus: payload.admissionStatus } 
            : appt
        ));
      }
    });

    return () => socket.disconnect();
  }, [fetchData]);

  const updateStatus = async (patientId, status) => {
    try {
      const res = await fetch(`/api/patients/${patientId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionStatus: status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Patient marked as ${status.toLowerCase()}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Patients 👥</h2>
        <p className="text-gray-500 text-sm mt-1">Patients you have treated ({appointments.length} total).</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-500">No completed appointments yet. Treated patients will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {appointments.map(appt => (
            <div key={appt.patientId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {appt.patientName?.[0] || 'P'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{appt.patientName}</p>
                    <p className="text-xs text-gray-400">Last visit: {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-xs px-2 py-1 bg-gray-100 rounded-full font-semibold text-gray-600">
                    {appt.admissionStatus || 'NORMAL'}
                  </div>
                </div>
                {appt.diagnosis && (
                  <p className="text-xs text-gray-500"><span className="font-medium">Diagnosis:</span> {appt.diagnosis}</p>
                )}
                {appt.prescription && (
                  <p className="text-xs text-gray-500 mt-1"><span className="font-medium">Prescription:</span> {appt.prescription}</p>
                )}
              </div>
              
              <div className="mt-4 flex gap-2 pt-4 border-t border-gray-50">
                {(appt.admissionStatus === 'NORMAL' || !appt.admissionStatus) && (
                  <button onClick={() => updateStatus(appt.patientId, 'ADMITTED')} className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                    Admit
                  </button>
                )}
                {appt.admissionStatus === 'ADMITTED' && (
                  <button onClick={() => updateStatus(appt.patientId, 'DISCHARGED')} className="flex-1 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg hover:bg-orange-100 transition-colors">
                    Discharge
                  </button>
                )}
                {appt.admissionStatus !== 'TREATED' && (
                  <button onClick={() => updateStatus(appt.patientId, 'TREATED')} className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition-colors">
                    Mark Treated
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
