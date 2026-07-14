import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import GlassPanel from '../components/GlassPanel';
import { SkeletonRows } from '../components/Skeleton';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/api';
import { formatCurrency } from '../utils/format';
import { useToast } from '../context/ToastContext';

const Goals = () => {
  const { showToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getGoals();
      setGoals(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.targetAmount) return showToast('Enter goal name and target amount', 'error');
    try {
      await createGoal(form);
      showToast('Goal created', 'success');
      setForm({ name: '', targetAmount: '', deadline: '' });
      load();
    } catch (err) {
      showToast(err.message || 'Failed to create goal', 'error');
    }
  };

  const addProgress = async (goal, amount) => {
    try {
      await updateGoal(goal.id, { currentAmount: Number(goal.currentAmount) + amount });
      load();
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      showToast('Goal deleted', 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <GlassPanel title="Savings Goals">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-2 mb-5">
          <input
            placeholder="Goal name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none flex-1"
          />
          <input
            type="number" min="0" step="0.01" placeholder="Target amount" value={form.targetAmount}
            onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
            className="bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none flex-1"
          />
          <input
            type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            className="bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
          />
          <button className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 rounded-xl text-sm font-medium text-white">
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        </form>

        {loading ? <SkeletonRows rows={3} /> : (
          <div className="grid md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100 || 0);
              return (
                <div key={g.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{g.name}</div>
                        {g.deadline && <div className="text-[11px] text-white/40">by {g.deadline}</div>}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(g.id)} className="text-white/40 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                    <span>{formatCurrency(g.currentAmount)} of {formatCurrency(g.targetAmount)}</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addProgress(g, 1000)} className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg text-white">+₹1,000</button>
                    <button onClick={() => addProgress(g, 5000)} className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg text-white">+₹5,000</button>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && <div className="text-center py-8 text-white/40 text-sm col-span-2">No savings goals yet.</div>}
          </div>
        )}
      </GlassPanel>
    </div>
  );
};

export default Goals;
