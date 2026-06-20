import CrudPage from '../components/crud/CrudPage';
import { utApi } from '../services/api';

const fields = [
  { key: 'asset_id', label: 'Asset ID', required: true },
  { key: 'reading_date', label: 'Date', type: 'date' },
  { key: 'kp_location', label: 'KP / Location' },
  { key: 't_design', label: 'T Design (mm)', type: 'number', required: true },
  { key: 'deg0', label: '0° Top (mm)', type: 'number', required: true },
  { key: 'deg90', label: '90° Right (mm)', type: 'number', required: true },
  { key: 'deg180', label: '180° Bottom (mm)', type: 'number', required: true },
  { key: 'deg270', label: '270° Left (mm)', type: 'number', required: true },
  { key: 'tmin_required', label: 'Tmin Required (mm)', type: 'number', required: true },
];

const columns = [
  { key: 'asset_id', label: 'Asset ID' },
  { key: 'reading_date', label: 'Date', render: r => r.reading_date ? String(r.reading_date).slice(0, 10) : '-' },
  { key: 'kp_location', label: 'KP / Location' },
  { key: 't_design', label: 'T Design' },
  { key: 'deg0', label: '0° Top' },
  { key: 'deg90', label: '90° Right' },
  { key: 'deg180', label: '180° Bottom' },
  { key: 'deg270', label: '270° Left' },
  { key: 't_actual_min', label: 'T Actual Min' },
  { key: 'tmin_required', label: 'Tmin Req.' },
  { key: 'thickness_health', label: 'Thickness Health %', render: r => Number(r.thickness_health).toFixed(1) + '%' },
  { key: 'corrosion_rate', label: 'CR (mm/y)', render: r => Number(r.corrosion_rate).toFixed(3) },
  { key: 'remaining_life', label: 'Rem. Life (y)', render: r => Number(r.remaining_life).toFixed(1) },
  { key: 'ut_status', label: 'UT Status' },
];

export default function UT() {
  return (
    <CrudPage
      title="UT — ULTRASONIC THICKNESS"
      subtitle="4-point thickness readings (08_UT) — auto-recalculates corrosion rate & remaining life"
      api={utApi}
      idField="id"
      columns={columns}
      fields={fields}
      searchKeys={['asset_id']}
      filters={[{ key: 'ut_status', label: 'Status', options: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'] }]}
      badgeKeys={['ut_status']}
      linkKeys={['asset_id']}
      defaultSort={(a, b) => new Date(b.reading_date || 0) - new Date(a.reading_date || 0)}
    />
  );
}
