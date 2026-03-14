'use client';

import { useState, useEffect } from 'react';

const SPECIALTIES = ['All', 'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'General Medicine', 'Orthopedics', 'Gynecology', 'Psychiatry', 'ENT'];

export default function FindDoctorsPage() {
  const [doctors, setDoctors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [specialty, setSpecialty]   = useState('All');
  const [error, setError]           = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const q = specialty !== 'All' ? `?specialty=${encodeURIComponent(specialty)}` : '';
        const res = await fetch(`/api/doctors${q}`);
        const data = await res.json();
        setDoctors(data.doctors || []);
      } catch {
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [specialty]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Find a Doctor 🔍</h2>
        <p className="text-gray-500 text-sm mt-1">Browse verified doctors and book an appointment.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {SPECIALTIES.map(s => (
          <button
            key={s}
            onClick={() => setSpecialty(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              specialty === s
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🩺</p>
          <p className="text-gray-600 font-medium">No verified doctors found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different specialty or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {doctors.map(doc => (
            <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl">
                  {doc.name?.[4] || 'D'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
                  <p className="text-xs text-teal-600 font-medium">{doc.specialization}</p>
                </div>
              </div>

              {doc.bio && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{doc.bio}</p>}

              <div className="space-y-1 text-xs text-gray-500 mb-4">
                {doc.experience > 0 && <p>🏥 {doc.experience} years experience</p>}
                {doc.location?.city && <p>📍 {doc.location.city}</p>}
                {doc.consultationFee > 0 && <p>💰 Rs. {doc.consultationFee} consultation fee</p>}
                {doc.rating > 0 && <p>⭐ {doc.rating.toFixed(1)} rating</p>}
              </div>

              <div className="flex gap-2">
                <a
                  href={`/dashboard/patient/book-appointment?doctorId=${doc.userId}&doctorName=${encodeURIComponent(doc.name)}&specialty=${encodeURIComponent(doc.specialization)}`}
                  className="flex-1 bg-teal-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors text-center"
                >
                  Book Appointment
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
