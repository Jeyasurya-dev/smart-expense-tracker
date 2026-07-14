import { run, get, all } from '../config/db.js';

export const createGoal = async ({ name, targetAmount, currentAmount = 0, deadline = null }) => {
  const result = await run(
    'INSERT INTO goals (name, targetAmount, currentAmount, deadline) VALUES (?, ?, ?, ?)',
    [name.trim(), parseFloat(targetAmount), parseFloat(currentAmount) || 0, deadline]
  );
  return get('SELECT * FROM goals WHERE id = ?', [result.lastID]);
};

export const getGoals = () => all('SELECT * FROM goals ORDER BY createdAt DESC');

export const updateGoal = async (id, data) => {
  const existing = await get('SELECT * FROM goals WHERE id = ?', [id]);
  if (!existing) return null;
  const merged = { ...existing, ...data };
  await run(
    'UPDATE goals SET name = ?, targetAmount = ?, currentAmount = ?, deadline = ? WHERE id = ?',
    [merged.name, parseFloat(merged.targetAmount), parseFloat(merged.currentAmount), merged.deadline, id]
  );
  return get('SELECT * FROM goals WHERE id = ?', [id]);
};

export const deleteGoal = async (id) => {
  const existing = await get('SELECT * FROM goals WHERE id = ?', [id]);
  if (!existing) return null;
  await run('DELETE FROM goals WHERE id = ?', [id]);
  return existing;
};
