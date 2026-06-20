import CrudPage from '../components/crud/CrudPage';
import { teamsApi } from '../services/api';

const fields = [
  { key: 'name', label: 'Team Name', required: true, disabledOnEdit: true },
  { key: 'lead', label: 'Team Lead' },
  { key: 'member_count', label: 'Member Count', type: 'number' },
  { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
];

const columns = [
  { key: 'name', label: 'Team Name' },
  { key: 'lead', label: 'Team Lead' },
  { key: 'member_count', label: 'Member Count' },
  { key: 'notes', label: 'Notes' },
];

export default function Team() {
  return (
    <CrudPage
      title="INSPECTION TEAM"
      subtitle="Tim inspeksi — dipakai sebagai pilihan Inspector pada halaman Inspection"
      api={teamsApi}
      idField="name"
      columns={columns}
      fields={fields}
      searchKeys={['name', 'lead']}
      adminOnlyWrite={true}
      respectGlobalFilter={false}
    />
  );
}
