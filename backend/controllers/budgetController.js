import { upsertBudget, getBudgets, deleteBudget, getBudgetSpending } from '../models/Budget.js';

export const getBudgetsHandler = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await getBudgets(month);
    const spending = await getBudgetSpending(month);
    const data = budgets.map((b) => ({ ...b, spent: spending[b.category] || 0 }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching budgets', error: error.message });
  }
};

export const upsertBudgetHandler = async (req, res) => {
  try {
    const { category, month, limitAmount } = req.body;
    if (!category || !month || limitAmount === undefined) {
      return res.status(400).json({ success: false, message: 'category, month, limitAmount are required' });
    }
    const budget = await upsertBudget({ category, month, limitAmount });
    res.status(200).json({ success: true, message: 'Budget saved', data: budget });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error saving budget', error: error.message });
  }
};

export const deleteBudgetHandler = async (req, res) => {
  try {
    const budget = await deleteBudget(req.params.id);
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    res.status(200).json({ success: true, message: 'Budget deleted', data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting budget', error: error.message });
  }
};
