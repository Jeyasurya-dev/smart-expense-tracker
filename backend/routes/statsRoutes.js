import express from 'express';
import { getSummaryHandler, getChartsHandler } from '../controllers/statsController.js';

const router = express.Router();

router.get('/summary', getSummaryHandler);
router.get('/charts', getChartsHandler);

export default router;
