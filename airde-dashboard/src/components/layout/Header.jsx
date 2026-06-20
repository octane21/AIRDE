import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFilters } from '../../context/FilterContext';
import { statsApi } from '../../services/api';

function formatLastUpdate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${d.getFullYear()} ${hh}:${mm}`;
}

export default function Header({ onToggleSidebar, onLoginClick, onOpenAiPanel }) {
  const { user, isLoggedIn, logout } = useAuth();
  const { system, line, location, resetFilters, activeCount } = useFilters();
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { lastUpdate } = await statsApi.lastUpdate();
        if (!cancelled) setLastUpdate(lastUpdate);
      } catch {
        // backend not reachable — leave as '-'
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <header className="h-12 bg-[#0a1628] border-b border-[#1e2d4f] flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-10">
      <button
        onClick={onToggleSidebar}
        className="sidebar:hidden text-slate-400 hover:text-slate-200 p-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Global nav buttons — replicate V20's hyperlink buttons on every page */}
      <div className="hidden sm:flex items-center gap-1.5">
        <Link to="/" className="text-[11px] text-slate-400 hover:text-orange-400 px-2 py-1 border border-[#1e2d4f] hover:border-orange-500/30 rounded transition-colors">
          ⌂ Command Center
        </Link>
        <Link to="/report" className="text-[11px] text-slate-400 hover:text-orange-400 px-2 py-1 border border-[#1e2d4f] hover:border-orange-500/30 rounded transition-colors">
          ▤ Report
        </Link>
        <button onClick={onOpenAiPanel} className="text-[11px] text-slate-400 hover:text-orange-400 px-2 py-1 border border-[#1e2d4f] hover:border-orange-500/30 rounded transition-colors">
          ◎ AI Panel
        </button>
      </div>

      {activeCount > 0 && (
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-400">
          <span>
            Filter: {[system !== 'All' && `System=${system}`, line !== 'All' && `Line=${line}`, location !== 'All' && `Location=${location}`].filter(Boolean).join(', ')}
          </span>
          <button onClick={resetFilters} className="text-orange-300 hover:text-white">✕</button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-4 text-xs text-slate-400">
        <div className="hidden md:flex items-center gap-1">
          <span className="text-slate-500">LAST UPDATE</span>
          <span className="text-slate-200 font-medium">{formatLastUpdate(lastUpdate)}</span>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[11px]">
              <span className="text-orange-400 font-medium">{user.username}</span>
              <span className="text-orange-500/50">·</span>
              <span className="text-orange-400/70 uppercase text-[10px]">{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors text-[11px] px-2 py-1 border border-[#1e2d4f] rounded"
              title="Logout"
            >
              ⎋ <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-1 text-slate-400 hover:text-orange-400 transition-colors text-[11px] px-2 py-1 border border-[#1e2d4f] hover:border-orange-500/30 rounded"
          >
            🔑 <span className="hidden sm:inline">Login</span>
          </button>
        )}
      </div>
    </header>
  );
}
