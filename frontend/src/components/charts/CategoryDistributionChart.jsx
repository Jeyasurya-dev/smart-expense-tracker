import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getCategoryMeta } from '../../utils/categories';
import { formatCurrency } from '../../utils/format';

const CategoryDistributionChart = ({ data = [] }) => {
  const chartData = data.map((d) => ({ name: d.category, value: d.total, color: getCategoryMeta(d.category).color }));

  if (!chartData.length) {
    return <div className="h-60 flex items-center justify-center text-white/40 text-sm">No expense data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={95} label={(e) => e.name}>
          {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 12, color: '#fff' }} />
        <Legend wrapperStyle={{ color: '#fff', fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryDistributionChart;
