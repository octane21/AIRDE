export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-orange-500 rounded-full flex-shrink-0" />
      <div>
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
