import CrudPage from '../components/crud/CrudPage';
import { maintenanceStrategyApi } from '../services/api';

const PRIORITY_OPTIONS = ['P0', 'P1', 'P2', 'P3'];

const fields = [
  { key: 'strategy', label: 'Strategy', required: true, disabledOnEdit: true },
  { key: 'definition', label: 'Definition', fullWidth: true },
  { key: 'typical_condition', label: 'Typical Condition' },
  { key: 'example_actions', label: 'Recommended Action (dipakai langsung di Action Register)', fullWidth: true },
  { key: 'priority', label: 'Priority (dipakai langsung di Action Register)', type: 'select', options: PRIORITY_OPTIONS, default: 'P2' },
  { key: 'due_days', label: 'Due Days (jarak hari ke Due Date)', type: 'number', default: 180 },
];

const columns = [
  { key: 'strategy', label: 'Strategy' },
  { key: 'definition', label: 'Definition' },
  { key: 'typical_condition', label: 'Typical Condition' },
  { key: 'example_actions', label: 'Recommended Action' },
  { key: 'priority', label: 'Priority' },
  { key: 'due_days', label: 'Due Days' },
];

export default function MaintenanceStrategy() {
  return (
    <CrudPage
      title="MAINTENANCE STRATEGY REFERENCE"
      subtitle="Recommended Action, Priority & Due Days di sini dipakai LANGSUNG oleh calculation engine saat membuat Action Register / Maintenance Plan / Work Order (18_Maintenance_Strategy)"
      api={maintenanceStrategyApi}
      idField="strategy"
      columns={columns}
      fields={fields}
      searchKeys={['strategy']}
      adminOnlyDelete={true}
      adminOnlyWrite={true}
      respectGlobalFilter={false}
    />
  );
}
