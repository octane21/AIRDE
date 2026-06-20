import CrudPage from '../components/crud/CrudPage';
import { findingsApi } from '../services/api';

const SEVERITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Open', 'Closed', 'Monitoring'];

const fields = [
  { key: 'finding_code', label: 'Finding ID', required: true, disabledOnEdit: true },
  { key: 'asset_id', label: 'Asset ID', required: true },
  { key: 'finding_date', label: 'Date', type: 'date' },
  { key: 'kp_location', label: 'KP / Location' },
  { key: 'finding', label: 'Finding', required: true },
  { key: 'severity', label: 'Severity', type: 'select', options: SEVERITIES, default: 'Low' },
  { key: 'status', label: 'Status', type: 'select', options: STATUSES, default: 'Open' },
  { key: 'evidence', label: 'Evidence' },
];

const columns = [
  { key: 'finding_code', label: 'Finding ID' },
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'finding_date', label: 'Date', render: r => r.finding_date ? String(r.finding_date).slice(0, 10) : '-' },
  { key: 'kp_location', label: 'KP / Location' },
  { key: 'finding', label: 'Finding' },
  { key: 'severity', label: 'Severity' },
  { key: 'status', label: 'Status' },
  { key: 'evidence', label: 'Evidence' },
];

export default function Findings() {
  return (
    <CrudPage
      title="FINDINGS REGISTER"
      subtitle="Tracked anomalies & follow-up status (12_Findings)"
      api={findingsApi}
      idField="finding_code"
      columns={columns}
      fields={fields}
      searchKeys={['finding_code', 'asset_id', 'finding']}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
      badgeKeys={['status']}
      linkKeys={['asset_id']}
      defaultSort={(a, b) => new Date(b.finding_date || 0) - new Date(a.finding_date || 0)}
    />
  );
}
