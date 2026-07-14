import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, accent = 'from-indigo-500 to-fuchsia-500', sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    whileHover={{ y: -4 }}
    className="glass rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
  >
    <div className="flex items-center justify-between">
      <span className="text-white/60 text-xs font-medium uppercase tracking-wide">{label}</span>
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
    {sub && <div className="text-xs text-white/50">{sub}</div>}
  </motion.div>
);

export default StatCard;
