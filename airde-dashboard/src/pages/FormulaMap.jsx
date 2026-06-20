import CrudPage from '../components/crud/CrudPage';
import { formulaMapApi } from '../services/api';

const fields = [
  { key: 'engine', label: 'Engine', required: true },
  { key: 'sheet', label: 'Sheet', required: true },
  { key: 'formula', label: 'Formula / Link', type: 'textarea', fullWidth: true, required: true },
  { key: 'purpose', label: 'Purpose' },
  { key: 'feeds_to', label: 'Feeds To' },
];

const columns = [
  { key: 'engine', label: 'Engine' },
  { key: 'sheet', label: 'Sheet' },
  { key: 'formula', label: 'Formula / Link' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'feeds_to', label: 'Feeds To' },
];

export default function FormulaMap() {
  return (
    <CrudPage
      title="FORMULA MAP"
      subtitle="How each engine calculates & links data across the app (22_Formula_Map)"
      api={formulaMapApi}
      idField="id"
      columns={columns}
      fields={fields}
      searchKeys={['engine', 'sheet']}
      adminOnlyWrite={true}
      respectGlobalFilter={false}
    />
  );
}
