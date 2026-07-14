import {
  queryTransactions,
  filterTransactions,
  createTransaction,
  updateTransaction,
  deleteTransactionById,
  duplicateTransaction,
  getTransactionById,
  validateTransaction,
  VALID_CATEGORIES,
} from '../models/Transaction.js';

export const getTransactions = async (req, res) => {
  try {
    const result = await queryTransactions(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching transactions', error: error.message });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const transaction = await getTransactionById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching transaction', error: error.message });
  }
};

export const createTransactionHandler = async (req, res) => {
  try {
    const errors = validateTransaction(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    const transaction = await createTransaction(req.body);
    res.status(201).json({ success: true, message: 'Transaction created successfully', data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating transaction', error: error.message });
  }
};

export const updateTransactionHandler = async (req, res) => {
  try {
    const transaction = await updateTransaction(req.params.id, req.body);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, message: 'Transaction updated successfully', data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating transaction', error: error.message });
  }
};

export const duplicateTransactionHandler = async (req, res) => {
  try {
    const transaction = await duplicateTransaction(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(201).json({ success: true, message: 'Transaction duplicated successfully', data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error duplicating transaction', error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await deleteTransactionById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, message: 'Transaction deleted successfully', data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting transaction', error: error.message });
  }
};

export const getCategories = async (_req, res) => {
  res.status(200).json({ success: true, data: VALID_CATEGORIES });
};

export { filterTransactions };
