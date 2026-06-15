export default function Header({ onToggleSidebar }) {
  return (
    <header className="h-12 bg-[#0a1628] border-b border-[#1e2d4f] flex items-center px-4 gap-4 flex-shrink-0 sticky top-0 z-10">
      <button
        onClick={onToggleSidebar}
        className="sidebar:hidden text-slate-400 hover:text-slate-200 p-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <span className="text-orange-500 font-bold text-sm">AIRDE</span>
        <span className="hidden sm:block text-slate-600 text-xs">|</span>
        <span className="hidden sm:block text-slate-400 text-xs">AI-POWERED PIPELINE INTEGRITY MANAGEMENT</span>
      </div>

      <div className="ml-auto flex items-center gap-4 text-xs text-slate-400">
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-slate-500">DATA DATE</span>
          <span className="text-slate-200 font-medium">15-Jun-2026</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <span className="text-slate-500">LAST REFRESH</span>
          <span className="text-slate-200 font-medium">15-Jun-2026 08:30</span>
        </div>
        <button className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors">
          <span>⟳</span>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}
