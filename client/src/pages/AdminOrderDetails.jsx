import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, updateOrderStatus } from '../redux/slices/orderSlice';
import { FullPageLoader } from '../components/common/LoadingSpinner';
import { 
  Package, MapPin, CreditCard, Clock, ChevronLeft, 
  Printer, User, Phone, Mail, FileText, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { formatDateTime, getStatusColor, getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder: order, loading } = useSelector((state) => state.orders);
  
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  const handleStatusChange = async (newStatus, customNote = null) => {
    setUpdating(true);
    const result = await dispatch(updateOrderStatus({ id, status: newStatus, note: customNote }));
    if (updateOrderStatus.fulfilled.match(result)) {
      toast.success(`Order status updated to ${newStatus}`);
    } else {
      toast.error('Failed to update order status');
    }
    setUpdating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !order) return <FullPageLoader />;

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-8 print:bg-white print:py-0">
      <div className="px-4 sm:container sm:mx-auto max-w-5xl">
        {/* Navigation & Actions */}
        <div className="print:hidden mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Manage Orders
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="btn-outline btn-sm flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Admin View</span>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Order ID</p>
                  </div>
                  <h1 className="text-xl md:text-3xl font-display font-bold">#{order._id.substring(order._id.length - 8).toUpperCase()}</h1>
                  <p className="text-gray-300 text-sm mt-2">Placed on {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-sm
                    bg-${getStatusColor(order.orderStatus)}-100 text-${getStatusColor(order.orderStatus)}-800`}
                  >
                    {getStatusLabel(order.orderStatus)}
                  </div>
                  {order.isPaid && (
                    <div className="flex items-center gap-1 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-8">
                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base sm:text-lg">
                    <Package className="w-5 h-5 text-primary-500" /> Order Items ({order.orderItems.length})
                  </h3>
                  <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                    {order.orderItems.map((item) => (
                      <div key={item._id} className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border border-gray-100 rounded-xl p-2 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase tracking-tighter truncate">SKU: {item.sku || 'N/A'}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="font-bold text-gray-900">₹{item.price}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100">
                  <div className="space-y-3 text-sm text-gray-600">
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
                      <div className="flex justify-between text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg -mx-1 sm:-mx-2">
                        <span>Discount</span>
                        <span>-₹{order.discount}</span>
                      </div>
                    )}
                    <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-base sm:text-lg">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary-600">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking History */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary-500" /> Activity History
              </h3>
              <div className="relative border-l-2 border-gray-100 ml-3 sm:ml-4 space-y-6 sm:space-y-8">
                {order.statusHistory?.map((history, idx) => (
                  <div key={idx} className="relative pl-6 sm:pl-8">
                    <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white
                      bg-${getStatusColor(history.status)}-500 shadow-sm`}
                    ></span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{getStatusLabel(history.status)}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{formatDateTime(history.date || new Date())}</p>
                      {history.note && <p className="text-xs sm:text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">"{history.note}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6 sm:space-y-8">
            {/* Admin Status Control */}
            <div className="bg-white rounded-3xl shadow-md border-2 border-primary-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-primary-500" /> Manage Status
              </h3>
              <div className="space-y-4">
                {order.orderStatus === 'pending' ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleStatusChange('confirmed', 'Order confirmed by admin')}
                      disabled={updating}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? 'Processing...' : 'Confirm Order'}
                    </button>
                    <button
                      onClick={() => {
                        const reason = window.prompt('Enter reason for rejection:');
                        if (reason !== null) {
                          handleStatusChange('cancelled', reason || 'Rejected by admin');
                        }
                      }}
                      disabled={updating}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? 'Processing...' : 'Reject Order'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                    {['confirmed', 'packed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={updating || order.orderStatus === status}
                        className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer
                          ${order.orderStatus === status 
                            ? `bg-${getStatusColor(status)}-500 text-white shadow-lg` 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {status === order.orderStatus && updating ? '...' : status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" /> Customer Info
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                    {order.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{order.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{order.user?.email}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-700">{order.shippingAddress.phone || order.user?.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" /> Delivery Address
              </h3>
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-sm leading-relaxed">
                <p className="font-bold text-gray-900 mb-1">{order.user?.name}</p>
                <p className="text-gray-700">{order.shippingAddress.formattedAddress || `${order.shippingAddress.houseNo || ''} ${order.shippingAddress.street || ''} ${order.shippingAddress.landmark ? '(' + order.shippingAddress.landmark + ')' : ''}`}</p>
                <p className="text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" /> Payment
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold text-gray-900 uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                    {order.isPaid ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
