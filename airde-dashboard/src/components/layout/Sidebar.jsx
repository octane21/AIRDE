import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Navigation mirrors the 25 sheets of AIRDE_Pipeline_Integrity_AI_Assistant_V20_Premium_Linked.xlsx,
// grouped for readability but kept in workbook order within each group.
const navGroups = [
  {
    title: 'Dashboards',
    items: [
      { path: '/', icon: '⌂', label: 'Command Center' },               // 00_Command_Center
      { path: '/tactical', icon: '◈', label: 'Tactical Dashboard' },    // 01_Tactical_Dashboard
      { path: '/operational', icon: '◉', label: 'Operational Dashboard' }, // 02_Operational_Dashboard
    ],
  },
  {
    title: 'Asset Data',
    items: [
      { path: '/asset', icon: '▣', label: 'Asset Register' },          // 03_Asset_Register
      { path: '/hierarchy', icon: '☵', label: 'Hierarchy' },           // 04_Hierarchy
      { path: '/criticality', icon: '▲', label: 'Criticality' },       // 05_Criticality
      { path: '/inspection', icon: '◇', label: 'Inspection' },         // 06_Inspection
      { path: '/teams', icon: '👥', label: 'Inspection Team' },
      { path: '/dft', icon: '◐', label: 'DFT (Coating)' },             // 07_DFT
      { path: '/ut', icon: '◑', label: 'UT (Thickness)' },             // 08_UT
      { path: '/visual', icon: '👁', label: 'Visual Inspection' },      // 09_Visual
      { path: '/photos', icon: '📷', label: 'Photo' },                  // 10_Photo
    ],
  },
  {
    title: 'Intelligence & Risk',
    items: [
      { path: '/asset-intelligence', icon: '🧠', label: 'Asset Intelligence' }, // 11_Asset_Intelligence
      { path: '/findings', icon: '⚑', label: 'Findings' },                      // 12_Findings
      { path: '/risk', icon: '◆', label: 'Risk Intelligence' },                 // 13_Risk_Intelligence
      { path: '/maintenance', icon: '⚒', label: 'Action Register' },          // 14_Action_Register
    ],
  },
  {
    title: 'Performance',
    items: [
      { path: '/kpi', icon: '◔', label: 'KPI' },             // 15_KPI
      { path: '/trend', icon: '📈', label: 'Trend' },         // 16_Trend
      { path: '/analytics', icon: '💡', label: 'Analytics' }, // 17_Analytics
    ],
  },
  {
    title: 'Maintenance & Execution',
    items: [
      { path: '/maintenance-strategy', icon: '📘', label: 'Maintenance Strategy' }, // 18_Maintenance_Strategy
      { path: '/maintenance-plan', icon: '🗒', label: 'Maintenance Action Plan' },  // 19_Maintenance_Action_Plan
      { path: '/work-orders', icon: '🧾', label: 'Work Order' },                    // 20_Work_Order
      { path: '/report', icon: '▤', label: 'Report' },                             // 21_Report
    ],
  },
  {
    title: 'Reference & Config',
    items: [
      { path: '/lookup', icon: '🔎', label: 'Lookup' },        // 98_Lookup
      { path: '/config', icon: '⚙', label: 'Config' },         // 99_Config
      { path: '/formula-map', icon: 'ƒ', label: 'Formula Map' }, // 22_Formula_Map
    ],
  },
];

const aiItem = { path: '/ai', icon: '◎', label: 'AI Assistant' };
const adminItems = [{ path: '/users', icon: '👤', label: 'User Management' }];

const ADMIN_PATHS = ['/users', '/maintenance-strategy', '/config', '/lookup', '/formula-map'];

function NavSection({ title, items, onNavigate, accent, isAdmin }) {
  return (
    <div className="px-2 pt-3 pb-1">
      <div className={`text-[10px] uppercase tracking-widest px-2 mb-2 ${accent ? 'text-orange-500/60' : 'text-slate-500'}`}>{title}</div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const disabled = ADMIN_PATHS.includes(item.path) && !isAdmin;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={(e) => { if (disabled) { e.preventDefault(); return; } onNavigate?.(); }}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-3 py-2 rounded text-left text-xs transition-all
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
                ${isActive && !disabled
                  ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500'
                  : 'text-slate-400 hover:bg-[#162040] hover:text-slate-200'
                }
              `}
            >
              <span className="text-sm w-4 text-center">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar({ sidebarOpen, onToggle, onNavigate, onLoginClick }) {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();

  return (
    <>
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
            <img src="/logo_airde.png" className="w-10 h-10" />
            <div>
              <div className="text-white-500 font-bold text-sm leading-tight">AIRDE</div>
              <div className="text-[10px] text-slate-400 leading-tight">ASSET & RELIABILITY INTELLIGENCE</div>
            </div>
          </div>
        </div>

        {/* Scrollable nav area — mirrors the 25 sheets of the workbook, plus AI Assistant & System */}
        <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
          {navGroups.map(group => (
            <NavSection key={group.title} title={group.title} items={group.items} onNavigate={onNavigate} isAdmin={isAdmin} />
          ))}

          <NavSection title="Assistant" items={[aiItem]} onNavigate={onNavigate} isAdmin={isAdmin} />

          {isAdmin && (
            <NavSection title="System" accent items={adminItems} onNavigate={onNavigate} isAdmin={isAdmin} />
          )}
        </div>

        {/* Auth section at bottom */}
        <div className="mt-auto px-3 py-3 border-t border-[#1e2d4f] flex-shrink-0">
          {isLoggedIn ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[10px] text-orange-400 font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-200 font-medium truncate">{user.username}</div>
                  <div className="text-[10px] text-orange-400 uppercase">{user.role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full text-left text-[10px] text-slate-500 hover:text-red-400 transition-colors px-1"
              >
                ⎋ Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-slate-400 hover:bg-[#162040] hover:text-slate-200 transition-all"
            >
              <span>🔑</span>
              <span>Login (Admin / Operator)</span>
            </button>
          )}
          <div className="mt-2 pt-2 border-t border-[#1e2d4f]/50">
            <div className="text-[10px] text-orange-500 font-semibold">AIRDE V20</div>
            <div className="text-[9px] text-slate-600 mt-0.5">© 2026 AIRDE. All rights reserved.</div>
          </div>
        </div>
      </aside>
    </>
  );
}
