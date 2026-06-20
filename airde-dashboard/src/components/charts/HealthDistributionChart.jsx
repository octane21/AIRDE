import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { healthDistribution } from '../../data/dashboardData';

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }) => {
  if (pct < 3) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {pct}%
    </text>
  );
};

export default function HealthDistributionChart({ data }) {
  const chartData = data && data.length ? data : healthDistribution;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={<CustomLabel />}
          outerRadius={85}
          innerRadius={40}
          dataKey="count"
          nameKey="label"
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#0d1f3c', border: '1px solid #1e2d4f', borderRadius: 8, fontSize: 11 }}
          labelStyle={{ color: '#e2e8f0' }}
          formatter={(val, name, props) => [`${val} assets (${props.payload.pct}%)`, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
          formatter={(value, entry) => `${value} (${entry.payload.range})`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
