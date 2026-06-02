import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientRole: { type: String, enum: ['admin', 'user'], default: 'user' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['new_order', 'order_confirmed', 'order_rejected', 'order_status_update'], required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    isRead: { type: Boolean, default: false },
    metadata: {
      orderNumber: String,
      customerName: String,
      amount: Number,
      reason: String,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
