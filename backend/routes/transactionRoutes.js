import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransactionHandler,
  updateTransactionHandler,
  duplicateTransactionHandler,
  deleteTransaction,
  getCategories,
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', createTransactionHandler);
router.post('/:id/duplicate', duplicateTransactionHandler);
router.put('/:id', updateTransactionHandler);
router.delete('/:id', deleteTransaction);

export default router;
