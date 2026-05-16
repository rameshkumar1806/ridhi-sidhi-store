import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { Heart, ChevronRight } from 'lucide-react';

const Wishlist = () => {
  const { user } = useSelector((state) => state.auth);
  
  // The wishlist might just be IDs or populated products depending on backend
  // Our backend populates it in getProfile, but might just be IDs initially.
  // For safety, let's assume it's populated if it's an object with a name.
  
  const wishlistItems = user?.wishlist || [];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500">{wishlistItems.length} items saved</p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto mt-12">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-red-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save items you love here and buy them later when you're ready.</p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              Explore Products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {wishlistItems.map((item) => {
              // If it's just an ID string, we can't show full details easily without fetching.
              // But assuming it's populated from auth payload:
              if (typeof item === 'string') return null;
              
              return <ProductCard key={item._id} product={item} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
