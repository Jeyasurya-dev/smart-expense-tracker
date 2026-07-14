import express from 'express';
import { exportBackup, importBackup, importCSV } from '../controllers/backupController.js';

const router = express.Router();

router.get('/export', exportBackup);
router.post('/import', importBackup);
router.post('/import-csv', importCSV);

export default router;
