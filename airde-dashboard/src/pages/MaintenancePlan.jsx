import CrudPage from '../components/crud/CrudPage';
import { maintenancePlanApi } from '../services/api';

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const STATUSES = ['Open', 'Planned', 'In Progress', 'Completed'];

const fields = [
  { key: 'asset_id', label: 'Asset ID', required: true },
  { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, default: 'P2' },
  { key: 'action', label: 'Action', required: true },
  { key: 'owner', label: 'Owner', default: 'Integrity Team' },
  { key: 'target_date', label: 'Target Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: STATUSES, default: 'Planned' },
  { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
];

const columns = [
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'priority', label: 'Priority' },
  { key: 'action', label: 'Action' },
  { key: 'owner', label: 'Owner' },
  { key: 'target_date', label: 'Target Date', render: r => r.target_date ? String(r.target_date).slice(0, 10) : '-' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
];

export default function MaintenancePlan() {
  return (
    <CrudPage
      title="MAINTENANCE ACTION PLAN"
      subtitle="Auto-generated from Action Register — read-only (19_Maintenance_Action_Plan)"
      api={maintenancePlanApi}
      idField="id"
      columns={columns}
      fields={fields}
      searchKeys={['asset_id', 'action']}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }, { key: 'priority', label: 'Priority', options: PRIORITIES }]}
      badgeKeys={['status']}
      linkKeys={['asset_id']}
      readOnly={true}
      defaultSort={(a, b) => new Date(a.target_date || 0) - new Date(b.target_date || 0)}
    />
  );
}
