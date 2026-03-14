export function StatCard({ icon, label, value, sub, trend, colorClass = 'bg-white' }) {
  const isPositive = trend && !trend.startsWith('-');
  return (
    <div className={`${colorClass} rounded-2xl shadow-sm border border-primary-soft p-5 flex flex-col gap-3 hover:shadow-md hover:border-primary transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export function StatsGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
