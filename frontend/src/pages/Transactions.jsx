import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Download, Trash2 } from 'lucide-react';
import GlassPanel from '../components/GlassPanel';
import TransactionModal from '../components/TransactionModal';
import TransactionTable from '../components/TransactionTable';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonRows } from '../components/Skeleton';
import {
  getTransactions, createTransaction, updateTransaction,
  deleteTransaction, duplicateTransaction, getExportUrl,
} from '../services/api';
import { CATEGORIES } from '../utils/categories';
import { useToast } from '../context/ToastContext';

const EXPORT_FORMATS = ['csv', 'pdf', 'excel', 'docx', 'md'];

const Transactions = () => {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getTransactions({
        search, category, type, sortBy, sortOrder, page, limit: 10,
      });
      setRows(res.data);
      setPagination(res.pagination);
      setSelected([]);
    } catch (err) {
      showToast(err.message || 'Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, type, sortBy, sortOrder]);

  useEffect(() => { load(1); }, [load]);

  const handleSort = (key) => {
    if (sortBy === key) setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    else { setSortBy(key); setSortOrder('DESC'); }
  };

  const handleSubmit = async (form) => {
    try {
      if (editing) {
        await updateTransaction(editing.id, form);
        showToast('Transaction updated', 'success');
      } else {
        await createTransaction(form);
        showToast('Transaction added', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      load(pagination.page);
    } catch (err) {
      showToast(err.message || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction(confirmTarget.id);
      showToast('Transaction deleted', 'success');
      setConfirmTarget(null);
      load(pagination.page);
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateTransaction(id);
      showToast('Transaction duplicated', 'success');
      load(pagination.page);
    } catch (err) {
      showToast(err.message || 'Duplicate failed', 'error');
    }
  };

  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleSelectAll = () => setSelected(selected.length === rows.length ? [] : rows.map((r) => r.id));

  const downloadExport = (preset) => {
    const params = { preset };
    if (selected.length && preset === 'selected') params.ids = selected.join(',');
    if (category) params.category = category;
    if (type) params.type = type;
    window.open(getExportUrl(exportFormat, params), '_blank');
  };

  return (
    <div className="flex flex-col gap-5">
      <GlassPanel>
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full bg-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select value={type} onChange={(e) => setType(e.target.value)} className="bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel
        title={`Transactions ${selected.length ? `(${selected.length} selected)` : ''}`}
        action={
          <div className="flex items-center gap-2">
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="bg-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none">
              {EXPORT_FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
            </select>
            <button onClick={() => downloadExport(selected.length ? 'selected' : 'complete')} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs text-white">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        }
      >
        {loading ? <SkeletonRows rows={8} /> : (
          <>
            <TransactionTable
              transactions={rows}
              selected={selected}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onEdit={(t) => { setEditing(t); setModalOpen(true); }}
              onDelete={(t) => setConfirmTarget(t)}
              onDuplicate={handleDuplicate}
              sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}
            />
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
          </>
        )}
      </GlassPanel>

      <TransactionModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete transaction?"
        message={confirmTarget ? `This will permanently remove "${confirmTarget.title}".` : ''}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};

export default Transactions;
