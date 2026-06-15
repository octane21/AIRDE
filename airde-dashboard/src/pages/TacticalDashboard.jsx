import { useState } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import { riskAssets } from '../data/assetData';
import { actionRegister } from '../data/assetData';

export default function TacticalDashboard() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const filtered = riskAssets.filter(a => {
    const matchSearch = a.id.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'All' || a.riskLevel === riskFilter;
    return matchSearch && matchRisk;
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-orange-500 font-bold text-sm">01 TACTICAL DASHBOARD</div>
          <div className="text-[11px] text-slate-400">Asset Risk & Action Overview</div>
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
            {['All', 'HIGH', 'MEDIUM', 'LOW'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4">
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[800px]">
              <thead className="bg-[#111d35]">
                <tr>
                  {['Asset ID', 'Location', 'AHI', 'Condition', 'Corr. Rate', 'Rem. Life (yr)', 'PoF', 'CoF', 'Risk Score', 'Risk Level'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0a1628]/30'}`}>
                    <td className="py-2 px-3 font-medium text-orange-400">{a.id}</td>
                    <td className="py-2 px-3 text-slate-400">{a.location}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-[#1e2d4f] rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${a.ahi}%`, backgroundColor: a.ahi >= 90 ? '#22c55e' : a.ahi >= 75 ? '#84cc16' : a.ahi >= 60 ? '#eab308' : '#ef4444' }} />
                        </div>
                        <span className="font-bold text-slate-200">{a.ahi}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3"><Badge value={a.condition} /></td>
                    <td className="py-2 px-3 text-slate-300">{a.corrosionRate.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-300">{a.remainingLife.toFixed(1)}</td>
                    <td className="py-2 px-3 text-slate-300">{a.pof.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-300">{a.cof.toFixed(0)}</td>
                    <td className="py-2 px-3 font-bold text-slate-200">{a.riskScore.toFixed(2)}</td>
                    <td className="py-2 px-3"><Badge value={a.riskLevel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-[#1e2d4f] text-[10px] text-slate-500">
            Showing {filtered.length} of {riskAssets.length} assets
          </div>
        </div>

        {/* Action Register section */}
        <div className="mt-4 bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[#1e2d4f]">
            <SectionHeader title="Action Register" subtitle="Recommended maintenance actions" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[700px]">
              <thead className="bg-[#111d35]">
                <tr>
                  {['Asset ID', 'Strategy', 'Recommended Action', 'Priority', 'Due Date', 'Status', 'Risk Level'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {actionRegister.map((a, i) => (
                  <tr key={a.id + i} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0a1628]/30'}`}>
                    <td className="py-2 px-3 font-medium text-orange-400">{a.id}</td>
                    <td className="py-2 px-3 text-slate-300">{a.strategy}</td>
                    <td className="py-2 px-3 text-slate-400">{a.action}</td>
                    <td className="py-2 px-3 font-bold text-slate-200">{a.priority}</td>
                    <td className="py-2 px-3 text-slate-400">{a.dueDate}</td>
                    <td className="py-2 px-3"><Badge value={a.status} /></td>
                    <td className="py-2 px-3"><Badge value={a.riskLevel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
