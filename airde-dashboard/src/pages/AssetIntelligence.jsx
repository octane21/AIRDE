import { useState, useEffect } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import AssetLink from '../components/ui/AssetLink';
import { risksApi } from '../services/api';
import { useFilters } from '../context/FilterContext';

export default function AssetIntelligence() {
  const { isAssetVisible } = useFilters();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    risksApi.list()
      .then(data => { if (!cancelled) setRows(data); })
      .catch(err => { if (!cancelled) setApiError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = rows.filter(r => (!search || r.id.toLowerCase().includes(search.toLowerCase())) && isAssetVisible(r.id));

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">ASSET INTELLIGENCE</div>
        <div className="text-[11px] text-slate-400">Computed health engine output — read-only (11_Asset_Intelligence). Edit raw data via DFT / UT / Visual Inspection.</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="px-3 pt-3 flex items-center justify-between flex-wrap gap-2">
            <SectionHeader title="Asset Intelligence" subtitle="Coating Health, Thickness Health, Corrosion Rate, Remaining Life, Visual Score → AHI" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari Asset ID..."
              className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1 mb-2 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-orange-500/50 w-40"
            />
          </div>

          {apiError && (
            <div className="mx-3 mb-2 bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-1.5 text-[11px] text-yellow-400">{apiError}</div>
          )}

          {loading ? (
            <div className="text-center text-slate-500 text-sm py-8">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[900px]">
                <thead className="bg-[#111d35]">
                  <tr>
                    {['Asset ID', 'Coating Health %', 'Thickness Health %', 'Corrosion Rate', 'Tmin', 'Remaining Life (y)', 'Visual Score', 'AHI', 'Condition'].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 !== 0 ? 'bg-[#0a1628]/30' : ''}`}>
                      <td className="py-2 px-3"><AssetLink id={r.id} /></td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.coating_health).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.thickness_health).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.corrosion_rate).toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.tmin).toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.remaining_life).toFixed(1)}</td>
                      <td className="py-2 px-3 text-slate-300">{r.visual_score != null ? Number(r.visual_score).toFixed(0) : '-'}</td>
                      <td className="py-2 px-3 font-bold text-slate-200">{r.ahi}</td>
                      <td className="py-2 px-3"><Badge value={r.condition} /></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="text-center text-slate-600 py-6">Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
