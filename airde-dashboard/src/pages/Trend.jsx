import CrudPage from '../components/crud/CrudPage';
import TrendChart from '../components/charts/TrendChart';
import SectionHeader from '../components/ui/SectionHeader';
import { trendApi } from '../services/api';

const fields = [
  { key: 'snapshot_date', label: 'Month / Date', type: 'date', required: true },
  { key: 'avg_corrosion_rate', label: 'Avg Corrosion Rate (mm/y)', type: 'number', required: true },
  { key: 'avg_ahi', label: 'Avg AHI', type: 'number', required: true },
  { key: 'high_extreme_count', label: 'High/Extreme Risk Count', type: 'number', required: true },
];

const columns = [
  { key: 'snapshot_date', label: 'Month', render: r => new Date(r.snapshot_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric', timeZone: 'UTC' }) },
  { key: 'avg_corrosion_rate', label: 'Avg Corrosion Rate', render: r => Number(r.avg_corrosion_rate).toFixed(3) },
  { key: 'avg_ahi', label: 'Avg AHI' },
  { key: 'high_extreme_count', label: 'High/Extreme Risk Count' },
];

function toChartData(rows) {
  return [...rows]
    .sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date))
    .map(t => ({
      month: new Date(t.snapshot_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
      ahi: Number(t.avg_ahi), corrosionRate: Number(t.avg_corrosion_rate), highExtremeCount: t.high_extreme_count,
    }));
}

export default function Trend() {
  return (
    <CrudPage
      title="TREND"
      subtitle="Computed monthly snapshot — read-only (16_Trend)"
      api={trendApi}
      idField="id"
      columns={columns}
      fields={fields}
      readOnly={true}
      respectGlobalFilter={false}
      defaultSort={(a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date)}
      beforeTable={(rows) => {
        const chartData = toChartData(rows);
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { type: 'ahi', title: 'AHI Trend', sub: 'Average Asset Health Index' },
              { type: 'corrosion', title: 'Corrosion Rate Trend', sub: 'Average mm/year' },
              { type: 'risk', title: 'High/Extreme Risk Count', sub: 'Monthly risk exposure' },
            ].map(t => (
              <div key={t.type} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
                <SectionHeader title={t.title} subtitle={t.sub} />
                <TrendChart type={t.type} data={chartData} />
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
