import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import AssetLink from '../components/ui/AssetLink';
import { useOperationalRows } from '../hooks/useOperationalRows';

export default function TacticalDashboard() {
  const navigate = useNavigate();
  const { rows, loading, error } = useOperationalRows();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const filtered = rows
    .filter(a => {
      const matchSearch = a.id.toLowerCase().includes(search.toLowerCase()) || (a.location || '').toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === 'All' || a.risk === riskFilter;
      return matchSearch && matchRisk;
    })
    .sort((a, b) => (b.risk === 'EXTREME' ? 4 : b.risk === 'HIGH' ? 3 : b.risk === 'MEDIUM' ? 2 : 1)
      - (a.risk === 'EXTREME' ? 4 : a.risk === 'HIGH' ? 3 : a.risk === 'MEDIUM' ? 2 : 1));

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-orange-500 font-bold text-sm">TACTICAL DASHBOARD</div>
          <div className="text-[11px] text-slate-400">Asset Risk & Action Overview (01_Tactical_Dashboard) — sorted by Risk</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search asset..."
            className="bg-[#0d1f3c] border border-[#1e2d4f] rounded px-3 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-orange-500/50 w-36"
          />
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-[#0d1f3c] border border-[#1e2d4f] rounded px-2 py-1.5 text-[11px] text-slate-300 outline-none focus:border-orange-500/50"
          >
            {['All', 'EXTREME', 'HIGH', 'MEDIUM', 'LOW'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-4 md:p-5">
        {error && (
          <div className="mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-1.5 text-[11px] text-yellow-400">{error}</div>
        )}

        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1200px]">
              <thead className="bg-[#111d35]">
                <tr>
                  {['Asset', 'Health', 'Risk', 'Remaining Life', 'Strategy', 'Action', 'Priority', 'Due Date', 'Status', 'Owner', 'Notes', 'AI Flag', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-3.5 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={13} className="text-center text-slate-500 py-8">Memuat data...</td></tr>
                ) : filtered.map((a, i) => (
                  <tr key={a.id} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0a1628]/30'}`}>
                    <td className="py-2.5 px-3.5"><AssetLink id={a.id} /></td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-200">{a.health}</td>
                    <td className="py-2.5 px-3.5"><Badge value={a.risk} /></td>
                    <td className="py-2.5 px-3.5 text-slate-300">{a.remainingLife.toFixed(1)}</td>
                    <td className="py-2.5 px-3.5 text-slate-300">{a.strategy}</td>
                    <td className="py-2.5 px-3.5 text-slate-400">{a.action}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-200">{a.priority}</td>
                    <td className="py-2.5 px-3.5 text-slate-400">{a.dueDate ? String(a.dueDate).slice(0, 10) : '-'}</td>
                    <td className="py-2.5 px-3.5"><Badge value={a.status} /></td>
                    <td className="py-2.5 px-3.5 text-slate-400">{a.owner}</td>
                    <td className="py-2.5 px-3.5 text-slate-500">{a.notes}</td>
                    <td className="py-2.5 px-3.5"><Badge value={a.aiFlag === 'Review' ? 'HIGH' : 'LOW'} />{' '}<span className="text-slate-400">{a.aiFlag}</span></td>
                    <td className="py-2.5 px-3.5">
                      <button
                        onClick={() => navigate(`/asset/${a.id}`)}
                        className="px-2.5 py-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded text-[10px] transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3.5 py-2.5 border-t border-[#1e2d4f] text-[10px] text-slate-500">
            Showing {filtered.length} of {rows.length} assets
          </div>
        </div>
      </div>
    </div>
  );
}
