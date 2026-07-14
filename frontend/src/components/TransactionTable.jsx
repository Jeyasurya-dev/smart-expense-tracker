import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Copy, ArrowUpDown, Image as ImageIcon } from 'lucide-react';
import { getCategoryMeta } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/format';
import { API_BASE } from '../services/api';

const TransactionTable = ({
  transactions, selected, onToggleSelect, onToggleSelectAll,
  onEdit, onDelete, onDuplicate, sortBy, sortOrder, onSort,
}) => {
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-white">
        <thead>
          <tr className="text-left text-white/50 text-xs uppercase tracking-wide border-b border-white/10">
            <th className="py-3 pl-2 pr-2 w-8">
              <input type="checkbox" checked={selected.length > 0 && selected.length === transactions.length} onChange={onToggleSelectAll} />
            </th>
            {columns.map((c) => (
              <th key={c.key} className="py-3 px-2 cursor-pointer select-none" onClick={() => onSort(c.key)}>
                <span className="flex items-center gap-1">
                  {c.label}
                  {sortBy === c.key && <ArrowUpDown className="w-3 h-3" />}
                </span>
              </th>
            ))}
            <th className="py-3 px-2">Notes</th>
            <th className="py-3 px-2 text-right pr-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => {
            const meta = getCategoryMeta(t.category);
            const Icon = meta.icon;
            return (
              <motion.tr
                key={t.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 pl-2 pr-2">
                  <input type="checkbox" checked={selected.includes(t.id)} onChange={() => onToggleSelect(t.id)} />
                </td>
                <td className="py-3 px-2 whitespace-nowrap text-white/70">{formatDate(t.date)}</td>
                <td className="py-3 px-2 font-medium">
                  <div className="flex items-center gap-1.5">
                    {t.title}
                    {t.receiptImage && (
                      <a href={`${API_BASE}${t.receiptImage}`} target="_blank" rel="noreferrer" title="View receipt">
                        <ImageIcon className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${meta.bg} ${meta.text}`}>
                    <Icon className="w-3 h-3" /> {t.category}
                  </span>
                </td>
                <td className={`py-3 px-2 font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </td>
                <td className="py-3 px-2 text-white/50 max-w-[160px] truncate">{t.notes || '-'}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => onDuplicate(t.id)} title="Duplicate" className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onEdit(t)} title="Edit" className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(t)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      {transactions.length === 0 && (
        <div className="text-center py-12 text-white/40 text-sm">No transactions found</div>
      )}
    </div>
  );
};

export default TransactionTable;
