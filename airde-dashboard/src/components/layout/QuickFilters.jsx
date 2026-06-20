import { useFilters } from '../../context/FilterContext';

function Select({ label, value, onChange, options, disabled }) {
  return (
    <div>
      <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1.5 text-[11px] text-slate-300 outline-none focus:border-orange-500/50 disabled:opacity-60 w-full"
      >
        {!disabled && <option value="All">All</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function QuickFilters() {
  const { company, system, line, location, setSystem, setLine, setLocation, resetFilters, options, activeCount } = useFilters();

  return (
    <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Quick Filters</div>
        {activeCount > 0 && (
          <button onClick={resetFilters} className="text-[10px] text-orange-400 hover:text-orange-300">
            Reset ({activeCount})
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Select label="Company" value={company} onChange={() => {}} options={[company]} disabled />
        <Select label="System" value={system} onChange={setSystem} options={options.systems} />
        <Select label="Line" value={line} onChange={setLine} options={options.lines} />
        <Select label="Location" value={location} onChange={setLocation} options={options.locations} />
      </div>
    </div>
  );
}
