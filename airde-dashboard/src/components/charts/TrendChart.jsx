import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart, Bar,
} from 'recharts';
import { trendData } from '../../data/dashboardData';

export default function TrendChart({ type = 'ahi', data }) {
  const chartData = data && data.length ? data : trendData;
  const config = {
    ahi: {
      key: 'ahi',
      label: 'Avg AHI',
      color: '#22c55e',
      domain: [65, 85],
    },
    corrosion: {
      key: 'corrosionRate',
      label: 'Corrosion Rate (mm/yr)',
      color: '#f97316',
      domain: [0.1, 0.2],
    },
    risk: {
      key: 'highExtremeCount',
      label: 'High/Extreme Count',
      color: '#ef4444',
      domain: [0, 6],
    },
  };

  const { key, label, color, domain } = config[type];

  return (
    <ResponsiveContainer width="100%" height={160}>
      <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4f" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#64748b', fontSize: 9 }}
          tickLine={false}
          axisLine={{ stroke: '#1e2d4f' }}
        />
        <YAxis
          domain={domain}
          tick={{ fill: '#64748b', fontSize: 9 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#0d1f3c', border: '1px solid #1e2d4f', borderRadius: 8, fontSize: 11 }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Area
          type="monotone"
          dataKey={key}
          stroke={color}
          strokeWidth={2}
          fill={color}
          fillOpacity={0.1}
          dot={{ fill: color, r: 3, strokeWidth: 0 }}
          name={label}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
