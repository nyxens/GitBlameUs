import express from 'express';
import { login, signup, refresh, logout, verifyOTP, me, updateProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.get('/profile', authMiddleware, me);
router.put('/profile', authMiddleware, updateProfile);
router.patch('/profile', authMiddleware, updateProfile);

export default router;
