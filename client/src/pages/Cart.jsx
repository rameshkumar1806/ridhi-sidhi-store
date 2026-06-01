import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } from '../redux/slices/cartSlice';
import { getProductImage } from '../utils/helpers';
import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, shippingCharge, gst, coupon, totalItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleQuantity = (id, currentQty, type, maxStock) => {
    let newQty = currentQty;
    if (type === 'inc' && currentQty < maxStock && currentQty < 10) newQty++;
    if (type === 'dec' && currentQty > 1) newQty--;
    
    if (newQty !== currentQty) {
      dispatch(updateQuantity({ id, quantity: newQty }));
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (!user) {
      toast.error('Please login to apply coupons');
      navigate('/login?redirect=/cart');
      return;
    }

    setApplyingCoupon(true);
    try {
      const { data } = await api.post('/coupons/validate', { 
        code: couponCode, 
        orderAmount: subtotal 
      });
      dispatch(applyCoupon(data.data));
      setCouponCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const itemsText = items
      .map((item, index) => `${index + 1}. *${item.name}* - ${item.quantity} x ₹${item.price}`)
      .join('\n');
    
    const message = `Hello Ridhi Sidhi General Store, I would like to place an order:

*Items:*
${itemsText}

*Subtotal:* ₹${subtotal}
*GST:* ₹${Math.round(gst)}
*Shipping:* ${shippingCharge === 0 ? 'FREE' : '₹' + shippingCharge}
*Total Amount:* ₹${Math.round(totalAmount)}

Please let me know if these items are in stock, and we can confirm the delivery address and payment!`;

    const whatsappUrl = `https://wa.me/919982548621?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const totalAmount = subtotal + shippingCharge + gst - (coupon?.discountAmount || 0);

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-primary-300" />
        </div>
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Let's find some great products!</p>
        <Link to="/products" className="btn-primary flex items-center gap-2">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Shopping Cart ({totalItems} items)</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Total</div>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item._id} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Product Info */}
                  <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                    <Link to={`/products/${item.slug || item._id}`} className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden p-2">
                      <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-contain" />
                    </Link>
                    <div className="flex-1">
                      <div className="text-xs text-primary-600 font-semibold mb-1 uppercase tracking-wider">{item.brand}</div>
                      <Link to={`/products/${item.slug || item._id}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 md:line-clamp-1 mb-1">
                        {item.name}
                      </Link>
                      <div className="text-sm text-gray-500 mb-2">{item.weight || `1 ${item.unit}`}</div>
                      
                      {/* Mobile Price & Quantity */}
                      <div className="flex md:hidden items-center justify-between mt-2">
                        <span className="font-bold text-gray-900">₹{item.price}</span>
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-8">
                          <button onClick={() => handleQuantity(item._id, item.quantity, 'dec', item.stock)} className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600"><Minus className="w-3 h-3" /></button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => handleQuantity(item._id, item.quantity, 'inc', item.stock)} disabled={item.quantity >= item.stock} className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 disabled:opacity-50"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                    {/* Mobile Remove */}
                    <button onClick={() => dispatch(removeFromCart(item._id))} className="md:hidden self-start p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Desktop Quantity */}
                  <div className="hidden md:flex col-span-2 justify-center">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl h-10 shadow-sm overflow-hidden">
                      <button onClick={() => handleQuantity(item._id, item.quantity, 'dec', item.stock)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="w-10 text-center font-semibold border-x border-gray-100">{item.quantity}</span>
                      <button onClick={() => handleQuantity(item._id, item.quantity, 'inc', item.stock)} disabled={item.quantity >= item.stock} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Desktop Price */}
                  <div className="hidden md:block col-span-2 text-center font-medium text-gray-600">
                    ₹{item.price}
                  </div>

                  {/* Desktop Total & Remove */}
                  <div className="hidden md:flex col-span-2 items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg">₹{item.price * item.quantity}</span>
                    <button onClick={() => dispatch(removeFromCart(item._id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove Item">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => dispatch(clearCart())} className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-[400px]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* Coupon Code */}
            <div className="mb-6">
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                  <div>
                    <span className="text-sm font-bold text-green-800 uppercase">{coupon.code}</span>
                    <p className="text-xs text-green-600 mt-0.5">Coupon applied successfully</p>
                  </div>
                  <button onClick={() => dispatch(removeCoupon())} className="p-1 hover:bg-green-100 rounded text-green-800 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    className="input-field flex-1 uppercase py-2.5 text-sm"
                  />
                  <button type="submit" disabled={!couponCode || applyingCoupon} className="btn-secondary whitespace-nowrap px-4 py-2.5">
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST / Taxes</span>
                <span className="font-medium text-gray-900">₹{Math.round(gst)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Charge</span>
                {shippingCharge === 0 ? (
                  <span className="font-bold text-green-600">FREE</span>
                ) : (
                  <span className="font-medium text-gray-900">₹{shippingCharge}</span>
                )}
              </div>
              {coupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({coupon.code})</span>
                  <span>-₹{coupon.discountAmount}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-base font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-primary-600">₹{Math.round(totalAmount)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">Includes all taxes and shipping</p>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3.5 shadow-lg shadow-primary-500/30 hover:-translate-y-1"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>

            <button 
              onClick={handleWhatsAppOrder}
              className="w-full flex items-center justify-center gap-2 text-lg py-3.5 mt-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all hover:-translate-y-1"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg>
              Order on WhatsApp
            </button>

            <Link to="/products" className="block text-center text-primary-600 font-medium text-sm mt-4 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
