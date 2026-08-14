import express from 'express';
import {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from '../controllers/policyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPolicies)
  .post(protect, authorize('admin', 'agent'), createPolicy);

router.route('/:id')
  .put(protect, authorize('admin', 'agent'), updatePolicy)
  .delete(protect, authorize('admin', 'agent'), deletePolicy);

export default router;
