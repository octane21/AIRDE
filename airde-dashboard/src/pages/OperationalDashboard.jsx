import { useMemo } from 'react';
import Badge from '../components/ui/Badge';
import AssetLink from '../components/ui/AssetLink';
import SectionHeader from '../components/ui/SectionHeader';
import { useOperationalRows } from '../hooks/useOperationalRows';

export default function OperationalDashboard() {
  const { rows, loading, error } = useOperationalRows();

  const byLocation = useMemo(() => {
    const groups = {};
    for (const r of rows) {
      const loc = r.location || 'Unknown';
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(r);
    }
    return groups;
  }, [rows]);

  const sortedByDueDate = useMemo(() => {
    return [...rows]
      .filter(r => r.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 15);
  }, [rows]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">OPERATIONAL DASHBOARD</div>
        <div className="text-[11px] text-slate-400">Day-to-day execution view by Location & due date (02_Operational_Dashboard)</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-4 md:p-5 space-y-5">
        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-1.5 text-[11px] text-yellow-400">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 text-sm py-8">Memuat data...</div>
        ) : (
          <>
            {/* Rollup by location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(byLocation).map(([loc, items]) => {
                const highExtreme = items.filter(i => i.risk === 'HIGH' || i.risk === 'EXTREME').length;
                const avgHealth = items.reduce((s, i) => s + Number(i.health || 0), 0) / (items.length || 1);
                return (
                  <div key={loc} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
                    <div className="text-xs font-bold text-slate-200 mb-3">{loc}</div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Total Assets</span>
                      <span className="text-slate-200 font-bold">{items.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-1.5">
                      <span className="text-slate-500">Avg Health (AHI)</span>
                      <span className="text-green-400 font-bold">{avgHealth.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-1.5">
                      <span className="text-slate-500">High/Extreme Risk</span>
                      <span className={`font-bold ${highExtreme ? 'text-red-400' : 'text-slate-400'}`}>{highExtreme}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upcoming due dates — operational execution queue */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
              <div className="px-3.5 pt-3.5">
                <SectionHeader title="Upcoming Actions" subtitle="Sorted by nearest Due Date — operational execution queue" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[1000px]">
                  <thead className="bg-[#111d35]">
                    <tr>
                      {['Asset', 'Location', 'Due Date', 'Priority', 'Strategy', 'Action', 'Status', 'Owner', 'AI Flag'].map(h => (
                        <th key={h} className="text-left py-3 px-3.5 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedByDueDate.map((a, i) => (
                      <tr key={a.id} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0a1628]/30'}`}>
                        <td className="py-2.5 px-3.5"><AssetLink id={a.id} /></td>
                        <td className="py-2.5 px-3.5 text-slate-400">{a.location}</td>
                        <td className="py-2.5 px-3.5 text-slate-300">{String(a.dueDate).slice(0, 10)}</td>
                        <td className="py-2.5 px-3.5 font-bold text-slate-200">{a.priority}</td>
                        <td className="py-2.5 px-3.5 text-slate-300">{a.strategy}</td>
                        <td className="py-2.5 px-3.5 text-slate-400">{a.action}</td>
                        <td className="py-2.5 px-3.5"><Badge value={a.status} /></td>
                        <td className="py-2.5 px-3.5 text-slate-400">{a.owner}</td>
                        <td className="py-2.5 px-3.5 text-slate-400">{a.aiFlag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
