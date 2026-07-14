import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import GlassPanel from '../components/GlassPanel';
import { SkeletonRows } from '../components/Skeleton';
import { getBudgets, saveBudget, deleteBudget } from '../services/api';
import { CATEGORIES, getCategoryMeta } from '../utils/categories';
import { formatCurrency } from '../utils/format';
import { useToast } from '../context/ToastContext';

const currentMonth = () => new Date().toISOString().slice(0, 7);

const Budgets = () => {
  const { showToast } = useToast();
  const [month, setMonth] = useState(currentMonth());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'Food', limitAmount: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBudgets(month);
      setBudgets(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.limitAmount || Number(form.limitAmount) <= 0) {
      return showToast('Enter a valid budget amount', 'error');
    }
    try {
      await saveBudget({ ...form, month });
      showToast('Budget saved', 'success');
      setForm({ category: 'Food', limitAmount: '' });
      load();
    } catch (err) {
      showToast(err.message || 'Failed to save budget', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      showToast('Budget removed', 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <GlassPanel
        title="Budget Management"
        action={
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="bg-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none" />
        }
      >
        <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-2 mb-5">
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none flex-1">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="number" min="0" step="0.01" placeholder="Monthly limit"
            value={form.limitAmount} onChange={(e) => setForm((f) => ({ ...f, limitAmount: e.target.value }))}
            className="bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none flex-1"
          />
          <button className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 rounded-xl text-sm font-medium text-white">
            <Plus className="w-4 h-4" /> Set Budget
          </button>
        </form>

        {loading ? <SkeletonRows rows={4} /> : (
          <div className="flex flex-col gap-3">
            {budgets.map((b) => {
              const meta = getCategoryMeta(b.category);
              const Icon = meta.icon;
              const pct = Math.min(100, (b.spent / b.limitAmount) * 100 || 0);
              const over = b.spent > b.limitAmount;
              return (
                <div key={b.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}>
                        <Icon className={`w-4 h-4 ${meta.text}`} />
                      </div>
                      <span className="text-sm text-white font-medium">{b.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${over ? 'text-red-400' : 'text-white/60'}`}>
                        {formatCurrency(b.spent)} / {formatCurrency(b.limitAmount)}
                      </span>
                      <button onClick={() => handleDelete(b.id)} className="text-white/40 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && <div className="text-center py-8 text-white/40 text-sm">No budgets set for this month.</div>}
          </div>
        )}
      </GlassPanel>
    </div>
  );
};

export default Budgets;
