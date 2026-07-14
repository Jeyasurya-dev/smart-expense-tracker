import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

const unwrap = (p) => p.then((r) => r.data).catch((e) => { throw e.response?.data || { message: e.message }; });

// Transactions
export const getTransactions = (params) => unwrap(api.get('/transactions', { params }));
export const getTransaction = (id) => unwrap(api.get(`/transactions/${id}`));
export const createTransaction = (data) => unwrap(api.post('/transactions', data));
export const updateTransaction = (id, data) => unwrap(api.put(`/transactions/${id}`, data));
export const duplicateTransaction = (id) => unwrap(api.post(`/transactions/${id}/duplicate`));
export const deleteTransaction = (id) => unwrap(api.delete(`/transactions/${id}`));
export const getCategories = () => unwrap(api.get('/transactions/categories'));

// Stats
export const getSummary = () => unwrap(api.get('/stats/summary'));
export const getCharts = () => unwrap(api.get('/stats/charts'));

// Budgets
export const getBudgets = (month) => unwrap(api.get('/budgets', { params: { month } }));
export const saveBudget = (data) => unwrap(api.post('/budgets', data));
export const deleteBudget = (id) => unwrap(api.delete(`/budgets/${id}`));

// Goals
export const getGoals = () => unwrap(api.get('/goals'));
export const createGoal = (data) => unwrap(api.post('/goals', data));
export const updateGoal = (id, data) => unwrap(api.put(`/goals/${id}`, data));
export const deleteGoal = (id) => unwrap(api.delete(`/goals/${id}`));

// Export
export const getExportUrl = (format, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return `${API_URL}/api/export/${format}${query ? `?${query}` : ''}`;
};

// Backup
export const getBackupUrl = () => `${API_URL}/api/backup/export`;
export const importBackup = (data) => unwrap(api.post('/backup/import', data));
export const importCSVRows = (rows) => unwrap(api.post('/backup/import-csv', { rows }));

// Upload
export const uploadReceipt = (file) => {
  const form = new FormData();
  form.append('receipt', file);
  return unwrap(api.post('/upload/receipt', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
};

export const API_BASE = API_URL;
export default api;
