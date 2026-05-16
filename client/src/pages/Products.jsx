import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { FullPageLoader } from '../components/common/LoadingSpinner';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, categories, pagination, loading } = useSelector((state) => state.products);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    stockStatus: searchParams.get('stockStatus') || '',
  });

  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  useEffect(() => {
    // Sync URL params to local state
    setFilters({
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || '-createdAt',
      stockStatus: searchParams.get('stockStatus') || '',
    });
    
    // Fetch products
    const params = Object.fromEntries([...searchParams]);
    dispatch(fetchProducts(params));
  }, [dispatch, searchParams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ category: '', search: '', minPrice: '', maxPrice: '', sort: '-createdAt', stockStatus: '' });
    setSearchParams(new URLSearchParams());
    setShowFilters(false);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !items.length) return <FullPageLoader />;

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 mt-1">Showing {items.length} products</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setShowFilters(true)}
            className="md:hidden flex items-center gap-2 btn-outline bg-white"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          
          {/* Sort Desktop */}
          <select 
            value={filters.sort}
            onChange={(e) => {
              handleFilterChange(e);
              const params = new URLSearchParams(searchParams);
              params.set('sort', e.target.value);
              setSearchParams(params);
            }}
            className="input-field py-2 w-auto min-w-[200px]"
          >
            <option value="-createdAt">Newest Arrivals</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative">
        {/* Sidebar Filters */}
        <div className={`
          fixed md:sticky top-0 right-0 h-full md:h-auto w-[280px] md:w-64 bg-white md:bg-transparent shadow-2xl md:shadow-none z-50 md:z-0 p-6 md:p-0 transition-transform duration-300 transform
          ${showFilters ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h3 className="font-bold text-lg">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
          </div>

          <div className="bg-white md:border border-gray-200 md:rounded-2xl p-0 md:p-5 space-y-6">
            {/* Search Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Search</h4>
              <input 
                type="text" 
                name="search" 
                value={filters.search} 
                onChange={handleFilterChange}
                placeholder="Search products..." 
                className="input-field py-2"
              />
            </div>

            <hr className="border-gray-100" />

            {/* Category Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category" 
                    value=""
                    checked={filters.category === ''}
                    onChange={handleFilterChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-gray-700 group-hover:text-primary-600 transition-colors text-sm">All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      value={cat.slug}
                      checked={filters.category === cat.slug}
                      onChange={handleFilterChange}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="text-gray-700 group-hover:text-primary-600 transition-colors text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Price Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  name="minPrice" 
                  value={filters.minPrice} 
                  onChange={handleFilterChange}
                  placeholder="Min" 
                  className="input-field py-2 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input 
                  type="number" 
                  name="maxPrice" 
                  value={filters.maxPrice} 
                  onChange={handleFilterChange}
                  placeholder="Max" 
                  className="input-field py-2 text-sm"
                />
              </div>
            </div>

            <hr className="border-gray-100" />
            
            {/* Availability Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Availability</h4>
              <div className="space-y-2">
                {[
                  { label: 'All Products', value: '' },
                  { label: 'In Stock Only', value: 'in' },
                  { label: 'Low Stock', value: 'low' },
                  { label: 'Out of Stock', value: 'out' }
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="stockStatus" 
                      value={item.value}
                      checked={(filters.stockStatus || '') === item.value}
                      onChange={handleFilterChange}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="text-gray-700 group-hover:text-primary-600 transition-colors text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <button onClick={clearFilters} className="btn-outline flex-1 py-2 text-sm">Clear</button>
              <button onClick={applyFilters} className="btn-primary flex-1 py-2 text-sm">Apply</button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile filters */}
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Filter className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">We couldn't find any products matching your current filters. Try adjusting your search or clearing filters.</p>
              <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex gap-2">
                    {[...Array(pagination.pages).keys()].map((p) => (
                      <button
                        key={p + 1}
                        onClick={() => handlePageChange(p + 1)}
                        className={`w-10 h-10 rounded-xl font-medium transition-colors flex items-center justify-center ${
                          pagination.page === p + 1
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-primary-500'
                        }`}
                      >
                        {p + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
