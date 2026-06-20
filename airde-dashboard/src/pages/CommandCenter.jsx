import { useNavigate } from 'react-router-dom';
import KPICard from '../components/ui/KPICard';
import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import AssetLink from '../components/ui/AssetLink';
import QuickFilters from '../components/layout/QuickFilters';
import HealthDistributionChart from '../components/charts/HealthDistributionChart';
import RiskMatrix from '../components/charts/RiskMatrix';
import TrendChart from '../components/charts/TrendChart';
import MaintenanceChart from '../components/charts/MaintenanceChart';
import AIChat from '../components/ai/AIChat';
import { useDashboardStats } from '../hooks/useDashboardStats';
import {
  kpiData, top5Critical as staticTop5, maintenanceStrategy as staticStrategy, inspectionStatus,
  alerts, keyTakeaways, nextActions, trendData,
} from '../data/dashboardData';

const alertColor = { red: 'bg-red-500', orange: 'bg-orange-400', blue: 'bg-blue-400' };

export default function CommandCenter() {
  const { stats, error } = useDashboardStats();
  const navigate = useNavigate();
  const kpi = stats?.kpi || kpiData;
  const top5Critical = stats?.top5Critical?.length ? stats.top5Critical : staticTop5;
  const maintenanceStrategy = stats?.maintenanceStrategy?.length ? stats.maintenanceStrategy : staticStrategy;
  const inspectedPct = stats?.inspectionStatus?.inspectedPct ?? inspectionStatus.inspected.pct;
  const trendChart = stats?.trendChart?.length ? stats.trendChart : trendData;
  const totalActions = maintenanceStrategy.reduce((s, m) => s + m.count, 0);
  const liveAlerts = stats?.alerts?.length ? stats.alerts : alerts;
  const liveKeyTakeaways = stats?.keyTakeaways?.length ? stats.keyTakeaways : keyTakeaways;
  const liveNextActions = stats?.nextActions?.length ? stats.nextActions : nextActions;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Title */}
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">COMMAND CENTER</div>
        <div className="text-[11px] text-slate-400 mt-0.5">EXECUTIVE DASHBOARD</div>
        <div className="text-[10px] text-slate-500 hidden sm:block">AI-POWERED PIPELINE INTEGRITY MANAGEMENT FOR SAFE, RELIABLE & SUSTAINABLE OPERATIONS</div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-3 md:p-4 space-y-4">

          {error && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-1.5 text-[11px] text-yellow-400">
              Backend tidak terhubung — menampilkan data statis ({error})
            </div>
          )}

          <QuickFilters />

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KPICard icon="🛡" title="Asset Health Index (AHI)" value={kpi.ahi.value} label={kpi.ahi.label} trend="up" color="text-green-400" onClick={() => navigate('/risk')} />
            <KPICard icon="⚠" title="Risk Score (0-5)" value={kpi.riskScore.value} label={kpi.riskScore.label} trend="up" color="text-green-400" onClick={() => navigate('/risk')} />
            <KPICard icon="⌛" title="Remaining Life (AVG)" value={kpi.remainingLife.value} label={kpi.remainingLife.label} trend="up" color="text-blue-400" onClick={() => navigate('/risk?sort=remaining_life')} />
            <KPICard icon="◔" title="Inspection Coverage" value={kpi.inspectionCoverage.value} trend="up" color="text-yellow-400" onClick={() => navigate('/inspection?status=Pending')} />
            <KPICard icon="▣" title="Total Assets" value={kpi.totalAssets.value} label={kpi.totalAssets.label} sub={kpi.totalAssets.sub} color="text-slate-200" onClick={() => navigate('/asset')} />
          </div>

          {/* Middle Row: Charts + AI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* Asset Health Distribution */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="Asset Health Distribution" />
              <HealthDistributionChart data={stats?.healthDistribution} />
            </div>

            {/* Risk Matrix */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="Risk Matrix (PoF vs CoF)" subtitle="Klik sel untuk drill-down" />
              <RiskMatrix cellCounts={stats?.riskMatrixCells} onCellClick={(pof, cof) => navigate(`/risk?pof=${pof}&cof=${cof}`)} />
            </div>

            {/* Top 5 Critical Assets */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="Top 5 Critical Assets" />
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-[#1e2d4f]">
                      {['#', 'Asset ID', 'Location', 'Risk', 'AHI'].map(h => (
                        <th key={h} className="text-left py-1 px-1 text-slate-500 font-medium text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {top5Critical.map((asset) => (
                      <tr key={asset.rank} className="border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors">
                        <td className="py-1.5 px-1 text-slate-500">{asset.rank}</td>
                        <td className="py-1.5 px-1"><AssetLink id={asset.id} /></td>
                        <td className="py-1.5 px-1 text-slate-400">{asset.location}</td>
                        <td className="py-1.5 px-1">
                          <div className="font-bold text-red-400">{asset.riskScore}</div>
                          <Badge value={asset.riskLevel} />
                        </td>
                        <td className="py-1.5 px-1 font-bold text-slate-200">{asset.ahi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

            {/* Maintenance Strategy */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="Maintenance Strategy" />
              <MaintenanceChart data={maintenanceStrategy} />
              <div className="grid grid-cols-2 gap-1 mt-2">
                {maintenanceStrategy.map((m) => (
                  <div key={m.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="text-[10px] text-slate-400">{m.label}</span>
                    <span className="text-[10px] text-slate-300 ml-auto font-medium">{m.count}</span>
                    <span className="text-[10px] text-slate-500">({m.pct}%)</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-[#1e2d4f]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">TOTAL ACTIONS</span>
                  <span className="text-slate-200 font-bold">{totalActions}</span>
                </div>
              </div>
            </div>

            {/* Inspection Status */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="Inspection Status" />
              <div className="flex items-center justify-center mt-4 mb-2">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2d4f" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12"
                      strokeDasharray={`${inspectedPct * 2.513} 251.3`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-green-400">{inspectedPct}%</span>
                    <span className="text-[9px] text-slate-500">Inspected</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-slate-400">Inspected</span>
                  </div>
                  <span className="text-green-400 font-bold">{inspectedPct}%</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-slate-400">Pending</span>
                  </div>
                  <span className="text-yellow-400 font-bold">{Math.round(100 - inspectedPct)}%</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-[#1e2d4f] rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: `${inspectedPct}%` }} />
                </div>
              </div>
            </div>

            {/* Corrosion Rate Trend */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="Corrosion Rate Overview" subtitle="mm/year" />
              <TrendChart type="corrosion" data={trendChart} />
              <div className="mt-2 flex gap-2 flex-wrap">
                {trendChart.map((d, i) => (
                  <div key={i} className="text-[9px] text-slate-500">
                    {d.month.split(' ')[0]}: <span className="text-orange-400">{d.corrosionRate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AHI Trend */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="AHI Trend" subtitle="6-Month Rolling" />
              <TrendChart type="ahi" data={trendChart} />
              <div className="mt-2 flex gap-2 flex-wrap">
                {trendChart.map((d, i) => (
                  <div key={i} className="text-[9px] text-slate-500">
                    {d.month.split(' ')[0]}: <span className="text-green-400">{d.ahi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Alerts + Key Takeaways + Next Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Alerts */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="Alert & Notification" />
              <div className="space-y-2">
                {liveAlerts.map((alert, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/asset/${alert.asset}`)}
                    className="flex gap-2 p-2 bg-[#111d35] rounded border border-[#1e2d4f] hover:border-orange-500/30 cursor-pointer transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${alertColor[alert.level]}`} />
                    <div>
                      <div className="text-[10px] text-slate-500">{alert.date}</div>
                      <div className="text-[11px] font-medium text-orange-400">{alert.asset}</div>
                      <div className="text-[10px] text-slate-400 whitespace-pre-line">{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="Key Takeaways" />
              <div className="space-y-2">
                {liveKeyTakeaways.map((kt, i) => (
                  <div key={i} className="flex gap-2 text-[11px] text-slate-400">
                    <span className="text-green-400 flex-shrink-0">✅</span>
                    <span>{kt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Next Action */}
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title="Recommended Next Action" />
              <div className="space-y-2">
                {liveNextActions.map((action, i) => (
                  <div key={i} className="flex gap-2 p-2 bg-[#111d35] rounded border border-[#1e2d4f] hover:border-orange-500/30 transition-colors cursor-pointer">
                    <span className="text-base flex-shrink-0">{action.icon}</span>
                    <span className="text-[11px] text-slate-300">{action.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
