import express from 'express';
import { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.get('/admin', protect, admin, getCoupons);
router.post('/admin', protect, admin, createCoupon);
router.put('/admin/:id', protect, admin, updateCoupon);
router.delete('/admin/:id', protect, admin, deleteCoupon);

export default router;
