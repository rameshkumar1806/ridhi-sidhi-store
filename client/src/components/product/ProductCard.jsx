import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlistItem } from '../../redux/slices/authSlice';
import { getProductImage, getDiscountPercent } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const isWishlisted = user?.wishlist?.some(item => 
    typeof item === 'string' ? item === product._id : item._id === product._id
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) {
      // toast will be shown by interceptor if we return a rejected promise, but let's handle via UI later
      return;
    }
    dispatch(toggleWishlistItem(product._id));
  };

  const discount = getDiscountPercent(product.mrp, product.price);

  return (
    <div className="card card-hover flex flex-col h-full relative group">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            {discount}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-lg">
            Best Seller
          </span>
        )}
        {product.stock === 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            Out of Stock
          </span>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            Only Few Left
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      {/* Image */}
      <Link to={`/products/${product.slug || product._id}`} className="block relative aspect-square p-6 overflow-hidden bg-white">
        <img 
          src={getProductImage(product)} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 border-t border-gray-50 bg-gray-50/50">
        <Link to={`/products/${product.slug || product._id}`} className="flex-1">
          <div className="text-xs text-gray-500 mb-1">{product.brand || 'Ridhi Sidhi'}</div>
          <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center bg-green-100 px-1.5 py-0.5 rounded text-xs font-bold text-green-700">
              {product.rating?.toFixed(1) || '0.0'} <Star className="w-3 h-3 ml-0.5 fill-current" />
            </div>
            <span className="text-xs text-gray-500">({product.numReviews})</span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
              {product.quantity}
            </span>
            {product.stock > 0 && (
              <span className={`text-[10px] font-bold ${product.stock <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                {product.stock > 10 ? 'In Stock' : 'Only Few Left'}
              </span>
            )}
          </div>
        </Link>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <div className="price-current leading-none">₹{product.price}</div>
            {discount > 0 && <div className="price-mrp mt-1">₹{product.mrp}</div>}
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm
              ${product.stock === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-100 text-primary-600 hover:bg-primary-500 hover:text-white'
              }`}
            title={product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
