import { run, get, all } from '../config/db.js';

export const upsertBudget = async ({ category, month, limitAmount }) => {
  await run(
    `INSERT INTO budgets (category, month, limitAmount) VALUES (?, ?, ?)
     ON CONFLICT(category, month) DO UPDATE SET limitAmount = excluded.limitAmount`,
    [category, month, parseFloat(limitAmount)]
  );
  return get('SELECT * FROM budgets WHERE category = ? AND month = ?', [category, month]);
};

export const getBudgets = (month) => {
  if (month) return all('SELECT * FROM budgets WHERE month = ? ORDER BY category', [month]);
  return all('SELECT * FROM budgets ORDER BY month DESC, category');
};

export const deleteBudget = async (id) => {
  const existing = await get('SELECT * FROM budgets WHERE id = ?', [id]);
  if (!existing) return null;
  await run('DELETE FROM budgets WHERE id = ?', [id]);
  return existing;
};

export const getBudgetSpending = async (month) => {
  // month format YYYY-MM
  const rows = await all(
    `SELECT category, SUM(amount) as spent FROM transactions
     WHERE type = 'expense' AND strftime('%Y-%m', date) = ?
     GROUP BY category`,
    [month]
  );
  const map = {};
  rows.forEach((r) => { map[r.category] = r.spent; });
  return map;
};
