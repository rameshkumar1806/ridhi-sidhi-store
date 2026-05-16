import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchInventoryStats, fetchCategories } from '../redux/slices/productSlice';
import { FullPageLoader } from '../components/common/LoadingSpinner';
import { 
  Plus, Edit, Trash2, Search, Filter, Eye, ArrowUpDown, 
  Package, AlertTriangle, XCircle, TrendingUp, DollarSign, Calendar
} from 'lucide-react';
import { getProductImage, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import api from '../services/api';
import ProductModal from '../components/admin/ProductModal';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { items, pagination, loading, categories, inventoryStats } = useSelector((state) => state.products);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    category: '', 
    stockStatus: '', 
    sort: 'latest',
    minPrice: '',
    maxPrice: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts({ 
      page, 
      limit: 10, 
      search: searchTerm, 
      ...filters 
    }));
    dispatch(fetchInventoryStats());
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, page, searchTerm, filters]);

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setDeletingId(id);
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        dispatch(fetchProducts({ page, limit: 10, search: searchTerm, ...filters }));
        dispatch(fetchInventoryStats());
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ 
      category: '', 
      stockStatus: '', 
      sort: 'latest',
      minPrice: '',
      maxPrice: ''
    });
    setSearchTerm('');
    setPage(1);
  };

  if (loading && !items.length) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-900">{inventoryStats?.totalProducts || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Stock</p>
            <h3 className="text-2xl font-bold text-gray-900">{inventoryStats?.totalStock || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Low Stock</p>
            <h3 className="text-2xl font-bold text-gray-900">{inventoryStats?.lowStock || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Out of Stock</p>
            <h3 className="text-2xl font-bold text-gray-900">{inventoryStats?.outOfStock || 0}</h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Actions */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <form onSubmit={handleSearch} className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search by name, brand, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 py-2.5 w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 transition-all"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline flex items-center gap-2 ${showFilters ? 'bg-gray-100 border-gray-300' : ''}`}
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
              <button 
                onClick={() => { setProductToEdit(null); setIsModalOpen(true); }}
                className="btn-primary flex items-center gap-2 px-6"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Category</label>
                <select 
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Stock Status</label>
                <select 
                  value={filters.stockStatus}
                  onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                  className="input-field py-2"
                >
                  <option value="">All Status</option>
                  <option value="in">In Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Sort By</label>
                <select 
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="input-field py-2"
                >
                  <option value="latest">Latest Added</option>
                  <option value="best_selling">Best Selling</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="stock_low">Stock: Low to High</option>
                </select>
              </div>
              <div className="lg:col-span-2 flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Price Range</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="input-field py-2"
                    />
                    <input 
                      type="number" 
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="input-field py-2"
                    />
                  </div>
                </div>
                <button 
                  onClick={clearFilters}
                  className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                  title="Clear All Filters"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 min-w-[280px]">Product Info</th>
                <th className="p-4 text-center">Qty/Weight</th>
                <th className="p-4">Category & Brand</th>
                <th className="p-4">Price & Discount</th>
                <th className="p-4">Stock Availability</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-xl border border-gray-100 p-1.5 flex-shrink-0 group-hover:border-primary-200 transition-colors">
                        <img 
                          src={getProductImage(product)} 
                          alt={product.name} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1 text-sm">{product.name}</p>
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">SKU: {product.sku || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-500">{formatDateTime(product.createdAt).split(',')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                      {product.quantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                    <p className="text-xs text-gray-500 mt-2 font-medium">{product.brand || '-'}</p>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 text-sm">₹{product.price}</p>
                      {product.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">-{product.discount}%</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400">No active discount</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4 max-w-[140px]">
                        <span className={`text-xs font-bold ${
                          product.stock <= 0 ? 'text-red-600' : 
                          product.stock <= (product.lowStockAlert || 5) ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {product.stock} {product.unitType}(s)
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">Sold: {product.soldCount || 0}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden max-w-[140px]">
                        <div 
                          className={`h-full rounded-full ${
                            product.stock <= 0 ? 'bg-red-500' : 
                            product.stock <= (product.lowStockAlert || 5) ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium italic">Alert at {product.lowStockAlert || 5} units</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a 
                        href={`/products/${product.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="View Product"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleEditProduct(product)} 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-full">
                        <Package className="w-10 h-10 text-gray-300" />
                      </div>
                      <h4 className="font-bold text-gray-900">No products found</h4>
                      <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                      <button onClick={clearFilters} className="text-primary-600 text-sm font-bold hover:underline mt-2">Clear All Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900">{(page-1)*10 + 1}</span> to <span className="text-gray-900">{Math.min(page*10, pagination.total)}</span> of <span className="text-gray-900">{pagination.total}</span> products
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      page === i + 1 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          dispatch(fetchProducts({ page, limit: 10, search: searchTerm, ...filters }));
          dispatch(fetchInventoryStats());
        }}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default AdminProducts;
