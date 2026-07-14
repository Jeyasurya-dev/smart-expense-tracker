import express from 'express';
import { getGoalsHandler, createGoalHandler, updateGoalHandler, deleteGoalHandler } from '../controllers/goalController.js';

const router = express.Router();

router.get('/', getGoalsHandler);
router.post('/', createGoalHandler);
router.put('/:id', updateGoalHandler);
router.delete('/:id', deleteGoalHandler);

export default router;
