import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { CATEGORIES, getCategoryMeta } from '../utils/categories';
import { uploadReceipt } from '../services/api';

const emptyForm = {
  title: '', amount: '', type: 'expense', category: 'Others',
  date: new Date().toISOString().slice(0, 10), notes: '', tags: '',
  isRecurring: false, recurringFrequency: 'monthly', receiptImage: null,
};

const TransactionModal = ({ open, onClose, onSubmit, initial }) => {
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyForm, ...initial } : emptyForm);
      setErrors([]);
    }
  }, [open, initial]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadReceipt(file);
      set('receiptImage', res.data.url);
    } catch (err) {
      setErrors([err.message || 'Upload failed']);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = [];
    if (!form.title.trim()) errs.push('Title is required');
    if (!form.amount || Number(form.amount) <= 0) errs.push('Amount must be greater than 0');
    if (errs.length) return setErrors(errs);

    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="glass rounded-2xl p-6 w-full max-w-lg text-white max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{initial ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button type="button" onClick={onClose} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 mb-4 text-sm text-red-300">
                {errors.map((e) => <div key={e}>{e}</div>)}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-4">
              {['expense', 'income'].map((t) => (
                <button
                  type="button" key={t} onClick={() => set('type', t)}
                  className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                    form.type === t
                      ? t === 'income' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                className="col-span-2 bg-white/10 rounded-xl px-3 py-2.5 text-sm placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Title" value={form.title} onChange={(e) => set('title', e.target.value)}
              />
              <input
                type="number" step="0.01" min="0"
                className="bg-white/10 rounded-xl px-3 py-2.5 text-sm placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Amount" value={form.amount} onChange={(e) => set('amount', e.target.value)}
              />
              <input
                type="date"
                className="bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.date} onChange={(e) => set('date', e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="text-xs text-white/50 mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {CATEGORIES.map((c) => {
                  const meta = getCategoryMeta(c);
                  const Icon = meta.icon;
                  const active = form.category === c;
                  return (
                    <button
                      type="button" key={c} onClick={() => set('category', c)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        active ? `${meta.bg} ${meta.text} ring-1 ring-current` : 'bg-white/5 text-white/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              className="w-full bg-white/10 rounded-xl px-3 py-2.5 text-sm mb-3 placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => set('tags', e.target.value)}
            />
            <textarea
              className="w-full bg-white/10 rounded-xl px-3 py-2.5 text-sm mb-3 placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Notes" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)}
            />

            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={!!form.isRecurring} onChange={(e) => set('isRecurring', e.target.checked)} />
                Recurring
              </label>
              {form.isRecurring && (
                <select
                  className="bg-white/10 rounded-lg px-2 py-1 text-sm outline-none"
                  value={form.recurringFrequency} onChange={(e) => set('recurringFrequency', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer bg-white/5 rounded-xl px-3 py-2.5 hover:bg-white/10">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {form.receiptImage ? 'Receipt attached ✓' : 'Attach receipt image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            </div>

            <button
              type="submit" disabled={saving || uploading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? 'Save Changes' : 'Add Transaction'}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;
