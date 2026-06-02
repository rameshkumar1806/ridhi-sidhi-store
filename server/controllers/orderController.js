import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmationEmail } from '../utils/sendEmail.js';
import Notification from '../models/Notification.js';

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems, shippingAddress, paymentMethod,
    subtotal, shippingCharge, gst, discount, totalAmount, coupon,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  // Verify stock availability and prepare items
  const preparedItems = [];
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.name} not found`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }
    preparedItems.push({
      ...item,
      sku: product.sku
    });
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems: preparedItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCharge: shippingCharge || 0,
    gst: gst || 0,
    discount: discount || 0,
    totalAmount,
    coupon,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Reduce stock and increase soldCount
  for (const item of preparedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Create admin notification for the new order
  try {
    await Notification.create({
      title: 'New Order Placed',
      message: `Order #${order._id.toString().slice(-8).toUpperCase()} has been placed by ${req.user.name} for ₹${totalAmount}`,
      type: 'new_order',
      order: order._id,
      recipientRole: 'admin',
      metadata: {
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        customerName: req.user.name,
        amount: totalAmount,
      },
    });
  } catch (err) {
    console.error('Failed to create admin notification:', err.message);
  }

  // Send confirmation email (non-blocking)
  sendOrderConfirmationEmail(order, req.user).catch(console.error);

  await order.populate('user', 'name email');
  res.status(201).json({ success: true, data: order });
});

// @desc    Create Razorpay order
// @route   POST /api/orders/razorpay/create
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  try {
    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(amount * 100), // In paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ success: true, data: razorpayOrder });
  } catch (error) {
    res.status(500);
    throw new Error('Razorpay order creation failed: ' + error.message);
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/orders/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed - invalid signature');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.orderStatus = 'confirmed';
  order.paymentResult = {
    id: razorpay_payment_id,
    status: 'paid',
    update_time: new Date().toISOString(),
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  };
  order.statusHistory.push({ status: 'confirmed', note: 'Payment received' });

  await order.save();

  // Notify user that payment is verified and order is confirmed
  if (order.user) {
    try {
      await Notification.create({
        recipient: order.user,
        recipientRole: 'user',
        title: 'Order Confirmed',
        message: `Payment verified. Your order #${order._id.toString().slice(-8).toUpperCase()} has been confirmed!`,
        type: 'order_confirmed',
        order: order._id,
        metadata: {
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          amount: order.totalAmount,
        },
      });
    } catch (err) {
      console.error('Failed to create customer notification on payment verification:', err.message);
    }
  }

  res.json({ success: true, message: 'Payment verified successfully', data: order });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images slug');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only allow owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Cannot cancel shipped or delivered orders');
  }

  // Restore stock and decrease soldCount
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason });

  await order.save();
  res.json({ success: true, message: 'Order cancelled successfully', data: order });
});

// ======= ADMIN CONTROLLERS =======

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};

  // Status Filter
  if (req.query.status && req.query.status !== 'all') {
    filter.orderStatus = req.query.status;
  }

  // Payment Method Filter
  if (req.query.paymentMethod && req.query.paymentMethod !== 'all') {
    filter.paymentMethod = req.query.paymentMethod;
  }

  // Payment Status Filter
  if (req.query.paymentStatus === 'paid') {
    filter.isPaid = true;
  } else if (req.query.paymentStatus === 'unpaid') {
    filter.isPaid = false;
  }

  // Time Filter
  if (req.query.date && req.query.date !== 'all') {
    const now = new Date();
    let startDate = new Date();

    if (req.query.date === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (req.query.date === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (req.query.date === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (req.query.date === 'last30') {
      startDate.setDate(now.getDate() - 30);
    }
    
    filter.createdAt = { $gte: startDate };
  }

  // Search Functionality (ID, Name, Phone)
  if (req.query.search) {
    const search = req.query.search.trim();
    const { default: User } = await import('../models/User.js');
    const searchRegex = new RegExp(search, 'i');

    // Find users by name or phone
    const matchingUsers = await User.find({
      $or: [
        { name: searchRegex },
        { phone: searchRegex }
      ]
    }).select('_id');
    const userIds = matchingUsers.map((u) => u._id);

    filter.$or = [
      { user: { $in: userIds } },
      { 'shippingAddress.phone': searchRegex },
      { $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: search, options: 'i' } } }
    ];
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.isPaid = order.paymentMethod === 'cod' ? true : order.isPaid;
    if (order.paymentMethod === 'cod') order.paidAt = new Date();
  }

  if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
    // Restore stock if being cancelled for the first time
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }
    order.cancelledAt = new Date();
  }

  await order.save();
  await order.populate('user', 'name email');

  // Notify user about status change
  if (order.user) {
    try {
      let notificationTitle = 'Order Update';
      let notificationMessage = `Your order #${order._id.toString().slice(-8).toUpperCase()} status has been updated to ${status}.`;
      let notificationType = 'order_status_update';

      if (status === 'confirmed') {
        notificationTitle = 'Order Confirmed';
        notificationMessage = `Your order #${order._id.toString().slice(-8).toUpperCase()} has been confirmed!`;
        notificationType = 'order_confirmed';
      } else if (status === 'cancelled') {
        notificationTitle = 'Order Cancelled';
        notificationMessage = `Your order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled. Reason: ${note || 'Cancelled by admin'}`;
        notificationType = 'order_rejected';
      }

      await Notification.create({
        recipient: order.user._id || order.user,
        recipientRole: 'user',
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        order: order._id,
        metadata: {
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          amount: order.totalAmount,
          reason: status === 'cancelled' ? (note || 'Cancelled by admin') : undefined,
        },
      });
    } catch (err) {
      console.error('Failed to create customer status notification:', err.message);
    }
  }

  res.json({ success: true, data: order });
});

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueByMonth = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Best selling products
  const bestSellers = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaysOrders = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

  const { default: User } = await import('../models/User.js');
  const { default: Product } = await import('../models/Product.js');


  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalProducts = await Product.countDocuments({ isActive: true });
  const lowStock = await Product.countDocuments({ stock: { $lte: 10 }, isActive: true });

  res.json({
    success: true,
    data: {
      totalOrders,
      todaysOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalProducts,
      lowStock,
      ordersByStatus,
      revenueByMonth,
      bestSellers,
    },
  });
});

// @desc    Delete order (Admin)
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  await Order.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Order removed' });
});
