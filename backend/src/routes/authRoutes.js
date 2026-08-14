import express from 'express';
import { registerUser, loginUser, getProfile, getCustomers, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.get('/customers', protect, getCustomers);
router.put('/profile', protect, updateProfile);

export default router;
