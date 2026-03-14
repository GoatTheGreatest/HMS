'use client';
import { SimpleBarChart, SimpleLineChart } from '@/components/Charts';

const monthlyData = [
  { name: 'Sep', consultations: 42, newPatients: 15 },
  { name: 'Oct', consultations: 58, newPatients: 20 },
  { name: 'Nov', consultations: 51, newPatients: 18 },
  { name: 'Dec', consultations: 34, newPatients: 10 },
  { name: 'Jan', consultations: 61, newPatients: 25 },
  { name: 'Feb', consultations: 73, newPatients: 30 },
  { name: 'Mar', consultations: 45, newPatients: 18 },
];

const ratingData = [
  { name: 'Excellent', value: 68 },
  { name: 'Good', value: 21 },
  { name: 'Average', value: 8 },
  { name: 'Poor', value: 3 },
];

export default function DoctorAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics 📊</h2>
        <p className="text-gray-500 text-sm mt-1">Your clinical performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Avg Consultations/Month', value: '52', icon: '📅' },
          { label: 'Patient Satisfaction', value: '94%', icon: '⭐' },
          { label: 'Follow-up Rate', value: '68%', icon: '🔄' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Monthly Consultations vs New Patients"
          data={monthlyData}
          bars={[{ key: 'consultations', color: '#3b82f6' }, { key: 'newPatients', color: '#10b981' }]}
        />
        <SimpleLineChart
          title="Consultation Trend"
          data={monthlyData}
          lines={[{ key: 'consultations', color: '#3b82f6' }]}
        />
      </div>
    </div>
  );
}
