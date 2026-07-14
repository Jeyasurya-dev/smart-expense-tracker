import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/format';

const IncomeExpenseChart = ({ data }) => {
  const chartData = [
    { name: 'Income', value: data?.income || 0, color: '#10b981' },
    { name: 'Expense', value: data?.expense || 0, color: '#ef4444' },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
        >
          {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 12, color: '#fff' }} />
        <Legend wrapperStyle={{ color: '#fff', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseChart;
