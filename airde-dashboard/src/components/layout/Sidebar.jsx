import { NavLink } from 'react-router-dom';
import {
  Home, LayoutDashboard, Activity, Package, GitBranch, AlertTriangle,
  ClipboardCheck, Users, Droplet, Gauge, Eye, Camera, Brain, Flag,
  ShieldAlert, Wrench, TrendingUp, Lightbulb, BookOpen, ClipboardList,
  Receipt, FileBarChart, Search, Settings, FunctionSquare, Bot, UserCog,
  LogIn, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Navigation mirrors the 25 sheets of AIRDE_Pipeline_Integrity_AI_Assistant_V20_Premium_Linked.xlsx,
// grouped for readability but kept in workbook order within each group.
const navGroups = [
  {
    title: 'Dashboards',
    items: [
      { path: '/', icon: Home, label: 'Command Center' },               // 00_Command_Center
      { path: '/tactical', icon: LayoutDashboard, label: 'Tactical Dashboard' },    // 01_Tactical_Dashboard
      { path: '/operational', icon: Activity, label: 'Operational Dashboard' }, // 02_Operational_Dashboard
    ],
  },
  {
    title: 'Asset Data',
    items: [
      { path: '/asset', icon: Package, label: 'Asset Register' },          // 03_Asset_Register
      { path: '/hierarchy', icon: GitBranch, label: 'Hierarchy' },           // 04_Hierarchy
      { path: '/criticality', icon: AlertTriangle, label: 'Criticality' },       // 05_Criticality
      { path: '/inspection', icon: ClipboardCheck, label: 'Inspection' },         // 06_Inspection
      { path: '/teams', icon: Users, label: 'Inspection Team' },
      { path: '/dft', icon: Droplet, label: 'DFT (Coating)' },             // 07_DFT
      { path: '/ut', icon: Gauge, label: 'UT (Thickness)' },             // 08_UT
      { path: '/visual', icon: Eye, label: 'Visual Inspection' },      // 09_Visual
      { path: '/photos', icon: Camera, label: 'Photo' },                  // 10_Photo
    ],
  },
  {
    title: 'Intelligence & Risk',
    items: [
      { path: '/asset-intelligence', icon: Brain, label: 'Asset Intelligence' }, // 11_Asset_Intelligence
      { path: '/findings', icon: Flag, label: 'Findings' },                      // 12_Findings
      { path: '/risk', icon: ShieldAlert, label: 'Risk Intelligence' },                 // 13_Risk_Intelligence
      { path: '/maintenance', icon: Wrench, label: 'Action Register' },          // 14_Action_Register
    ],
  },
  {
    title: 'Performance',
    items: [
      { path: '/kpi', icon: Gauge, label: 'KPI' },             // 15_KPI
      { path: '/trend', icon: TrendingUp, label: 'Trend' },         // 16_Trend
      { path: '/analytics', icon: Lightbulb, label: 'Analytics' }, // 17_Analytics
    ],
  },
  {
    title: 'Maintenance & Execution',
    items: [
      { path: '/maintenance-strategy', icon: BookOpen, label: 'Maintenance Strategy' }, // 18_Maintenance_Strategy
      { path: '/maintenance-plan', icon: ClipboardList, label: 'Maintenance Action Plan' },  // 19_Maintenance_Action_Plan
      { path: '/work-orders', icon: Receipt, label: 'Work Order' },                    // 20_Work_Order
      { path: '/report', icon: FileBarChart, label: 'Report' },                             // 21_Report
    ],
  },
  {
    title: 'Reference & Config',
    items: [
      { path: '/lookup', icon: Search, label: 'Lookup' },        // 98_Lookup
      { path: '/config', icon: Settings, label: 'Config' },         // 99_Config
      { path: '/formula-map', icon: FunctionSquare, label: 'Formula Map' }, // 22_Formula_Map
    ],
  },
];

const aiItem = { path: '/ai', icon: Bot, label: 'AI Assistant' };
const adminItems = [{ path: '/users', icon: UserCog, label: 'User Management' }];

const ADMIN_PATHS = ['/users', '/maintenance-strategy', '/config', '/lookup', '/formula-map'];

function NavSection({ title, items, onNavigate, accent, isAdmin }) {
  return (
    <div className="px-2.5 pt-4 pb-1.5">
      <div className={`text-[10px] uppercase tracking-widest px-2.5 mb-2.5 ${accent ? 'text-orange-500/60' : 'text-slate-500'}`}>{title}</div>
      <nav className="space-y-1">
        {items.map((item) => {
          const disabled = ADMIN_PATHS.includes(item.path) && !isAdmin;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={(e) => { if (disabled) { e.preventDefault(); return; } onNavigate?.(); }}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-xs transition-all
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
                ${isActive && !disabled
                  ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500'
                  : 'text-slate-400 hover:bg-[#162040] hover:text-slate-200'
                }
              `}
            >
              <Icon size={16} className="flex-shrink-0" strokeWidth={1.75} />
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
        <div className="px-4 pt-5 pb-4 border-b border-[#1e2d4f] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo_airde.png" className="w-10 h-10" />
            <div>
              <div className="text-white-500 font-bold text-sm leading-tight">AIRDE</div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">ASSET & RELIABILITY INTELLIGENCE</div>
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
        <div className="mt-auto px-3.5 py-4 border-t border-[#1e2d4f] flex-shrink-0">
          {isLoggedIn ? (
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[10px] text-orange-400 font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-200 font-medium truncate">{user.username}</div>
                  <div className="text-[10px] text-orange-400 uppercase">{user.role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-1.5 text-left text-[10px] text-slate-500 hover:text-red-400 transition-colors px-1"
              >
                <LogOut size={12} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs text-slate-400 hover:bg-[#162040] hover:text-slate-200 transition-all"
            >
              <LogIn size={16} strokeWidth={1.75} />
              <span>Login (Admin / Operator)</span>
            </button>
          )}
          <div className="mt-3 pt-3 border-t border-[#1e2d4f]/50">
            <div className="text-[10px] text-orange-500 font-semibold">AIRDE V20</div>
            <div className="text-[9px] text-slate-600 mt-1">© 2026 AIRDE. All rights reserved.</div>
          </div>
        </div>
      </aside>
    </>
  );
}
