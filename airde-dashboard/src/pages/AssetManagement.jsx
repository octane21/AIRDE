import { useState } from 'react';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import { assetRegister } from '../data/assetData';

export default function AssetManagement() {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');

  const locations = ['All', 'Jetty 1', 'Jetty 2', 'Jetty 3'];

  const filtered = assetRegister.filter(a => {
    const matchSearch = a.id.toLowerCase().includes(search.toLowerCase()) || a.service.toLowerCase().includes(search.toLowerCase()) || a.line.toLowerCase().includes(search.toLowerCase());
    const matchLoc = locationFilter === 'All' || a.location === locationFilter;
    return matchSearch && matchLoc;
  });

  const stats = {
    total: assetRegister.length,
    active: assetRegister.filter(a => a.status === 'Active').length,
    high: assetRegister.filter(a => a.criticality === 'HIGH').length,
    medium: assetRegister.filter(a => a.criticality === 'MEDIUM').length,
    low: assetRegister.filter(a => a.criticality === 'LOW').length,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">01 ASSET MANAGEMENT</div>
        <div className="text-[11px] text-slate-400">Asset Register & Hierarchy</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Total Assets', value: stats.total, color: 'text-slate-200' },
            { label: 'Active', value: stats.active, color: 'text-green-400' },
            { label: 'High Criticality', value: stats.high, color: 'text-red-400' },
            { label: 'Medium Criticality', value: stats.medium, color: 'text-yellow-400' },
            { label: 'Low Criticality', value: stats.low, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, service, line..."
            className="bg-[#0d1f3c] border border-[#1e2d4f] rounded px-3 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-orange-500/50 w-48"
          />
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="bg-[#0d1f3c] border border-[#1e2d4f] rounded px-2 py-1.5 text-[11px] text-slate-300 outline-none focus:border-orange-500/50"
          >
            {locations.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Asset Table */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[900px]">
              <thead className="bg-[#111d35]">
                <tr>
                  {['Asset ID', 'Line / Segment', 'Location', 'Service', 'NPS (in)', 'OD (mm)', 'Material', 'Install Year', 'T-Design (mm)', 'Op. Press (bar)', 'Des. Press (bar)', 'CA (mm)', 'DFT Target (µm)', 'Criticality', 'Status'].map(h => (
                    <th key={h} className="text-left py-2.5 px-2 text-slate-500 font-medium text-[9px] uppercase tracking-wider border-b border-[#1e2d4f] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0a1628]/30'}`}>
                    <td className="py-2 px-2 font-medium text-orange-400">{a.id}</td>
                    <td className="py-2 px-2 text-slate-400 whitespace-nowrap">{a.line}</td>
                    <td className="py-2 px-2 text-slate-400">{a.location}</td>
                    <td className="py-2 px-2 text-slate-300">{a.service}</td>
                    <td className="py-2 px-2 text-slate-300 text-center">{a.nps}</td>
                    <td className="py-2 px-2 text-slate-300 text-center">{a.od}</td>
                    <td className="py-2 px-2 text-slate-400 whitespace-nowrap">{a.material}</td>
                    <td className="py-2 px-2 text-slate-300 text-center">{a.installYear}</td>
                    <td className="py-2 px-2 text-slate-300 text-center">{a.tDesign}</td>
                    <td className="py-2 px-2 text-slate-300 text-center">{a.opPressure}</td>
                    <td className="py-2 px-2 text-slate-300 text-center">{a.desPressure}</td>
                    <td className="py-2 px-2 text-slate-300 text-center">{a.ca}</td>
                    <td className="py-2 px-2 text-slate-300 text-center">{a.dftTarget}</td>
                    <td className="py-2 px-2"><Badge value={a.criticality} /></td>
                    <td className="py-2 px-2"><Badge value={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-[#1e2d4f] text-[10px] text-slate-500">
            Showing {filtered.length} of {assetRegister.length} assets
          </div>
        </div>
      </div>
    </div>
  );
}
