import CrudPage from '../components/crud/CrudPage';
import { criticalityApi } from '../services/api';

const LEVELS = ['LOW', 'MEDIUM', 'HIGH'];

const fields = [
  { key: 'asset_id', label: 'Asset ID', required: true, disabledOnEdit: true },
  { key: 'safety', label: 'Safety (1-5)', type: 'number' },
  { key: 'environment', label: 'Environment (1-5)', type: 'number' },
  { key: 'operation', label: 'Operation (1-5)', type: 'number' },
  { key: 'financial', label: 'Financial (1-5)', type: 'number' },
  { key: 'criticality', label: 'Criticality', type: 'select', options: LEVELS, default: 'MEDIUM' },
];

const columns = [
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'safety', label: 'Safety' },
  { key: 'environment', label: 'Environment' },
  { key: 'operation', label: 'Operation' },
  { key: 'financial', label: 'Financial' },
  { key: 'criticality_score', label: 'Score' },
  { key: 'criticality', label: 'Criticality' },
];

export default function Criticality() {
  return (
    <CrudPage
      title="CRITICALITY ASSESSMENT"
      subtitle="Safety / Environment / Operation / Financial scoring (05_Criticality)"
      api={criticalityApi}
      idField="asset_id"
      columns={columns}
      fields={fields}
      searchKeys={['asset_id']}
      filters={[{ key: 'criticality', label: 'Criticality', options: LEVELS }]}
      badgeKeys={['criticality']}
      linkKeys={['asset_id']}
      defaultSort={(a, b) => (b.criticality_score ?? 0) - (a.criticality_score ?? 0)}
    />
  );
}
