import { Link, useLocation, useParams } from 'react-router-dom';

const LABELS = {
  '': 'Command Center',
  tactical: 'Tactical Dashboard',
  operational: 'Operational Dashboard',
  asset: 'Asset Register',
  hierarchy: 'Hierarchy',
  criticality: 'Criticality',
  inspection: 'Inspection',
  dft: 'DFT (Coating)',
  ut: 'UT (Thickness)',
  visual: 'Visual Inspection',
  photos: 'Photo',
  'asset-intelligence': 'Asset Intelligence',
  findings: 'Findings',
  risk: 'Risk Intelligence',
  maintenance: 'Action Register',
  kpi: 'KPI',
  trend: 'Trend',
  analytics: 'Analytics',
  'maintenance-strategy': 'Maintenance Strategy',
  'maintenance-plan': 'Maintenance Action Plan',
  'work-orders': 'Work Order',
  report: 'Report',
  lookup: 'Lookup',
  config: 'Config',
  'formula-map': 'Formula Map',
  users: 'User Management',
  ai: 'AI Assistant',
};

export default function Breadcrumb() {
  const location = useLocation();
  const params = useParams();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = [{ label: 'Command Center', to: '/' }];
  if (segments[0] === 'asset' && segments[1]) {
    crumbs.push({ label: 'Asset Register', to: '/asset' });
    crumbs.push({ label: params.id || segments[1], to: location.pathname });
  } else {
    crumbs.push({ label: LABELS[segments[0]] || segments[0], to: `/${segments[0]}` });
  }

  return (
    <div className="px-4 py-1.5 border-b border-[#1e2d4f] flex-shrink-0 flex items-center gap-1.5 text-[10px] text-slate-500 bg-[#070e1a]">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-slate-700">/</span>}
          {i === crumbs.length - 1 ? (
            <span className="text-orange-400">{c.label}</span>
          ) : (
            <Link to={c.to} className="hover:text-slate-300 transition-colors">{c.label}</Link>
          )}
        </span>
      ))}
    </div>
  );
}
