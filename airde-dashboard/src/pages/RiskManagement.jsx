import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import RiskMatrix from '../components/charts/RiskMatrix';
import TrendChart from '../components/charts/TrendChart';
import { riskAssets } from '../data/assetData';
import { kpiTable } from '../data/dashboardData';

const riskLevelCount = (level) => riskAssets.filter(a => a.riskLevel === level).length;

export default function RiskManagement() {
  const sorted = [...riskAssets].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">03 RISK MANAGEMENT</div>
        <div className="text-[11px] text-slate-400">Risk Intelligence & KPI Tracking</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">

        {/* Risk summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'HIGH Risk', count: riskLevelCount('HIGH'), color: 'text-red-400', bg: 'border-red-500/30' },
            { label: 'MEDIUM Risk', count: riskLevelCount('MEDIUM'), color: 'text-yellow-400', bg: 'border-yellow-500/30' },
            { label: 'LOW Risk', count: riskLevelCount('LOW'), color: 'text-green-400', bg: 'border-green-500/30' },
            { label: 'Total Assessed', count: riskAssets.length, color: 'text-slate-200', bg: 'border-[#1e2d4f]' },
          ].map(s => (
            <div key={s.label} className={`bg-[#0d1f3c] border rounded-lg p-3 ${s.bg}`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Risk Matrix */}
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
            <SectionHeader title="Risk Matrix (PoF vs CoF)" />
            <RiskMatrix />
          </div>

          {/* KPI Table */}
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

        {/* Trend Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: 'ahi', title: 'AHI Trend' },
            { type: 'corrosion', title: 'Corrosion Rate Trend' },
            { type: 'risk', title: 'High/Extreme Risk Count' },
          ].map(t => (
            <div key={t.type} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title={t.title} />
              <TrendChart type={t.type} />
            </div>
          ))}
        </div>

        {/* Risk Register Table */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="px-3 pt-3">
            <SectionHeader title="Risk Register" subtitle="Sorted by Risk Score descending" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[900px]">
              <thead className="bg-[#111d35]">
                <tr>
                  {['Asset ID', 'Location', 'AHI', 'Coating Health', 'Thickness Health', 'Corr. Rate', 'Rem. Life (yr)', 'PoF', 'CoF', 'Risk Score', 'Risk Level'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((a, i) => (
                  <tr key={a.id} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0a1628]/30'}`}>
                    <td className="py-2 px-3 font-medium text-orange-400">{a.id}</td>
                    <td className="py-2 px-3 text-slate-400">{a.location}</td>
                    <td className="py-2 px-3 font-bold" style={{ color: a.ahi >= 90 ? '#22c55e' : a.ahi >= 75 ? '#84cc16' : a.ahi >= 60 ? '#eab308' : '#ef4444' }}>{a.ahi}</td>
                    <td className="py-2 px-3 text-slate-300">{a.coatingHealth.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-slate-300">{a.thicknessHealth.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-slate-300">{a.corrosionRate.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-300">{a.remainingLife.toFixed(1)}</td>
                    <td className="py-2 px-3 text-slate-300">{a.pof.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-300">{a.cof.toFixed(0)}</td>
                    <td className="py-2 px-3 font-bold" style={{ color: a.riskScore >= 2 ? '#ef4444' : a.riskScore >= 0.7 ? '#eab308' : '#22c55e' }}>{a.riskScore.toFixed(2)}</td>
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
