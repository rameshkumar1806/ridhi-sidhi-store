import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, Share2, Star, Minus, Plus, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchProduct, submitReview } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlistItem } from '../redux/slices/authSlice';
import { getProductImage, getDiscountPercent } from '../utils/helpers';
import ProductCard from '../components/product/ProductCard';
import { FullPageLoader, InlineLoader } from '../components/common/LoadingSpinner';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProduct: product, relatedProducts, productLoading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, id]);

  const isWishlisted = user?.wishlist?.some(item => 
    typeof item === 'string' ? item === product?._id : item._id === product?._id
  );

  const handleQuantity = (type) => {
    if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
    if (type === 'inc' && quantity < product?.stock && quantity < 10) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ product, quantity }));
  };

  const handleWhatsAppBuy = () => {
    if (!product) return;
    const message = `Hello Ridhi Sidhi General Store, I would like to order this item:

*Product Name:* ${product.name}
*Brand:* ${product.brand || 'Ridhi Sidhi'}
*Price:* ₹${product.price}
*Weight/Qty:* ${product.quantity}
*Quantity Ordered:* ${quantity}
*Total Amount:* ₹${product.price * quantity}

Product Link: ${window.location.href}

Please let me know if it's available!`;

    const whatsappUrl = `https://wa.me/916350200450?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    dispatch(toggleWishlistItem(product._id));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} at Ridhi Sidhi Store`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    if (!review.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmittingReview(true);
    const resultAction = await dispatch(submitReview({ id: product._id, reviewData: review }));
    if (submitReview.fulfilled.match(resultAction)) {
      toast.success('Review submitted successfully');
      setReview({ rating: 5, comment: '' });
      dispatch(fetchProduct(id)); // Refresh product data
    }
    setSubmittingReview(false);
  };

  if (productLoading) return <FullPageLoader />;
  if (error || !product) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-8">{error || "The product you're looking for doesn't exist or has been removed."}</p>
        <Link to="/products" className="btn-primary">Back to Products</Link>
      </div>
    );
  }

  const discount = getDiscountPercent(product.mrp, product.price);

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to={`/products?category=${product.category?.slug}`} className="hover:text-primary-600">
          {product.category?.name}
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden relative">
              {discount > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-red-500 text-white font-bold px-3 py-1 rounded-lg">
                  {discount}% OFF
                </span>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
                  <span className="bg-red-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg transform -rotate-12">OUT OF STOCK</span>
                </div>
              )}
              <img 
                src={product.images?.[activeImage]?.url || getProductImage(product)} 
                alt={product.name} 
                className="w-full h-full object-contain p-8"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden transition-all ${activeImage === idx ? 'border-primary-500 shadow-md' : 'border-transparent hover:border-gray-300 bg-gray-50'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain p-2 bg-white" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wide">
                {product.brand || 'Ridhi Sidhi'}
              </span>
              <div className="flex items-center gap-3">
                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button onClick={handleWishlist} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${isWishlisted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl font-display font-bold text-gray-900 mb-3">{product.name}</h1>
            <p className="text-[11px] font-mono text-gray-400 mb-6 uppercase tracking-widest">SKU: {product.sku}</p>
            
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-100">
                  <span className="font-bold text-green-700">{product.rating?.toFixed(1)}</span>
                  <Star className="w-4 h-4 text-green-700 fill-current" />
                </div>
                <a href="#reviews" className="text-sm text-gray-500 hover:text-primary-600 underline-offset-4 hover:underline">
                  {product.numReviews} Reviews
                </a>
                <span className="text-gray-300">|</span>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg w-fit">
                    Weight/Qty: {product.quantity}
                  </span>
                  {product.stock > 0 && (
                    <span className={`text-[11px] font-bold mt-1 ${product.stock <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                      {product.stock > 10 ? 'In Stock' : 'Only Few Left'}
                    </span>
                  )}
                </div>
              </div>

            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                {discount > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through mb-1">₹{product.mrp}</span>
                    <span className="text-green-600 font-bold mb-1">You save ₹{product.mrp - product.price}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">Inclusive of all taxes</p>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center h-14 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => handleQuantity('dec')} 
                  disabled={quantity <= 1}
                  className="w-14 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="flex-1 h-full flex items-center justify-center font-bold text-lg border-x border-gray-100">
                  {quantity}
                </div>
                <button 
                  onClick={() => handleQuantity('inc')} 
                  disabled={quantity >= product.stock || quantity >= 10}
                  className="w-14 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`btn-primary h-14 w-full flex items-center justify-center gap-2 text-lg shadow-lg ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'shadow-primary-500/30'}`}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            <div className="mt-4">
              <button 
                onClick={handleWhatsAppBuy}
                disabled={product.stock === 0}
                className={`w-full h-14 font-bold rounded-xl flex items-center justify-center gap-2 text-lg transition-all ${
                  product.stock === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 hover:-translate-y-0.5'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg>
                Buy on WhatsApp
              </button>
            </div>

            {/* Delivery Features */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-500">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Free Delivery</h4>
                  <p className="text-xs text-gray-500 mt-0.5">On orders over ₹499</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 text-green-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Quality Assured</h4>
                  <p className="text-xs text-gray-500 mt-0.5">100% Genuine Products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="mb-12">
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-8 border-b pb-4">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Review Stats & Form */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
              <h3 className="text-5xl font-display font-bold text-gray-900 mb-2">{product.rating?.toFixed(1)}</h3>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-6 h-6 ${star <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-gray-500">Based on {product.numReviews} reviews</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Write a Review</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button"
                          onClick={() => setReview({...review, rating: star})}
                          className="focus:outline-none"
                        >
                          <Star className={`w-8 h-8 transition-colors ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 hover:text-yellow-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Comment</label>
                    <textarea 
                      value={review.comment}
                      onChange={(e) => setReview({...review, comment: e.target.value})}
                      className="input-field min-h-[100px] resize-y"
                      placeholder="Share your experience with this product..."
                    />
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <p className="text-sm text-gray-700 mb-3">Please login to write a review</p>
                  <Link to="/login" className="btn-secondary btn-sm block">Login Now</Link>
                </div>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="md:col-span-2 space-y-6">
            {product.reviews?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h4>
                <p className="text-gray-500">Be the first to review this product!</p>
              </div>
            ) : (
              product.reviews?.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                        {review.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.name}</h4>
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts?.length > 0 && (
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 border-b pb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
