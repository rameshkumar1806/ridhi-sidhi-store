import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, cancelOrder } from '../redux/slices/orderSlice';
import { FullPageLoader } from '../components/common/LoadingSpinner';
import { Package, MapPin, CreditCard, Clock, ChevronLeft, ArrowRight, Printer, AlertCircle } from 'lucide-react';
import { formatDateTime, getStatusColor, getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((state) => state.orders);
  
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Ensure body scroll is enabled (fixing potential issues from previous pages/modals)
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    dispatch(fetchOrder(id));

    return () => {
      // Cleanup to avoid side effects on other pages
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [dispatch, id]);

  const handleCancel = async () => {
    if (!cancelReason) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    const result = await dispatch(cancelOrder({ id, reason: cancelReason }));
    if (cancelOrder.fulfilled.match(result)) {
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
    } else {
      toast.error('Failed to cancel order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !order) return <FullPageLoader />;

  const canCancel = !['shipped', 'delivered', 'cancelled'].includes(order.orderStatus);

  return (
    <div className="bg-gray-50 min-h-screen py-8 print:bg-white print:py-0">
      <div className="container-custom max-w-4xl">
        <div className="print:hidden">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/my-orders" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-medium">
              <ChevronLeft className="w-4 h-4" /> Back to Orders
            </Link>
            <button onClick={handlePrint} className="btn-outline btn-sm flex items-center gap-2 bg-white">
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-y-auto">
            {/* Header */}
            <div className="bg-gray-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Order ID</p>
                <h1 className="text-2xl md:text-3xl font-display font-bold">#{order._id.substring(order._id.length - 8).toUpperCase()}</h1>
                <p className="text-gray-300 mt-2">Placed on {formatDateTime(order.createdAt)}</p>
              </div>
              <div className="text-left md:text-right">
                <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-sm
                  bg-${getStatusColor(order.orderStatus)}-100 text-${getStatusColor(order.orderStatus)}-800`}
                >
                  {getStatusLabel(order.orderStatus)}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Shipping Address */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" /> Shipping Details
                  </h3>
                  <p className="font-medium text-gray-900">{order.user?.name}</p>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{order.shippingAddress.address}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p className="text-sm text-gray-600 mt-2 font-medium">Phone: {order.shippingAddress.phone}</p>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-400" /> Payment Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method:</span>
                      <span className="font-medium text-gray-900 uppercase">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                        {order.isPaid ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                    {order.isPaid && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Paid On:</span>
                        <span className="font-medium text-gray-900">{formatDateTime(order.paidAt)}</span>
                      </div>
                    )}
                    {order.paymentResult?.id && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="font-medium text-gray-900 text-xs">{order.paymentResult.id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8 border border-gray-100 rounded-2xl overflow-y-auto">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" /> Order Items ({order.orderItems.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.orderItems.map((item) => (
                    <div key={item._id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl p-2 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <Link to={`/products/${item.product._id || item.product}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                          {item.name}
                        </Link>
                        <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">SKU: {item.sku || 'N/A'}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Price: ₹{item.price}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 text-lg">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-end mb-8">
                <div className="w-full md:w-80 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="space-y-3 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">₹{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-medium text-gray-900">₹{order.shippingCharge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (Taxes)</span>
                      <span className="font-medium text-gray-900">₹{order.gst}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount {order.coupon && `(${order.coupon})`}</span>
                        <span>-₹{order.discount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-900 text-lg">Total</span>
                    <span className="text-2xl font-bold text-primary-600">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Tracking / Status History */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" /> Order Tracking
                </h3>
                <div className="relative border-l-2 border-gray-100 ml-3 md:ml-4 space-y-8">
                  {order.statusHistory?.map((history, idx) => (
                    <div key={idx} className="relative pl-6 md:pl-8">
                      <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white
                        bg-${getStatusColor(history.status)}-500`}
                      ></span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{getStatusLabel(history.status)}</h4>
                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(history.date || new Date())}</p>
                        {history.note && <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">{history.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel Action */}
              {canCancel && (
                <div className="border-t border-gray-100 pt-8 flex justify-end">
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="text-red-500 font-medium hover:text-red-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" /> Cancel Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Order</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
            
            <div className="space-y-4 mb-8">
              <label className="input-label">Reason for cancellation (Required)</label>
              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field min-h-[100px] resize-none"
                placeholder="e.g., Ordered by mistake, found better price elsewhere"
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="btn-outline flex-1 py-3"
              >
                Keep Order
              </button>
              <button 
                onClick={handleCancel}
                disabled={!cancelReason}
                className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex-1 py-3 disabled:opacity-50 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT INVOICE BILL STRUCTURE */}
      <div className="print-only hidden print:block print:bg-white print:text-black font-sans text-sm pb-12">
        <div className="text-center mb-8 border-b-2 border-black pb-6">
          <h1 className="text-3xl font-bold uppercase tracking-wider">Ridhi Sidhi General Store</h1>
          <p className="text-gray-600 mt-2">123 Market Street, City, State - 123456</p>
          <p className="text-gray-600">Phone: +91 98765 43210 | Email: support@ridhisidhi.com</p>
          <h2 className="text-2xl font-bold mt-6 uppercase border border-black inline-block px-8 py-2 tracking-widest">TAX INVOICE</h2>
        </div>

        <div className="flex justify-between mb-8">
          <div className="w-1/2 pr-4">
            <h3 className="font-bold text-lg mb-2 uppercase border-b border-gray-300 pb-1">Billed To:</h3>
            <p className="font-bold text-base">{order.user?.name}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="mt-2 font-medium">Phone: {order.shippingAddress.phone}</p>
          </div>
          <div className="w-1/2 pl-4">
            <h3 className="font-bold text-lg mb-2 uppercase border-b border-gray-300 pb-1">Invoice Details:</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-medium py-1 w-1/2">Invoice No:</td>
                  <td className="py-1">#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="font-medium py-1">Invoice Date:</td>
                  <td className="py-1">{formatDateTime(order.createdAt)}</td>
                </tr>
                <tr>
                  <td className="font-medium py-1">Payment Method:</td>
                  <td className="py-1 uppercase">{order.paymentMethod}</td>
                </tr>
                <tr>
                  <td className="font-medium py-1">Payment Status:</td>
                  <td className="py-1 uppercase font-bold">{order.isPaid ? 'PAID' : 'PENDING'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <table className="w-full mb-8 border-collapse border border-black text-left">
          <thead>
            <tr className="bg-gray-100 border-b border-black print:bg-gray-200">
              <th className="p-3 border-r border-black font-bold uppercase w-12 text-center">S.No</th>
              <th className="p-3 border-r border-black font-bold uppercase">Item Description</th>
              <th className="p-3 border-r border-black font-bold uppercase text-center">SKU</th>
              <th className="p-3 border-r border-black font-bold uppercase text-center w-24">Qty</th>
              <th className="p-3 border-r border-black font-bold uppercase text-right w-32">Rate (₹)</th>
              <th className="p-3 font-bold uppercase text-right w-32">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item, idx) => (
              <tr key={item._id} className="border-b border-gray-300 last:border-b-0">
                <td className="p-3 border-r border-black text-center">{idx + 1}</td>
                <td className="p-3 border-r border-black font-medium">{item.name}</td>
                <td className="p-3 border-r border-black text-center font-mono text-xs">{item.sku || 'N/A'}</td>
                <td className="p-3 border-r border-black text-center">{item.quantity}</td>
                <td className="p-3 border-r border-black text-right">{item.price.toFixed(2)}</td>
                <td className="p-3 text-right">{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-12">
          <table className="w-72 border-collapse border border-black">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-bold border-r border-black">Subtotal</td>
                <td className="p-2 text-right">₹{order.subtotal.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-bold border-r border-black">Shipping</td>
                <td className="p-2 text-right">₹{order.shippingCharge.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-bold border-r border-black">Taxes (GST)</td>
                <td className="p-2 text-right">₹{order.gst.toFixed(2)}</td>
              </tr>
              {order.discount > 0 && (
                <tr className="border-b border-gray-300">
                  <td className="p-2 font-bold border-r border-black">Discount {order.coupon && `(${order.coupon})`}</td>
                  <td className="p-2 text-right text-black">-₹{order.discount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="bg-gray-100 print:bg-gray-200">
                <td className="p-3 font-bold text-lg border-r border-black">GRAND TOTAL</td>
                <td className="p-3 font-bold text-lg text-right">₹{order.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-black pt-6 text-sm text-gray-600 flex justify-between items-end mt-12">
          <div>
            <h4 className="font-bold text-black uppercase mb-1">Terms & Conditions</h4>
            <p>1. Goods once sold will not be taken back without original invoice.</p>
            <p>2. Subject to local jurisdiction only.</p>
            <p className="mt-4 font-bold text-black">Thank you for shopping with Ridhi Sidhi General Store!</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b border-black mb-2 pb-8"></div>
            <p className="font-bold uppercase text-black">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
