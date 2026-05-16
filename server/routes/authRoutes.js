import express from 'express';
import {
  register, login, getProfile, updateProfile,
  addAddress, updateAddress, deleteAddress,
  forgotPassword, resetPassword, toggleWishlist,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

router.post('/wishlist/:productId', protect, toggleWishlist);

export default router;
