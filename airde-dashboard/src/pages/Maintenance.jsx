import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, Wrench, Package, Satellite, Target, BarChart3, RefreshCw } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import AssetLink from '../components/ui/AssetLink';
import MaintenanceChart from '../components/charts/MaintenanceChart';
import { nextActions as staticNextActions } from '../data/dashboardData';
import { actionRegister as staticActions } from '../data/assetData';
import { actionsApi } from '../services/api';
import { useFilters } from '../context/FilterContext';
import { useDashboardStats } from '../hooks/useDashboardStats';

const STRATEGY_OPTIONS = ['Preventive', 'Predictive', 'Corrective', 'Replacement', 'Monitoring'];
const STATUS_OPTIONS = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

const STRATEGY_META = {
  Preventive:  { icon: 'shield', color: '#3b82f6' },
  Predictive:  { icon: 'search', color: '#8b5cf6' },
  Corrective:  { icon: 'wrench', color: '#f59e0b' },
  Replacement: { icon: 'package', color: '#ef4444' },
  Monitoring:  { icon: 'satellite', color: '#22c55e' },
};

const STRATEGY_ICONS = { shield: ShieldCheck, search: Search, wrench: Wrench, package: Package, satellite: Satellite };
const NEXT_ACTION_ICONS = { target: Target, search: Search, wrench: Wrench, barChart: BarChart3 };

export default function Maintenance() {
  const { isAssetVisible } = useFilters();
  const { stats } = useDashboardStats();
  const nextActions = stats?.nextActions?.length ? stats.nextActions : staticNextActions;

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setApiError('');
      try {
        const data = await actionsApi.list();
        if (!cancelled) setActions(data);
      } catch (err) {
        if (!cancelled) {
          setApiError(err.message);
          setActions(staticActions.map(a => ({
            id: a.id, strategy: a.strategy, action: a.action,
            priority: a.priority, due_date: a.dueDate,
            status: a.status, risk_level: a.riskLevel,
          })));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const strategyCounts = useMemo(() => {
    const total = actions.length || 1;
    return STRATEGY_OPTIONS.map(label => {
      const count = actions.filter(a => a.strategy === label).length;
      return {
        label,
        count,
        pct: Math.round((count / total) * 100),
        ...STRATEGY_META[label],
      };
    }).filter(s => s.count > 0);
  }, [actions]);

  const filtered = actions.filter(a => {
    const matchSearch = a.id.toLowerCase().includes(search.toLowerCase()) ||
      (a.action || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus && isAssetVisible(a.id);
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">ACTION REGISTER</div>
        <div className="text-[11px] text-slate-400">Rule-based strategy from Risk Level + AHI — read-only (14_Action_Register). Edit raw data via DFT / UT / Visual Inspection / Criticality.</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-4 md:p-5 space-y-5">

        {/* Strategy Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {(strategyCounts.length > 0 ? strategyCounts : STRATEGY_OPTIONS.map(l => ({ label: l, count: 0, pct: 0, ...STRATEGY_META[l] }))).map((m) => {
            const Icon = STRATEGY_ICONS[m.icon] || Package;
            return (
              <div key={m.label} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
                <Icon size={22} className="mb-2" style={{ color: m.color }} strokeWidth={1.75} />
                <div className="text-xl font-bold" style={{ color: m.color }}>{m.count}</div>
                <div className="text-[11px] text-slate-300">{m.label}</div>
                <div className="text-[10px] text-slate-500 mt-1">{m.pct}% of total</div>
                <div className="mt-2.5">
                  <div className="w-full bg-[#1e2d4f] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
            <SectionHeader title="Strategy Distribution" />
            <MaintenanceChart />
          </div>
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
            <SectionHeader title="Recommended Next Actions" />
            <div className="space-y-2.5 mt-2.5">
              {nextActions.map((a, i) => {
                const Icon = NEXT_ACTION_ICONS[a.icon] || Target;
                return (
                  <div key={i} className="flex gap-3 p-3 bg-[#111d35] rounded-md border border-[#1e2d4f] hover:border-orange-500/30 transition-colors">
                    <Icon size={18} className="text-orange-400 flex-shrink-0" strokeWidth={1.75} />
                    <div className="text-xs text-slate-300">{a.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Register Table */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="px-3 pt-3 flex items-center justify-between flex-wrap gap-2">
            <SectionHeader title="Action Register" subtitle="Semua rekomendasi action" />
            <div className="flex gap-2 pb-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari ID / action..."
                className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-orange-500/50 w-36"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-orange-500/50"
              >
                {['All', ...STATUS_OPTIONS].map(s => <option key={s} value={s}>{s}</option>)}
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
            <div className="text-center text-slate-500 text-sm py-8">Memuat action plan...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[700px]">
                <thead className="bg-[#111d35]">
                  <tr>
                    {['Asset ID', 'Strategy', 'Recommended Action', 'Priority', 'Due Date', 'Status', 'Risk Level'].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id + i} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 !== 0 ? 'bg-[#0a1628]/30' : ''}`}>
                      <td className="py-2 px-3"><AssetLink id={a.id} /></td>
                      <td className="py-2 px-3 text-slate-300">{a.strategy}</td>
                      <td className="py-2 px-3 text-slate-400 max-w-[200px] truncate">{a.action}</td>
                      <td className="py-2 px-3 font-bold text-slate-200">{a.priority}</td>
                      <td className="py-2 px-3 text-slate-400">{a.due_date ? String(a.due_date).slice(0, 10) : '-'}</td>
                      <td className="py-2 px-3"><Badge value={a.status} /></td>
                      <td className="py-2 px-3"><Badge value={a.risk_level} /></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-slate-600 py-6">
                        Tidak ada action plan
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
