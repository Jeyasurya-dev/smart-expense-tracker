import express from 'express';
import { getBudgetsHandler, upsertBudgetHandler, deleteBudgetHandler } from '../controllers/budgetController.js';

const router = express.Router();

router.get('/', getBudgetsHandler);
router.post('/', upsertBudgetHandler);
router.delete('/:id', deleteBudgetHandler);

export default router;
