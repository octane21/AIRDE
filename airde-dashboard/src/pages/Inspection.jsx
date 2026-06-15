import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import { inspectionStatus } from '../data/dashboardData';

const inspectionData = [
  { id: 'INSP-0001', asset: 'PL-001', date: '2026-01-12', inspector: 'Team B', method: 'Direct Assessment', kp: 'KP 10+050', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0002', asset: 'PL-002', date: '2026-02-21', inspector: 'Team C', method: 'Direct Assessment', kp: 'KP 10+100', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0003', asset: 'PL-003', date: '2026-03-14', inspector: 'Team D', method: 'Direct Assessment', kp: 'KP 10+150', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0004', asset: 'PL-004', date: '2026-03-12', inspector: 'Team A', method: 'Direct Assessment', kp: 'KP 10+200', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0005', asset: 'PL-005', date: '2026-06-10', inspector: 'Team B', method: 'Direct Assessment', kp: 'KP 10+250', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0006', asset: 'PL-006', date: '2026-02-07', inspector: 'Team C', method: 'Direct Assessment', kp: 'KP 10+300', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0007', asset: 'PL-007', date: '2026-03-13', inspector: 'Team D', method: 'Direct Assessment', kp: 'KP 10+350', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0008', asset: 'PL-008', date: '2026-01-17', inspector: 'Team A', method: 'Direct Assessment', kp: 'KP 11+400', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0009', asset: 'PL-009', date: '2025-12-24', inspector: 'Team B', method: 'Direct Assessment', kp: 'KP 11+450', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0010', asset: 'PL-010', date: '2026-03-20', inspector: 'Team C', method: 'Direct Assessment', kp: 'KP 11+500', status: 'Completed', remarks: 'Normal' },
  { id: 'INSP-0045', asset: 'PL-045', date: '2026-06-15', inspector: 'Team A', method: 'UT + Visual', kp: 'KP 15+200', status: 'Completed', remarks: 'CRITICAL - Immediate action' },
  { id: 'INSP-PEND-01', asset: 'PL-050', date: '-', inspector: '-', method: '-', kp: '-', status: 'Pending', remarks: 'Awaiting schedule' },
  { id: 'INSP-PEND-02', asset: 'PL-051', date: '-', inspector: '-', method: '-', kp: '-', status: 'Pending', remarks: 'Awaiting schedule' },
  { id: 'INSP-PEND-03', asset: 'PL-052', date: '-', inspector: '-', method: '-', kp: '-', status: 'Pending', remarks: 'Awaiting schedule' },
];

export default function Inspection() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">02 INSPECTION</div>
        <div className="text-[11px] text-slate-400">Inspection Records & Coverage</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">

        {/* Coverage summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4 col-span-1">
            <div className="text-xs text-slate-500 mb-2">INSPECTION COVERAGE</div>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2d4f" strokeWidth="14" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="14"
                    strokeDasharray={`${inspectionStatus.inspected.pct * 2.513} 251.3`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-green-400">62%</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-[11px] text-slate-400">Inspected: <span className="font-bold text-green-400">78</span></span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-[11px] text-slate-400">Pending: <span className="font-bold text-yellow-400">47</span></span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-[11px] text-slate-400">Total: <span className="font-bold text-slate-200">125</span></span>
                </div>
              </div>
            </div>
          </div>
          {[
            { label: 'Completed', value: 78, color: 'text-green-400', bar: '#22c55e', pct: 62 },
            { label: 'Pending', value: 47, color: 'text-yellow-400', bar: '#eab308', pct: 38 },
          ].map(s => (
            <div key={s.label} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-1">{s.label.toUpperCase()}</div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="mt-3">
                <div className="w-full bg-[#1e2d4f] rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.bar }} />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{s.pct}% of total</div>
              </div>
            </div>
          ))}
        </div>

        {/* Inspection Table */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="px-3 pt-3">
            <SectionHeader title="Inspection Records" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[750px]">
              <thead className="bg-[#111d35]">
                <tr>
                  {['Inspection ID', 'Asset ID', 'Date', 'Inspector', 'Method', 'KP / Location', 'Status', 'Remarks'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inspectionData.map((d, i) => (
                  <tr key={d.id} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0a1628]/30'}`}>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">{d.id}</td>
                    <td className="py-2 px-3 font-medium text-orange-400">{d.asset}</td>
                    <td className="py-2 px-3 text-slate-400">{d.date}</td>
                    <td className="py-2 px-3 text-slate-400">{d.inspector}</td>
                    <td className="py-2 px-3 text-slate-300">{d.method}</td>
                    <td className="py-2 px-3 text-slate-400">{d.kp}</td>
                    <td className="py-2 px-3"><Badge value={d.status} /></td>
                    <td className="py-2 px-3 text-slate-400">{d.remarks}</td>
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
