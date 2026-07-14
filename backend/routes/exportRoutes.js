import express from 'express';
import { exportHandler } from '../controllers/exportController.js';

const router = express.Router();

router.get('/:format', exportHandler);

export default router;
