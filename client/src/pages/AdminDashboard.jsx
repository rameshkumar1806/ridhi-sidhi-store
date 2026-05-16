import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../redux/slices/orderSlice';
import { FullPageLoader } from '../components/common/LoadingSpinner';
import { 
  IndianRupee, ShoppingBag, Users, Package, 
  TrendingUp, AlertCircle, ShoppingCart, 
  CheckCircle, Clock, XCircle, BarChart3
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statsObj = useMemo(() => {
    if (!dashboardStats) return {};
    const statuses = dashboardStats.ordersByStatus || [];
    const getCount = (statusName) => {
      const found = statuses.find(s => s._id === statusName);
      return found ? found.count : 0;
    };
    return {
      pending: getCount('pending'),
      delivered: getCount('delivered'),
      cancelled: getCount('cancelled'),
      shipped: getCount('shipped') + getCount('processing')
    };
  }, [dashboardStats]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const revenueChartData = useMemo(() => {
    if (!dashboardStats?.revenueByMonth) return [];
    return dashboardStats.revenueByMonth.map(item => ({
      name: `${monthNames[item._id.month - 1]}`,
      revenue: item.revenue,
      orders: item.orders
    }));
  }, [dashboardStats]);

  const pieData = [
    { name: 'Pending', value: statsObj.pending || 0, color: '#f59e0b' },
    { name: 'Delivered', value: statsObj.delivered || 0, color: '#10b981' },
    { name: 'Cancelled', value: statsObj.cancelled || 0, color: '#ef4444' },
    { name: 'In Transit', value: statsObj.shipped || 0, color: '#3b82f6' }
  ];

  if (loading && !dashboardStats) return <FullPageLoader />;

  const statsCards = [
    { title: 'Total Revenue', value: formatCurrency(dashboardStats?.totalRevenue || 0), icon: IndianRupee, color: 'bg-green-50 text-green-600' },
    { title: 'Total Orders', value: dashboardStats?.totalOrders || 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { title: 'Total Users', value: dashboardStats?.totalUsers || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { title: 'Total Products', value: dashboardStats?.totalProducts || 0, icon: Package, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Pending Orders', value: statsObj.pending, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { title: 'Delivered Orders', value: statsObj.delivered, icon: CheckCircle, color: 'bg-teal-50 text-teal-600' },
    { title: 'Cancelled Orders', value: statsObj.cancelled, icon: XCircle, color: 'bg-red-50 text-red-600' },
    { title: 'Out of Stock / Low', value: dashboardStats?.lowStock || 0, icon: AlertCircle, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Dashboard Analytics</h2>
      
      {/* 8 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-gray-500 text-xs sm:text-sm font-medium">{stat.title}</h3>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Orders Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" /> Revenue & Orders Trend
          </h3>
          <div className="h-[300px] sm:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis yAxisId="left" orientation="left" stroke="#10b981" axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(val) => `₹${val/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value, name) => [name === 'revenue' ? `₹${value}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Status Distribution */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-400" /> Order Status
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Alert */}
          {dashboardStats?.lowStock > 0 && (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-bold text-lg">Inventory Alert</h3>
              </div>
              <p className="text-red-700 font-medium text-sm leading-relaxed">
                {dashboardStats.lowStock} products are running critically low on stock (≤ 10 units).
              </p>
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mt-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" /> Top Selling Products
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {dashboardStats?.bestSellers?.length > 0 ? (
              dashboardStats.bestSellers.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-base mb-3">
                    #{idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 mb-2 h-10">{item.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">{item.totalSold} sold</p>
                  <p className="text-xs sm:text-sm font-bold text-primary-600">{formatCurrency(item.revenue)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4 col-span-full">No sales data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
