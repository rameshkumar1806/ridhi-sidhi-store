import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus, fetchDashboardStats, deleteOrderAdmin } from '../redux/slices/orderSlice';
import { FullPageLoader } from '../components/common/LoadingSpinner';
import { Eye, Printer, XCircle, Trash2, Search, Package, Clock, TrendingUp, CheckCircle, IndianRupee } from 'lucide-react';
import { formatDateTime, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, dashboardStats } = useSelector((state) => state.orders);
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // For the input field
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllOrders({ 
      page, 
      limit: 10, 
      status: statusFilter,
      paymentStatus: paymentFilter,
      paymentMethod: paymentMethodFilter,
      date: dateFilter,
      search: searchQuery
    }));
  }, [dispatch, page, statusFilter, paymentFilter, paymentMethodFilter, dateFilter, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleStatusChange = async (orderId, newStatus, note = null) => {
    setUpdatingId(orderId);
    const result = await dispatch(updateOrderStatus({ id: orderId, status: newStatus, note }));
    if (updateOrderStatus.fulfilled.match(result)) {
      toast.success('Order status updated');
      dispatch(fetchDashboardStats());
    } else {
      toast.error('Failed to update status');
    }
    setUpdatingId(null);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
      const result = await dispatch(deleteOrderAdmin(orderId));
      if (deleteOrderAdmin.fulfilled.match(result)) {
        toast.success('Order deleted successfully');
        dispatch(fetchDashboardStats());
      } else {
        toast.error('Failed to delete order');
      }
    }
  };

  const handleCancel = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      handleStatusChange(orderId, 'cancelled');
    }
  };

  const handlePrint = (orderId) => {
    window.open(`/admin/orders/${orderId}?print=true`, '_blank');
  };

  if (loading && !orders.length && !dashboardStats) return <FullPageLoader />;

  // Analytics Helpers
  const getStatusCount = (status) => {
    const item = dashboardStats?.ordersByStatus?.find(s => s._id === status);
    return item ? item.count : 0;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">{getStatusCount('pending')}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <p className="text-xl font-bold text-gray-900">{getStatusCount('delivered')}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-xl font-bold text-gray-900">₹{dashboardStats.totalRevenue?.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Orders</p>
              <p className="text-xl font-bold text-gray-900">{dashboardStats.todaysOrders || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters and Search */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row gap-4 justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-full xl:max-w-md relative">
            <input
              type="text"
              placeholder="Search by Order ID, Name or Phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 bg-white font-medium"
            >
              <option value="all">📅 All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="last30">Last 30 Days</option>
            </select>
            
            <select
              value={paymentMethodFilter}
              onChange={(e) => { setPaymentMethodFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 bg-white font-medium"
            >
              <option value="all">💳 All Methods</option>
              <option value="cod">COD</option>
              <option value="razorpay">Razorpay (Online)</option>
              <option value="whatsapp">WhatsApp Order</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 bg-white font-medium"
            >
              <option value="all">💰 All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 bg-white font-medium"
            >
              <option value="all">📦 All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Order Info</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Products</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(order.createdAt)}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{order.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress?.phone || order.user?.phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-700">{order.orderItems.length} Items</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {order.orderItems.map(i => i.name).join(', ')}
                    </p>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    ₹{order.totalAmount}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm uppercase font-semibold text-gray-700">
                        {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'whatsapp' ? 'WhatsApp' : 'Online'}
                      </span>
                      <span className={`text-xs font-bold ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      {order.paymentResult?.razorpay_payment_id && (
                        <span className="text-[10px] text-gray-400 truncate max-w-[100px]" title={order.paymentResult.razorpay_payment_id}>
                          {order.paymentResult.razorpay_payment_id}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => {
                        if (e.target.value === 'cancelled') {
                          const reason = window.prompt('Enter reason for rejection:');
                          if (reason !== null) {
                            handleStatusChange(order._id, 'cancelled', reason || 'Rejected by admin');
                          }
                        } else {
                          handleStatusChange(order._id, e.target.value, e.target.value === 'confirmed' ? 'Order confirmed by admin' : undefined);
                        }
                      }}
                      disabled={updatingId === order._id || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                      className={`text-xs font-bold rounded-full px-3 py-1.5 border-0 focus:ring-2 cursor-pointer transition-colors
                        bg-${getStatusColor(order.orderStatus)}-100 text-${getStatusColor(order.orderStatus)}-800
                        disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      <option value="pending">Pending Confirmation</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled (Rejected)</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/orders/${order._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handlePrint(order._id)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Print Invoice">
                        <Printer className="w-4 h-4" />
                      </button>
                      {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                        <button onClick={() => handleCancel(order._id)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Cancel Order">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(order._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Order">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium text-lg">No orders found.</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-sm text-gray-500">
              Showing page <span className="font-medium text-gray-900">{pagination.page}</span> of <span className="font-medium text-gray-900">{pagination.pages}</span>
            </p>
            <div className="flex gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
