import CrudPage from '../components/crud/CrudPage';
import { dftApi } from '../services/api';

const fields = [
  { key: 'asset_id', label: 'Asset ID', required: true },
  { key: 'reading_date', label: 'Date', type: 'date' },
  { key: 'kp_location', label: 'KP / Location' },
  { key: 'dft_target', label: 'DFT Target (µm)', type: 'number', required: true },
  { key: 'dft_actual', label: 'DFT Actual (µm)', type: 'number', required: true },
  { key: 'coating_type', label: 'Coating Type' },
];

const columns = [
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'reading_date', label: 'Date', render: r => r.reading_date ? String(r.reading_date).slice(0, 10) : '-' },
  { key: 'kp_location', label: 'KP / Location' },
  { key: 'dft_target', label: 'DFT Target' },
  { key: 'dft_actual', label: 'DFT Actual' },
  { key: 'coating_health', label: 'Coating Health %', render: r => Number(r.coating_health).toFixed(1) + '%' },
  { key: 'coating_status', label: 'Coating Status' },
  { key: 'coating_type', label: 'Coating Type' },
];

export default function DFT() {
  return (
    <CrudPage
      title="DFT — COATING THICKNESS"
      subtitle="Dry Film Thickness measurements (07_DFT) — auto-recalculates Asset Health Index"
      api={dftApi}
      idField="id"
      columns={columns}
      fields={fields}
      searchKeys={['asset_id']}
      filters={[{ key: 'coating_status', label: 'Status', options: ['GOOD', 'FAIR', 'POOR'] }]}
      badgeKeys={['coating_status']}
      linkKeys={['asset_id']}
      defaultSort={(a, b) => new Date(b.reading_date || 0) - new Date(a.reading_date || 0)}
    />
  );
}
