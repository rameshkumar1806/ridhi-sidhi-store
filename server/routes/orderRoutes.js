import express from 'express';
import {
  createOrder, createRazorpayOrder, verifyRazorpayPayment,
  getOrder, getMyOrders, cancelOrder,
  getAllOrders, updateOrderStatus, getDashboardStats, deleteOrder
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Razorpay
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Admin routes
router.get('/admin/all', protect, admin, getAllOrders);
router.put('/admin/:id/status', protect, admin, updateOrderStatus);
router.get('/admin/dashboard', protect, admin, getDashboardStats);
router.delete('/admin/:id', protect, admin, deleteOrder);

export default router;
