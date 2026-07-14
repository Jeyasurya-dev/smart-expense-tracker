import { createGoal, getGoals, updateGoal, deleteGoal } from '../models/Goal.js';

export const getGoalsHandler = async (_req, res) => {
  try {
    const goals = await getGoals();
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching goals', error: error.message });
  }
};

export const createGoalHandler = async (req, res) => {
  try {
    const { name, targetAmount } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({ success: false, message: 'name and targetAmount are required' });
    }
    const goal = await createGoal(req.body);
    res.status(201).json({ success: true, message: 'Goal created', data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating goal', error: error.message });
  }
};

export const updateGoalHandler = async (req, res) => {
  try {
    const goal = await updateGoal(req.params.id, req.body);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, message: 'Goal updated', data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating goal', error: error.message });
  }
};

export const deleteGoalHandler = async (req, res) => {
  try {
    const goal = await deleteGoal(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, message: 'Goal deleted', data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting goal', error: error.message });
  }
};
