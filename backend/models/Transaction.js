import { run, get, all } from '../config/db.js';

export const VALID_CATEGORIES = [
  'Salary', 'Food', 'Grocery', 'Bills', 'Shopping', 'Transport', 'Fuel',
  'Rent', 'EMI', 'Medical', 'Entertainment', 'Travel', 'Education',
  'Investment', 'Others',
];

export const validateTransaction = ({ title, amount, type, category }) => {
  const errors = [];
  if (!title || !String(title).trim()) errors.push('title is required');
  if (amount === undefined || amount === null || isNaN(amount) || Number(amount) <= 0) {
    errors.push('amount must be a positive number');
  }
  if (!['income', 'expense'].includes(type)) errors.push("type must be 'income' or 'expense'");
  if (category && !VALID_CATEGORIES.includes(category)) errors.push('invalid category');
  return errors;
};

export const createTransaction = async (data) => {
  const {
    title, amount, type, category = 'Others', date, notes = '', tags = '',
    receiptImage = null, isRecurring = false, recurringFrequency = null,
  } = data;

  const txDate = date || new Date().toISOString().slice(0, 10);

  const result = await run(
    `INSERT INTO transactions
      (title, amount, type, category, date, notes, tags, receiptImage, isRecurring, recurringFrequency)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title.trim(), parseFloat(amount), type, category, txDate, notes, tags,
      receiptImage, isRecurring ? 1 : 0, recurringFrequency]
  );
  return get('SELECT * FROM transactions WHERE id = ?', [result.lastID]);
};

export const updateTransaction = async (id, data) => {
  const existing = await get('SELECT * FROM transactions WHERE id = ?', [id]);
  if (!existing) return null;

  const merged = { ...existing, ...data };
  await run(
    `UPDATE transactions SET
      title = ?, amount = ?, type = ?, category = ?, date = ?, notes = ?,
      tags = ?, receiptImage = ?, isRecurring = ?, recurringFrequency = ?
     WHERE id = ?`,
    [merged.title, parseFloat(merged.amount), merged.type, merged.category,
      merged.date, merged.notes, merged.tags, merged.receiptImage,
      merged.isRecurring ? 1 : 0, merged.recurringFrequency, id]
  );
  return get('SELECT * FROM transactions WHERE id = ?', [id]);
};

export const duplicateTransaction = async (id) => {
  const existing = await get('SELECT * FROM transactions WHERE id = ?', [id]);
  if (!existing) return null;
  return createTransaction({
    ...existing,
    date: new Date().toISOString().slice(0, 10),
  });
};

export const deleteTransactionById = async (id) => {
  const existing = await get('SELECT * FROM transactions WHERE id = ?', [id]);
  if (!existing) return null;
  await run('DELETE FROM transactions WHERE id = ?', [id]);
  return existing;
};

export const getTransactionById = (id) =>
  get('SELECT * FROM transactions WHERE id = ?', [id]);

// Query with search/filter/sort/pagination
export const queryTransactions = async ({
  search = '', category, type, tags, startDate, endDate,
  sortBy = 'date', sortOrder = 'DESC', page = 1, limit = 10,
}) => {
  const where = [];
  const params = [];

  if (search) {
    where.push('(title LIKE ? OR notes LIKE ? OR tags LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (category) { where.push('category = ?'); params.push(category); }
  if (type) { where.push('type = ?'); params.push(type); }
  if (tags) { where.push('tags LIKE ?'); params.push(`%${tags}%`); }
  if (startDate) { where.push('date >= ?'); params.push(startDate); }
  if (endDate) { where.push('date <= ?'); params.push(endDate); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const allowedSort = ['date', 'amount', 'title', 'category', 'createdAt'];
  const sortCol = allowedSort.includes(sortBy) ? sortBy : 'date';
  const order = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countRow = await get(
    `SELECT COUNT(*) as total FROM transactions ${whereClause}`, params
  );
  const total = countRow ? countRow.total : 0;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.max(1, parseInt(limit) || 10);
  const offset = (pageNum - 1) * pageSize;

  const rows = await all(
    `SELECT * FROM transactions ${whereClause}
     ORDER BY ${sortCol} ${order}, id ${order}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return {
    data: rows,
    pagination: {
      total, page: pageNum, limit: pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
};

// For exports/stats — same filters but no pagination
export const filterTransactions = async ({
  category, type, startDate, endDate, ids,
} = {}) => {
  const where = [];
  const params = [];
  if (category) { where.push('category = ?'); params.push(category); }
  if (type) { where.push('type = ?'); params.push(type); }
  if (startDate) { where.push('date >= ?'); params.push(startDate); }
  if (endDate) { where.push('date <= ?'); params.push(endDate); }
  if (ids && ids.length) {
    where.push(`id IN (${ids.map(() => '?').join(',')})`);
    params.push(...ids);
  }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return all(`SELECT * FROM transactions ${whereClause} ORDER BY date DESC, id DESC`, params);
};

export const getAllTransactions = () =>
  all('SELECT * FROM transactions ORDER BY date DESC, id DESC');
