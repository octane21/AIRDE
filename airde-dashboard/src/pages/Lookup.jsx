import CrudPage from '../components/crud/CrudPage';
import { lookupApi } from '../services/api';

const fields = [
  { key: 'category', label: 'Category', required: true },
  { key: 'value', label: 'Value', required: true },
  { key: 'min_value', label: 'Min Value (ambang bawah, dipakai engine)', type: 'number' },
  { key: 'max_value', label: 'Max Value (referensi tampilan)', type: 'number' },
  { key: 'description', label: 'Description', fullWidth: true },
];

const columns = [
  { key: 'category', label: 'Category' },
  { key: 'value', label: 'Value' },
  { key: 'min_value', label: 'Min Value' },
  { key: 'max_value', label: 'Max Value' },
  { key: 'description', label: 'Description' },
];

export default function Lookup() {
  return (
    <CrudPage
      title="LOOKUP REFERENCE"
      subtitle="Ambang batas Health Status (AHI), Risk Level, Coating Status & Thickness Status — Min Value di sini dipakai LANGSUNG oleh calculation engine untuk mengkategorikan AHI/Risk Score/Coating Health/Thickness Health (98_Lookup)"
      api={lookupApi}
      idField="id"
      columns={columns}
      fields={fields}
      searchKeys={['category', 'value']}
      filters={[{ key: 'category', label: 'Category', options: ['Health Status', 'Risk Level', 'Coating Status', 'Thickness Status'] }]}
      adminOnlyWrite={true}
      respectGlobalFilter={false}
      defaultSort={(a, b) => a.category.localeCompare(b.category) || Number(b.min_value ?? 0) - Number(a.min_value ?? 0)}
    />
  );
}
