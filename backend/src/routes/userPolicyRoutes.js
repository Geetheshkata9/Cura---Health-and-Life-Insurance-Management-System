import express from 'express';
import { getMyPolicies, buyPolicy, getAllUserPolicies } from '../controllers/userPolicyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'agent'), getAllUserPolicies);

router.get('/my', protect, getMyPolicies);
router.post('/buy', protect, buyPolicy);

export default router;
