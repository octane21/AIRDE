export default function KPICard({ icon, title, value, label, change, trend, sub, color = 'text-green-400' }) {
  return (
    <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3 md:p-4 flex flex-col gap-1 hover:border-orange-500/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className={`text-2xl md:text-3xl font-bold ${color} leading-none mt-1`}>{value}</div>
      {label && <div className={`text-xs font-semibold ${color}`}>{label}</div>}
      {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
      {change && (
        <div className={`text-[10px] flex items-center gap-1 mt-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          <span>{trend === 'up' ? '↑' : '↓'}</span>
          <span>vs Last Month {change}</span>
        </div>
      )}
    </div>
  );
}
