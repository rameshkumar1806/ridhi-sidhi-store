import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCart, Heart, User, Search, Menu, X,
  ChevronDown, LogOut, Package, LayoutDashboard, Store, Phone, Home, Users
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { selectCartItemsCount } from '../../redux/slices/cartSlice';
import { fetchSearchSuggestions, clearSuggestions } from '../../redux/slices/productSlice';
import { getProductImage } from '../../utils/helpers';
import api from '../../services/api';
import NotificationCenter from '../common/NotificationCenter';

const CATEGORIES = [
  { name: 'Dals & Pulses', slug: 'dals-pulses', icon: '🫘' },
  { name: 'Oils & Ghee', slug: 'oils-ghee', icon: '🫙' },
  { name: 'Flour & Atta', slug: 'flour-atta', icon: '🌾' },
  { name: 'Rice & Grains', slug: 'rice-grains', icon: '🍚' },
  { name: 'Spices & Masalas', slug: 'spices-masalas', icon: '🌶️' },
  { name: 'Dry Fruits', slug: 'dry-fruits-nuts', icon: '🥜' },
  { name: 'Sugar & Salt', slug: 'sugar-salt', icon: '🧂' },
  { name: 'Household', slug: 'household-essentials', icon: '🏠' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartItemsCount);
  const { suggestions } = useSelector((state) => state.products);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }
    const fetchUnreadCount = async () => {
      try {
        const { data } = await api.get('/notifications');
        if (data?.success) {
          const unread = data.data.filter(n => !n.isRead).length;
          setUnreadNotifications(unread);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  let searchTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileMenu]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        dispatch(clearSuggestions());
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length >= 2) {
      dispatch(fetchSearchSuggestions(val));
    } else {
      dispatch(clearSuggestions());
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      dispatch(clearSuggestions());
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    navigate('/');
  };

  const wishlistCount = user?.wishlist?.length || 0;

  return (
    <>
      {/* Top bar */}
      <div className="bg-gray-900 text-gray-300 text-xs py-1.5 hidden md:block">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> +91-99825-48621
            </span>
            <span>Free delivery on orders above ₹499 🛵</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://wa.me/919982548621?text=Hello%20Ridhi%20Sidhi%20Store%2C%20I%20want%20to%20place%20an%20order!" target="_blank" rel="noreferrer" className="hover:text-green-400 transition-colors flex items-center gap-1">
              WhatsApp Order
            </a>
            <span>9AM - 9PM | Mon-Sun</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="container-custom py-3">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-indian rounded-xl flex items-center justify-center shadow-md">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-gray-900 leading-tight text-base">Ridhi Sidhi</p>
                <p className="text-xs text-primary-500 font-medium leading-tight">General Store</p>
              </div>
            </Link>

            {/* Search bar */}
            <div className="w-full md:w-auto flex-1 md:max-w-xl relative order-last md:order-none mt-1 md:mt-0" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSearch(true)}
                    placeholder="Search for dals, rice, spices..."
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>

              {/* Search suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-down">
                  {suggestions.map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product.slug || product._id}`}
                      onClick={() => { dispatch(clearSuggestions()); setSearchQuery(''); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">{product.name}</p>
                        <p className="text-xs text-primary-600 font-semibold">₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Wishlist */}
              {user && (
                <Link
                  to="/wishlist"
                  className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold min-w-[18px] min-h-[18px] text-center leading-none px-1">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notification Center */}
              {user && (
                <NotificationCenter />
              )}

              {/* Cart - Hidden on mobile, moved to bottom nav */}
              <Link
                to="/cart"
                className="hidden md:flex relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">{user.name?.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-down">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' ? (
                        <>
                          <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm font-medium text-primary-600 transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Analytics
                          </Link>
                          <Link to="/admin/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                            <ShoppingCart className="w-4 h-4" /> Manage Orders
                          </Link>
                          <Link to="/admin/products" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                            <Package className="w-4 h-4" /> Manage Products
                          </Link>
                          <Link to="/admin/products?tab=inventory" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                            <Store className="w-4 h-4" /> Inventory
                          </Link>
                          <Link to="/admin/users" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                            <Users className="w-4 h-4" /> Users
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                            <span className="flex items-center gap-3">
                              <User className="w-4 h-4" /> My Profile
                            </span>
                            {unreadNotifications > 0 && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </Link>
                          <Link to="/my-orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                            <Package className="w-4 h-4" /> My Orders
                          </Link>
                        </>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn-primary btn-sm hidden md:flex items-center gap-2">
                  <User className="w-4 h-4" /> Login
                </Link>
              )}

              {/* Mobile menu toggle - Hidden completely, moved to bottom nav */}
              {/* <button className="md:hidden">...</button> */}
            </div>
          </div>
        </div>

        {/* Category nav bar */}
        <div className="border-t border-gray-100 hidden md:block">
          <div className="container-custom">
            <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
              <Link to="/products" className="flex-shrink-0 px-4 py-2.5 text-sm font-semibold text-primary-600 border-b-2 border-primary-500 hover:text-primary-700 transition-colors">
                All Products
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-500 transition-all whitespace-nowrap"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </header>

      {/* Modern Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex items-center justify-around pb-safe pt-1 h-[60px]">
        <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}>
          <Home className={`w-5 h-5 ${location.pathname === '/' ? 'fill-primary-50 stroke-primary-600' : ''}`} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${showMobileMenu ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}>
          <LayoutDashboard className={`w-5 h-5 ${showMobileMenu ? 'fill-primary-50 stroke-primary-600' : ''}`} />
          <span className="text-[10px] font-medium">Categories</span>
        </button>
        <Link to="/cart" className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/cart' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}>
          <ShoppingCart className={`w-5 h-5 ${location.pathname === '/cart' ? 'fill-primary-50 stroke-primary-600' : ''}`} />
          <span className="text-[10px] font-medium">Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 bg-primary-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>
        <Link to={user ? "/profile" : "/login"} className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/profile' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}>
          <User className={`w-5 h-5 ${location.pathname === '/profile' ? 'fill-primary-50 stroke-primary-600' : ''}`} />
          <span className="text-[10px] font-medium">{user ? 'Account' : 'Login'}</span>
          {user && unreadNotifications > 0 && (
            <span className="absolute top-1 right-[30%] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </Link>
      </div>

      {/* Modern Mobile Bottom Categories Drawer */}
      {showMobileMenu && (
        <>
          {/* Backdrop overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] transition-opacity duration-300 animate-fade-in"
            onClick={() => setShowMobileMenu(false)}
          />
          {/* Drawer container */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-slide-up-drawer">
            {/* Drawer Header & Pull Tab */}
            <div className="pt-4 pb-2 px-6 flex flex-col items-center">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4" />
              <div className="flex items-center justify-between w-full border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Categories</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
              {/* Login/Register buttons if not logged in */}
              {!user ? (
                <div className="flex gap-2.5 mb-4 mt-2">
                  <Link to="/login" onClick={() => setShowMobileMenu(false)} className="flex-1 btn-primary text-center text-sm py-2">Login</Link>
                  <Link to="/register" onClick={() => setShowMobileMenu(false)} className="flex-1 btn-secondary text-center text-sm py-2">Register</Link>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50/50 border border-primary-100 mb-4 mt-2">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">Hello, {user.name?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              
              {/* Category Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 mt-2">
                <Link
                  to="/products"
                  onClick={() => setShowMobileMenu(false)}
                  className="col-span-2 flex items-center justify-center gap-2 p-3.5 rounded-xl bg-orange-50 border border-primary-100 hover:bg-orange-100 transition-colors"
                >
                  <Store className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-bold text-primary-600">All Products</span>
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/products?category=${cat.slug}`}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-orange-50 hover:border-primary-100 transition-all text-center"
                  >
                    <span className="text-3xl mb-2">{cat.icon}</span>
                    <span className="text-xs font-semibold text-gray-800">{cat.name}</span>
                  </Link>
                ))}
              </div>
              
              {/* Account Quick Links if logged in */}
              {user && (
                <div className="border-t border-gray-100 pt-4 mb-4 flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 mb-1">Account & Orders</p>
                  <Link
                    to="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>My Profile</span>
                    </span>
                    {unreadNotifications > 0 && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2 border-2 border-white animate-pulse" />
                    )}
                  </Link>
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-primary-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  ) : (
                    <Link
                      to="/my-orders"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                    >
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>My Orders</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-600 text-sm font-medium transition-colors text-left w-full cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Secondary Links */}
              <div className="border-t border-gray-100 pt-4 pb-2 flex flex-col gap-2">
                <Link to="/about" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-medium">About Us</Link>
                <Link to="/contact" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-medium">Contact Us</Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
