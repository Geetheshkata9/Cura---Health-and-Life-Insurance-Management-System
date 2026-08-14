import express from 'express';
import { getMyPayments, makePayment, getAllPayments } from '../controllers/paymentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'agent'), getAllPayments)
  .post(protect, makePayment);

router.get('/my', protect, getMyPayments);

export default router;
