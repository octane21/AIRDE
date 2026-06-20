import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CrudPage from '../components/crud/CrudPage';
import { inspectionsApi, teamsApi } from '../services/api';

const STATUSES = ['Completed', 'Pending', 'Scheduled'];

function buildFields(teamOptions) {
  return [
    { key: 'inspection_code', label: 'Inspection ID', required: true, disabledOnEdit: true },
    { key: 'asset_id', label: 'Asset ID', required: true },
    { key: 'inspection_date', label: 'Inspection Date', type: 'date' },
    { key: 'inspector', label: 'Inspector', type: 'select', options: ['', ...teamOptions] },
    { key: 'method', label: 'Method' },
    { key: 'kp_location', label: 'KP / Location' },
    { key: 'status', label: 'Status', type: 'select', options: STATUSES, default: 'Pending' },
    { key: 'remarks', label: 'Remarks', type: 'textarea', fullWidth: true },
  ];
}

const columns = [
  { key: 'inspection_code', label: 'Inspection ID' },
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'inspection_date', label: 'Date', render: r => r.inspection_date ? String(r.inspection_date).slice(0, 10) : '-' },
  { key: 'inspector', label: 'Inspector' },
  { key: 'method', label: 'Method' },
  { key: 'kp_location', label: 'KP / Location' },
  { key: 'status', label: 'Status' },
  { key: 'remarks', label: 'Remarks' },
];

export default function Inspection() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const [teamNames, setTeamNames] = useState(null);

  useEffect(() => {
    let cancelled = false;
    teamsApi.list()
      .then(teams => { if (!cancelled) setTeamNames(teams.map(t => t.name)); })
      .catch(() => { if (!cancelled) setTeamNames([]); });
    return () => { cancelled = true; };
  }, []);

  if (teamNames === null) {
    return <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Memuat data tim...</div>;
  }

  return (
    <CrudPage
      key={statusParam || 'all'}
      title="INSPECTION"
      subtitle="Inspection Records & Coverage (06_Inspection)"
      api={inspectionsApi}
      idField="inspection_code"
      columns={columns}
      fields={buildFields(teamNames)}
      searchKeys={['inspection_code', 'asset_id', 'inspector']}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
      initialFilterValues={statusParam ? { status: statusParam } : undefined}
      badgeKeys={['status']}
      linkKeys={['asset_id']}
      summary={(rows) => {
        const completed = rows.filter(r => r.status === 'Completed').length;
        const pending = rows.length - completed;
        return [
          { label: 'Completed', value: completed, color: 'text-green-400' },
          { label: 'Pending', value: pending, color: 'text-yellow-400' },
          { label: 'Total', value: rows.length, color: 'text-slate-200' },
          { label: 'Coverage', value: rows.length ? `${Math.round((completed / rows.length) * 100)}%` : '0%', color: 'text-orange-400' },
        ];
      }}
      defaultSort={(a, b) => new Date(b.inspection_date || 0) - new Date(a.inspection_date || 0)}
    />
  );
}
