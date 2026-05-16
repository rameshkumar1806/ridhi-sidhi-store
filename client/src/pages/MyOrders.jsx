import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../redux/slices/orderSlice';
import { FullPageLoader } from '../components/common/LoadingSpinner';
import { Package, ChevronRight, MapPin, Clock } from 'lucide-react';
import { formatDateTime, getStatusColor, getStatusLabel } from '../utils/helpers';

const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, pagination } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (loading && orders.length === 0) return <FullPageLoader />;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500">Track and manage your previous orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start exploring our store!</p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              Start Shopping <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="bg-gray-50 p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-sm font-semibold text-gray-900">₹{order.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-sm font-semibold text-gray-900">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <Link to={`/orders/${order._id}`} className="btn-outline btn-sm bg-white self-start md:self-auto hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200">
                    View Details
                  </Link>
                </div>

                {/* Body */}
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                    {/* Status Line */}
                    <div className="md:w-64 flex-shrink-0">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3
                        bg-${getStatusColor(order.orderStatus)}-100 text-${getStatusColor(order.orderStatus)}-800`}
                      >
                        <span className={`w-2 h-2 rounded-full bg-${getStatusColor(order.orderStatus)}-500 animate-pulse`}></span>
                        {getStatusLabel(order.orderStatus)}
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p>Expected Delivery by <span className="font-semibold text-gray-900">Tomorrow</span></p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600 mt-2 line-clamp-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p>{order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="flex-1">
                      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="flex-shrink-0 relative group">
                            <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden p-2">
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            </div>
                            {item.quantity > 1 && (
                              <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {order.orderItems.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2 font-medium">
                          {order.orderItems[0].name}
                          {order.orderItems.length > 1 && ` and ${order.orderItems.length - 1} more item(s)`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
