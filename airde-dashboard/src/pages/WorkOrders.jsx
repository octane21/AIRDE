import CrudPage from '../components/crud/CrudPage';
import { workOrdersApi } from '../services/api';

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const STATUSES = ['Draft - Urgent', 'Draft', 'Planned', 'In Progress', 'Completed'];

const fields = [
  { key: 'wo_no', label: 'WO No', required: true, disabledOnEdit: true },
  { key: 'asset_id', label: 'Asset ID', required: true },
  { key: 'work_type', label: 'Work Type' },
  { key: 'description', label: 'Description', fullWidth: true },
  { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, default: 'P2' },
  { key: 'due_date', label: 'Due Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: STATUSES, default: 'Planned' },
];

const columns = [
  { key: 'wo_no', label: 'WO No' },
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'work_type', label: 'Work Type' },
  { key: 'description', label: 'Description' },
  { key: 'priority', label: 'Priority' },
  { key: 'due_date', label: 'Due Date', render: r => r.due_date ? String(r.due_date).slice(0, 10) : '-' },
  { key: 'status', label: 'Status' },
];

export default function WorkOrders() {
  return (
    <CrudPage
      title="WORK ORDERS"
      subtitle="Auto-generated from Action Register — read-only (20_Work_Order)"
      api={workOrdersApi}
      idField="wo_no"
      columns={columns}
      fields={fields}
      searchKeys={['wo_no', 'asset_id']}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }, { key: 'priority', label: 'Priority', options: PRIORITIES }]}
      badgeKeys={[]}
      linkKeys={['asset_id']}
      readOnly={true}
      defaultSort={(a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0)}
    />
  );
}
