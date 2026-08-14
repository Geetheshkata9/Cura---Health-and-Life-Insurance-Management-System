import express from 'express';
import {
  submitClaim,
  getMyClaims,
  getAllClaims,
  updateClaimStatus,
} from '../controllers/claimController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.array('documents', 5), submitClaim)
  .get(protect, authorize('admin', 'agent'), getAllClaims);

router.get('/my-claims', protect, getMyClaims);

router.patch('/:id/status', protect, authorize('admin', 'agent'), updateClaimStatus);

export default router;
