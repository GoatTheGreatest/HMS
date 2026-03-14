'use client';
import { SimpleBarChart, SimpleLineChart } from '@/components/Charts';

const consumptionData = [
  { name: 'Sep', units: 820 }, { name: 'Oct', units: 940 }, { name: 'Nov', units: 870 },
  { name: 'Dec', units: 650 }, { name: 'Jan', units: 1100 }, { name: 'Feb', units: 1200 },
  { name: 'Mar', units: 780 },
];

const categoryStock = [
  { name: 'Antibiotics', stock: 340 }, { name: 'Analgesics', stock: 520 },
  { name: 'Antidiabetics', stock: 180 }, { name: 'Vitamins', stock: 610 },
  { name: 'Cardiovascular', stock: 290 },
];

export default function PharmaAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics 📊</h2>
        <p className="text-gray-500 text-sm mt-1">Supply chain insights and consumption trends.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Avg Monthly Consumption', value: '908 units', icon: '📈' },
          { label: 'Order Fulfillment Rate', value: '97%', icon: '✅' },
          { label: 'Medicines Running Low', value: '4 items', icon: '⚠️' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart title="Units Consumed Per Month" data={consumptionData} lines={[{ key: 'units', color: '#8b5cf6' }]} />
        <SimpleBarChart title="Current Stock by Category" data={categoryStock} bars={[{ key: 'stock', color: '#a78bfa' }]} />
      </div>
    </div>
  );
}
