import { useState, useEffect } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import { statsApi } from '../services/api';

export default function KPI() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let cancelled = false;
    statsApi.kpi()
      .then(data => { if (!cancelled) setRows(data); })
      .catch(err => { if (!cancelled) setApiError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">KPI</div>
        <div className="text-[11px] text-slate-400">Key Performance Indicators vs Target (15_KPI)</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">
        {apiError && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-1.5 text-[11px] text-yellow-400">{apiError}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rows.map(k => (
            <div key={k.kpi} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{k.kpi}</div>
              <div className="text-2xl font-bold text-slate-200">{k.actual}</div>
              <div className="text-[10px] text-slate-500 mt-1">Target: {k.target}</div>
              <div className="mt-2"><Badge value={k.status} /></div>
            </div>
          ))}
        </div>

        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
          <SectionHeader title="KPI Performance Tracker" />
          {loading ? (
            <div className="text-center text-slate-500 text-sm py-6">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[400px]">
                <thead>
                  <tr className="border-b border-[#1e2d4f]">
                    {['KPI', 'Actual', 'Target', 'Status'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium text-[10px] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((k, i) => (
                    <tr key={i} className="border-b border-[#1e2d4f]/50 hover:bg-[#162040]">
                      <td className="py-2.5 px-3 text-slate-300">{k.kpi}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-200 text-lg">{k.actual}</td>
                      <td className="py-2.5 px-3 text-slate-500">{k.target}</td>
                      <td className="py-2.5 px-3"><Badge value={k.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
