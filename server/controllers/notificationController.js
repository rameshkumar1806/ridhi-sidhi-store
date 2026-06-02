import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'admin') {
    query = { recipientRole: 'admin' };
  } else {
    query = { recipient: req.user._id, recipientRole: 'user' };
  }

  const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: notifications });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Ensure recipient matches or recipient role is admin
  if (notification.recipientRole !== 'admin' && notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }

  notification.isRead = true;
  await notification.save();

  res.json({ success: true, data: notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'admin') {
    query = { recipientRole: 'admin', isRead: false };
  } else {
    query = { recipient: req.user._id, recipientRole: 'user', isRead: false };
  }

  await Notification.updateMany(query, { $set: { isRead: true } });
  res.json({ success: true, message: 'All notifications marked as read' });
});
