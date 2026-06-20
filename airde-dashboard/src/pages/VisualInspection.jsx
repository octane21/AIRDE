import CrudPage from '../components/crud/CrudPage';
import { visualApi } from '../services/api';

const SEVERITIES = ['Low', 'Medium', 'High'];

const fields = [
  { key: 'asset_id', label: 'Asset ID', required: true },
  { key: 'inspection_date', label: 'Date', type: 'date' },
  { key: 'kp_location', label: 'KP / Location' },
  { key: 'finding', label: 'Finding', required: true },
  { key: 'severity', label: 'Severity', type: 'select', options: SEVERITIES, default: 'Low' },
  { key: 'visual_score', label: 'Visual Score (0-100)', type: 'number', required: true },
  { key: 'leakage', label: 'Leakage' },
];

const columns = [
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'inspection_date', label: 'Date', render: r => r.inspection_date ? String(r.inspection_date).slice(0, 10) : '-' },
  { key: 'kp_location', label: 'KP / Location' },
  { key: 'finding', label: 'Finding' },
  { key: 'severity', label: 'Severity' },
  { key: 'visual_score', label: 'Score' },
  { key: 'leakage', label: 'Leakage' },
];

export default function VisualInspection() {
  return (
    <CrudPage
      title="VISUAL INSPECTION"
      subtitle="Visual findings & condition scoring (09_Visual) — auto-recalculates Asset Health Index"
      api={visualApi}
      idField="id"
      columns={columns}
      fields={fields}
      searchKeys={['asset_id', 'finding']}
      filters={[{ key: 'severity', label: 'Severity', options: SEVERITIES }]}
      badgeKeys={[]}
      linkKeys={['asset_id']}
      defaultSort={(a, b) => new Date(b.inspection_date || 0) - new Date(a.inspection_date || 0)}
    />
  );
}
