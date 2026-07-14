import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from '../../utils/format';

const CashFlowChart = ({ data = [] }) => {
  const chartData = data.map((d) => ({ ...d, label: formatDate(d.date) }));

  if (!chartData.length) {
    return <div className="h-60 flex items-center justify-center text-white/40 text-sm">Not enough data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 12, color: '#fff' }} />
        <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Balance" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
