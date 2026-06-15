const menuItems = [
  { id: 'command', icon: '⌂', label: '00 Command Center' },
  { id: 'asset', icon: '▣', label: '01 Asset Management' },
  { id: 'inspection', icon: '◈', label: '02 Inspection' },
  { id: 'risk', icon: '◇', label: '03 Risk Management' },
  { id: 'maintenance', icon: '⚒', label: '04 Maintenance' },
  { id: 'reporting', icon: '▤', label: '05 Reporting' },
  { id: 'ai', icon: '◎', label: '06 AI Assistant' },
];


export default function Sidebar({ activePage, onPageChange, sidebarOpen, onToggle }) {
  return (
    <>
      {/* Overlay backdrop — tampil di bawah 1030px saja */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 sidebar:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-[#0a1628] border-r border-[#1e2d4f]
          transition-all duration-300
          ${sidebarOpen ? 'w-60' : 'w-0 sidebar:w-60'}
          overflow-hidden
        `}
      >
        {/* Brand */}
        <div className="px-4 pt-4 pb-3 border-b border-[#1e2d4f] flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-xs font-bold text-white">A</div>
            <div>
              <div className="text-orange-500 font-bold text-sm leading-tight">AIRDE</div>
              <div className="text-[10px] text-slate-400 leading-tight">ASSET INTELLIGENCE</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">PIPELINE INTEGRITY</div>
        </div>

        {/* Main Menu */}
        <div className="px-2 pt-3 flex-shrink-0">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest px-2 mb-2">Main Menu</div>
          <nav className="space-y-0.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded text-left text-xs transition-all
                  ${activePage === item.id
                    ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500'
                    : 'text-slate-400 hover:bg-[#162040] hover:text-slate-200'
                  }
                `}
              >
                <span className="text-sm w-4 text-center">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto px-4 py-3 border-t border-[#1e2d4f] flex-shrink-0">
          <div className="text-[10px] text-orange-500 font-semibold">AIRDE V20</div>
          <div className="text-[9px] text-slate-600 mt-0.5">© 2026 AIRDE. All rights reserved.</div>
        </div>
      </aside>
    </>
  );
}
