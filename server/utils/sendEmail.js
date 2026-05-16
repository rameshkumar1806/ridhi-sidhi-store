import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending error:', error.message);
    // Don't throw - email failure shouldn't break the app
  }
};

export const sendOrderConfirmationEmail = async (order, user) => {
  const itemsHTML = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity} ${item.unit}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right">₹${item.price}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
  <div style="background:#FF6B35;padding:24px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="color:white;margin:0;font-size:24px">🛒 Ridhi Sidhi General Store</h1>
    <p style="color:#ffe8dd;margin:4px 0 0">Your order has been confirmed!</p>
  </div>
  <div style="background:white;padding:24px;border-radius:0 0 8px 8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <p style="font-size:16px">Dear <strong>${user.name}</strong>,</p>
    <p>Thank you for your order! We've received your order and will start processing it soon.</p>
    <div style="background:#fff8f5;border:1px solid #ffe0cc;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0 0 8px;font-weight:bold">Order ID: <span style="color:#FF6B35">#${order._id.toString().slice(-8).toUpperCase()}</span></p>
      <p style="margin:0">Payment: <span style="text-transform:capitalize">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span></p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:8px;text-align:left">Product</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Price</th>
          <th style="padding:8px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
    </table>
    <div style="text-align:right;border-top:2px solid #FF6B35;padding-top:12px">
      <p style="margin:4px 0">Subtotal: <strong>₹${order.subtotal.toFixed(2)}</strong></p>
      <p style="margin:4px 0">Shipping: <strong>₹${order.shippingCharge}</strong></p>
      <p style="margin:4px 0">GST: <strong>₹${order.gst.toFixed(2)}</strong></p>
      <p style="margin:4px 0;font-size:18px;color:#FF6B35">Total: <strong>₹${order.totalAmount.toFixed(2)}</strong></p>
    </div>
    <div style="background:#f0f9ff;border-radius:8px;padding:16px;margin-top:16px">
      <p style="margin:0 0 4px;font-weight:bold">Delivery Address:</p>
      <p style="margin:0;color:#555">${order.shippingAddress.fullName}, ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
    </div>
    <p style="color:#888;font-size:12px;margin-top:24px">For any queries, WhatsApp us at +91-XXXXXXXXXX or email us at support@ridhisidhi.com</p>
  </div>
</body>
</html>`;

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} - Ridhi Sidhi General Store`,
    html,
  });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
  <div style="background:#FF6B35;padding:20px;border-radius:8px 8px 0 0;text-align:center">
    <h2 style="color:white;margin:0">Password Reset</h2>
  </div>
  <div style="background:white;padding:24px;border:1px solid #eee;border-radius:0 0 8px 8px">
    <p>Hello ${user.name},</p>
    <p>You requested a password reset for your Ridhi Sidhi account.</p>
    <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${resetUrl}" style="background:#FF6B35;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold">Reset Password</a>
    </div>
    <p style="color:#888;font-size:12px">If you didn't request this, please ignore this email.</p>
  </div>
</div>`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset - Ridhi Sidhi General Store',
    html,
  });
};
