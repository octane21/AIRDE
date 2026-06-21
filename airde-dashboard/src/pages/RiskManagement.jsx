import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import AssetLink from '../components/ui/AssetLink';
import RiskMatrix from '../components/charts/RiskMatrix';
import TrendChart from '../components/charts/TrendChart';
import { riskAssets } from '../data/assetData';
import { kpiTable as staticKpiTable } from '../data/dashboardData';
import { risksApi, statsApi } from '../services/api';
import { useFilters } from '../context/FilterContext';

function pofBucket(pof) {
  return Math.min(5, Math.max(1, Math.ceil(Number(pof) * 5)));
}

function ahiColor(v) {
  if (v >= 90) return '#22c55e';
  if (v >= 75) return '#84cc16';
  if (v >= 60) return '#eab308';
  return '#ef4444';
}

export default function RiskManagement() {
  const { isAssetVisible } = useFilters();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pofParam = searchParams.get('pof');
  const cofParam = searchParams.get('cof');
  const sortParam = searchParams.get('sort');

  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const [refreshKey, setRefreshKey] = useState(0);
  const [kpiTable, setKpiTable] = useState(staticKpiTable);
  const [trendChart, setTrendChart] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setApiError('');
      try {
        const data = await risksApi.list();
        if (!cancelled) setRisks(data);
      } catch (err) {
        if (!cancelled) {
          setApiError(err.message);
          setRisks(riskAssets.map(a => ({
            id: a.id, ahi: a.ahi, condition: a.condition,
            coating_health: a.coatingHealth, thickness_health: a.thicknessHealth,
            corrosion_rate: a.corrosionRate, tmin: a.tmin,
            remaining_life: a.remainingLife, pof: a.pof, cof: a.cof,
            risk_score: a.riskScore, risk_level: a.riskLevel,
          })));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    statsApi.kpi().then(data => { if (!cancelled) setKpiTable(data); }).catch(() => {});
    statsApi.trend().then(data => {
      if (cancelled || !data.length) return;
      setTrendChart(data.map(t => ({
        month: new Date(t.snapshot_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
        ahi: Number(t.avg_ahi), corrosionRate: Number(t.avg_corrosion_rate), highExtremeCount: t.high_extreme_count,
      })));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [refreshKey]);

  const riskMatrixCells = {};
  for (const r of risks) {
    const key = `${pofBucket(r.pof)}-${Number(r.cof)}`;
    riskMatrixCells[key] = (riskMatrixCells[key] || 0) + 1;
  }

  const sorted = [...risks].sort((a, b) =>
    sortParam === 'remaining_life'
      ? Number(a.remaining_life) - Number(b.remaining_life)
      : b.risk_score - a.risk_score
  );
  const filtered = sorted.filter(r => {
    const matchSearch = r.id.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'All' || r.risk_level === levelFilter;
    const matchCell = (!pofParam || pofBucket(r.pof) === Number(pofParam)) && (!cofParam || Number(r.cof) === Number(cofParam));
    return matchSearch && matchLevel && matchCell && isAssetVisible(r.id);
  });

  const counts = {
    HIGH: risks.filter(r => r.risk_level === 'HIGH' || r.risk_level === 'EXTREME').length,
    MEDIUM: risks.filter(r => r.risk_level === 'MEDIUM').length,
    LOW: risks.filter(r => r.risk_level === 'LOW').length,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">RISK MANAGEMENT</div>
        <div className="text-[11px] text-slate-400">Computed by the calculation engine from AHI + Criticality — read-only (13_Risk_Intelligence). Edit raw data via DFT / UT / Visual Inspection / Criticality.</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">

        {/* Risk summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'HIGH/EXTREME Risk', count: counts.HIGH, color: 'text-red-400', bg: 'border-red-500/30' },
            { label: 'MEDIUM Risk', count: counts.MEDIUM, color: 'text-yellow-400', bg: 'border-yellow-500/30' },
            { label: 'LOW Risk', count: counts.LOW, color: 'text-green-400', bg: 'border-green-500/30' },
            { label: 'Total Assessed', count: risks.length, color: 'text-slate-200', bg: 'border-[#1e2d4f]' },
          ].map(s => (
            <div key={s.label} className={`bg-[#0d1f3c] border rounded-lg p-3 ${s.bg}`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
            <SectionHeader title="Risk Matrix (PoF vs CoF)" subtitle="Klik sel untuk filter Risk Register" />
            <RiskMatrix
              cellCounts={risks.length ? riskMatrixCells : undefined}
              onCellClick={(pof, cof) => navigate(`/risk?pof=${pof}&cof=${cof}`)}
            />
          </div>
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
            <SectionHeader title="KPI Performance" />
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#1e2d4f]">
                  {['KPI', 'Actual', 'Target', 'Status'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-slate-500 font-medium text-[10px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kpiTable.map((k, i) => (
                  <tr key={i} className="border-b border-[#1e2d4f]/50 hover:bg-[#162040]">
                    <td className="py-2 px-2 text-slate-300">{k.kpi}</td>
                    <td className="py-2 px-2 font-bold text-slate-200">{k.actual}</td>
                    <td className="py-2 px-2 text-slate-500">{k.target}</td>
                    <td className="py-2 px-2"><Badge value={k.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: 'ahi', title: 'AHI Trend' },
            { type: 'corrosion', title: 'Corrosion Rate Trend' },
            { type: 'risk', title: 'High/Extreme Risk Count' },
          ].map(t => (
            <div key={t.type} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title={t.title} />
              <TrendChart type={t.type} data={trendChart} />
            </div>
          ))}
        </div>

        {/* Risk Register Table */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="px-3 pt-3 flex items-center justify-between flex-wrap gap-2">
            <SectionHeader title="Risk Register" subtitle={sortParam === 'remaining_life' ? 'Sorted by Remaining Life ascending' : 'Sorted by Risk Score descending'} />
            <div className="flex gap-2 pb-2">
              {(pofParam || cofParam) && (
                <button
                  onClick={() => navigate('/risk')}
                  className="px-2 py-1 text-[11px] text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded"
                >
                  Cell PoF:{pofParam} CoF:{cofParam} ✕
                </button>
              )}
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari Asset ID..."
                className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-orange-500/50 w-32"
              />
              <select
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
                className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-orange-500/50"
              >
                {['All', 'LOW', 'MEDIUM', 'HIGH', 'EXTREME'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                className="flex items-center px-2 py-1 text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {apiError && (
            <div className="mx-3 mb-2 bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-1.5 text-[11px] text-yellow-400">
              Backend tidak terhubung — menampilkan data statis
            </div>
          )}

          {loading ? (
            <div className="text-center text-slate-500 text-sm py-8">Memuat data risiko...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[900px]">
                <thead className="bg-[#111d35]">
                  <tr>
                    {[
                      'Asset ID', 'Location', 'AHI', 'Condition', 'Coating Health', 'Thickness Health',
                      'Corr. Rate', 'Tmin', 'Rem. Life (yr)', 'PoF', 'CoF', 'Risk Score', 'Risk Level',
                    ].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 !== 0 ? 'bg-[#0a1628]/30' : ''}`}>
                      <td className="py-2 px-3"><AssetLink id={r.id} /></td>
                      <td className="py-2 px-3 text-slate-400">{r.location || '-'}</td>
                      <td className="py-2 px-3 font-bold" style={{ color: ahiColor(r.ahi) }}>{r.ahi}</td>
                      <td className="py-2 px-3 text-slate-300">{r.condition}</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.coating_health).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.thickness_health).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.corrosion_rate).toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.tmin).toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.remaining_life).toFixed(1)}</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.pof).toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-300">{Number(r.cof).toFixed(0)}</td>
                      <td className="py-2 px-3 font-bold" style={{ color: r.risk_score >= 2 ? '#ef4444' : r.risk_score >= 0.7 ? '#eab308' : '#22c55e' }}>
                        {Number(r.risk_score).toFixed(2)}
                      </td>
                      <td className="py-2 px-3"><Badge value={r.risk_level} /></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={13} className="text-center text-slate-600 py-6">
                        Tidak ada data risiko
                      </td>
                    </tr>
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
