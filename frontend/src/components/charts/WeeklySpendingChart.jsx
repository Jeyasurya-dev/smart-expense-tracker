import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from '../../utils/format';

const WeeklySpendingChart = ({ data = [] }) => {
  const chartData = data.map((d) => ({ ...d, label: formatDate(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 12, color: '#fff' }} />
        <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#weeklyGradient)" strokeWidth={2} name="Spending" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeeklySpendingChart;
