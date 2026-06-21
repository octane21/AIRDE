import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, FileBarChart, Bot, X, LogOut, LogIn } from 'lucide-react';
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
    <header className="h-14 bg-[#0a1628] border-b border-[#1e2d4f] flex items-center px-5 gap-4 flex-shrink-0 sticky top-0 z-10">
      <button
        onClick={onToggleSidebar}
        className="sidebar:hidden text-slate-400 hover:text-slate-200 p-1.5"
      >
        <Menu size={20} />
      </button>

      {/* Global nav buttons — replicate V20's hyperlink buttons on every page */}
      <div className="hidden sm:flex items-center gap-2">
        <Link to="/" className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-orange-400 px-2.5 py-1.5 border border-[#1e2d4f] hover:border-orange-500/30 rounded-md transition-colors">
          <Home size={13} /> Command Center
        </Link>
        <Link to="/report" className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-orange-400 px-2.5 py-1.5 border border-[#1e2d4f] hover:border-orange-500/30 rounded-md transition-colors">
          <FileBarChart size={13} /> Report
        </Link>
        <button onClick={onOpenAiPanel} className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-orange-400 px-2.5 py-1.5 border border-[#1e2d4f] hover:border-orange-500/30 rounded-md transition-colors">
          <Bot size={13} /> AI Panel
        </button>
      </div>

      {activeCount > 0 && (
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-md text-[10px] text-orange-400">
          <span>
            Filter: {[system !== 'All' && `System=${system}`, line !== 'All' && `Line=${line}`, location !== 'All' && `Location=${location}`].filter(Boolean).join(', ')}
          </span>
          <button onClick={resetFilters} className="text-orange-300 hover:text-white"><X size={12} /></button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-5 text-xs text-slate-400">
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-slate-500">LAST UPDATE</span>
          <span className="text-slate-200 font-medium">{formatLastUpdate(lastUpdate)}</span>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-md text-[11px]">
              <span className="text-orange-400 font-medium">{user.username}</span>
              <span className="text-orange-500/50">·</span>
              <span className="text-orange-400/70 uppercase text-[10px]">{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors text-[11px] px-2.5 py-1.5 border border-[#1e2d4f] rounded-md"
              title="Logout"
            >
              <LogOut size={13} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-1.5 text-slate-400 hover:text-orange-400 transition-colors text-[11px] px-2.5 py-1.5 border border-[#1e2d4f] hover:border-orange-500/30 rounded-md"
          >
            <LogIn size={13} /> <span className="hidden sm:inline">Login</span>
          </button>
        )}
      </div>
    </header>
  );
}
