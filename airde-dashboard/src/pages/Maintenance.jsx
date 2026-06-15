import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import MaintenanceChart from '../components/charts/MaintenanceChart';
import { maintenanceStrategy, nextActions } from '../data/dashboardData';
import { actionRegister } from '../data/assetData';

export default function Maintenance() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">04 MAINTENANCE</div>
        <div className="text-[11px] text-slate-400">Maintenance Strategy & Action Plan</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">

        {/* Strategy Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {maintenanceStrategy.map((m) => (
            <div key={m.label} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-xl font-bold" style={{ color: m.color }}>{m.count}</div>
              <div className="text-[11px] text-slate-300">{m.label}</div>
              <div className="text-[10px] text-slate-500 mt-1">{m.pct}% of total</div>
              <div className="mt-2">
                <div className="w-full bg-[#1e2d4f] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart */}
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
            <SectionHeader title="Strategy Distribution" />
            <MaintenanceChart />
          </div>

          {/* Next Actions */}
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
            <SectionHeader title="Recommended Next Actions" />
            <div className="space-y-2 mt-2">
              {nextActions.map((a, i) => (
                <div key={i} className="flex gap-3 p-3 bg-[#111d35] rounded border border-[#1e2d4f] hover:border-orange-500/30 transition-colors">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <div className="text-xs text-slate-300">{a.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Plan Table */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="px-3 pt-3">
            <SectionHeader title="Maintenance Action Plan" subtitle="All recommended actions" />
          </div>
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
