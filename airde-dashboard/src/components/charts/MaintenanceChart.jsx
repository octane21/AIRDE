import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { maintenanceStrategy } from '../../data/dashboardData';

export default function MaintenanceChart({ data }) {
  const chartData = data && data.length ? data : maintenanceStrategy;
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#1e2d4f' }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0d1f3c', border: '1px solid #1e2d4f', borderRadius: 8, fontSize: 11 }}
          formatter={(v, n, props) => [`${v} (${props.payload.pct}%)`, 'Count']}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
