import SectionHeader from '../components/ui/SectionHeader';
import TrendChart from '../components/charts/TrendChart';
import { kpiTable, trendData } from '../data/dashboardData';
import Badge from '../components/ui/Badge';

export default function Reporting() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0 flex items-center justify-between">
        <div>
          <div className="text-orange-500 font-bold text-sm">05 REPORTING</div>
          <div className="text-[11px] text-slate-400">KPI, Trend Analysis & Summary Report</div>
        </div>
        <button className="text-[11px] bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded transition-colors">
          ↓ Export Report
        </button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">

        {/* KPI Table */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
          <SectionHeader title="KPI Performance Tracker" />
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
                {kpiTable.map((k, i) => (
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
        </div>

        {/* Trend Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'ahi', title: 'AHI Trend (6 Month)', sub: 'Average Asset Health Index' },
            { type: 'corrosion', title: 'Corrosion Rate Trend', sub: 'Average mm/year' },
            { type: 'risk', title: 'High/Extreme Risk Count', sub: 'Monthly risk exposure' },
          ].map(t => (
            <div key={t.type} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <SectionHeader title={t.title} subtitle={t.sub} />
              <TrendChart type={t.type} />
            </div>
          ))}
        </div>

        {/* Trend data table */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
          <SectionHeader title="Trend Data Table" />
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[500px]">
              <thead>
                <tr className="border-b border-[#1e2d4f]">
                  {['Month', 'Avg Corrosion Rate (mm/yr)', 'Avg AHI', 'High/Extreme Risk Count'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium text-[10px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trendData.map((d, i) => (
                  <tr key={i} className="border-b border-[#1e2d4f]/50 hover:bg-[#162040]">
                    <td className="py-2 px-3 text-slate-300 font-medium">{d.month}</td>
                    <td className="py-2 px-3 text-orange-400 font-mono">{d.corrosionRate.toFixed(3)}</td>
                    <td className="py-2 px-3 text-green-400 font-bold">{d.ahi}</td>
                    <td className="py-2 px-3 text-red-400 font-bold">{d.highExtremeCount}</td>
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
