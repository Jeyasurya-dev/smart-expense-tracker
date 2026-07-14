import React from 'react';
import { motion } from 'framer-motion';

const GlassPanel = ({ title, action, children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className={`glass rounded-2xl p-5 ${className}`}
  >
    {(title || action) && (
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-white font-semibold text-sm tracking-wide">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </motion.div>
);

export default GlassPanel;
