export default function KPICard({ icon: Icon, title, value, label, change, trend, sub, color = 'text-green-400', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4 flex flex-col gap-1.5 hover:border-orange-500/30 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        {Icon && <Icon size={18} className={color} strokeWidth={1.75} />}
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className={`text-2xl md:text-3xl font-bold ${color} leading-none mt-1.5`}>{value}</div>
      {label && <div className={`text-xs font-semibold ${color}`}>{label}</div>}
      {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
      {change && (
        <div className={`text-[10px] flex items-center gap-1 mt-1.5 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          <span>{trend === 'up' ? '↑' : '↓'}</span>
          <span>vs Last Month {change}</span>
        </div>
      )}
    </div>
  );
}
