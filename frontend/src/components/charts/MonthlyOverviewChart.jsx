import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, monthLabel } from '../../utils/format';

const MonthlyOverviewChart = ({ data = [] }) => {
  const chartData = data.map((d) => ({ ...d, label: monthLabel(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 12, color: '#fff' }} />
        <Legend wrapperStyle={{ color: '#fff', fontSize: 12 }} />
        <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
        <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyOverviewChart;
