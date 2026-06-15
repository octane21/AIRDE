const riskColors = {
  HIGH: 'bg-red-500/20 text-red-400 border border-red-500/30',
  EXTREME: 'bg-red-700/30 text-red-300 border border-red-600/50',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  LOW: 'bg-green-500/20 text-green-400 border border-green-500/30',
  GOOD: 'bg-green-500/20 text-green-400 border border-green-500/30',
  EXCELLENT: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  FAIR: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  POOR: 'bg-red-500/20 text-red-400 border border-red-500/30',
  'On Track': 'bg-green-500/20 text-green-400 border border-green-500/30',
  'Need Action': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  Planned: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'In Progress': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  Completed: 'bg-green-500/20 text-green-400 border border-green-500/30',
};

export default function Badge({ value }) {
  const cls = riskColors[value] || 'bg-slate-700 text-slate-300';
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${cls}`}>
      {value}
    </span>
  );
}
