import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, setPaymentMethod, clearCart } from '../redux/slices/cartSlice';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment, clearOrderSuccess } from '../redux/slices/orderSlice';
import { MapPin, CreditCard, CheckCircle, ChevronRight, Lock, Truck, ShieldCheck, Home, AlertCircle } from 'lucide-react';
import { getProductImage } from '../utils/helpers';
import toast from 'react-hot-toast';
import OpenStreetMapAddress from '../components/checkout/OpenStreetMapAddress';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, paymentMethod, subtotal, shippingCharge, gst, coupon } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { success, loading, currentOrder } = useSelector((state) => state.orders);

  const [step, setStep] = useState(1);
  
  // Available addresses could be loaded from user, currently using form state
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    latitude: null,
    longitude: null,
    formattedAddress: '',
  });

  const [selectedPayment, setSelectedPayment] = useState(paymentMethod || 'cod');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [isDeliverable, setIsDeliverable] = useState(true);

  const totalAmount = subtotal + shippingCharge + gst - (coupon?.discountAmount || 0);

  useEffect(() => {
    if (items.length === 0 && step === 1) {
      navigate('/cart');
    }
  }, [items, navigate, step]);

  useEffect(() => {
    if (success && currentOrder) {
      dispatch(clearCart());
      dispatch(clearOrderSuccess());
      navigate(`/orders/${currentOrder._id}`);
    }
  }, [success, currentOrder, navigate, dispatch]);

  const handleAddressSelect = (details) => {
    setAddressForm(prev => ({
      ...prev,
      ...details
    }));
    // Mock delivery validation
    if (details.pincode) {
      // Mock validation logic
      setIsDeliverable(true);
      setDeliveryEstimate('Delivery in 15-30 minutes');
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.houseNo || !addressForm.street || !addressForm.city || !addressForm.pincode || !addressForm.phone || !addressForm.fullName) {
      toast.error('Please fill all mandatory address fields');
      return;
    }
    if (!addressForm.latitude || !addressForm.longitude) {
      toast.error('Please select location on the map');
      return;
    }
    dispatch(saveShippingAddress(addressForm));
    setStep(2);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    dispatch(setPaymentMethod(selectedPayment));

    const orderData = {
      orderItems: items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        image: getProductImage(i),
        price: i.price,
        product: i._id,
      })),
      shippingAddress: addressForm,
      paymentMethod: selectedPayment,
      subtotal,
      shippingCharge,
      gst,
      discount: coupon?.discountAmount || 0,
      totalAmount,
      coupon: coupon?.code,
    };

    if (selectedPayment === 'cod') {
      dispatch(createOrder(orderData));
    } else if (selectedPayment === 'razorpay') {
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const resultAction = await dispatch(createRazorpayOrder(totalAmount));
      if (createRazorpayOrder.fulfilled.match(resultAction)) {
        const rzpOrder = resultAction.payload;
        
        const dbOrderResult = await dispatch(createOrder(orderData));
        if (createOrder.fulfilled.match(dbOrderResult)) {
          const dbOrder = dbOrderResult.payload;

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
            amount: rzpOrder.amount,
            currency: 'INR',
            name: 'Ridhi Sidhi Store',
            description: 'Grocery Purchase',
            image: 'https://placehold.co/100x100/FF6B35/white?text=RS',
            order_id: rzpOrder.id,
            handler: async function (response) {
              const verifyData = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: dbOrder._id,
              };
              const verifyResult = await dispatch(verifyRazorpayPayment(verifyData));
              if (verifyRazorpayPayment.fulfilled.match(verifyResult)) {
                toast.success('Payment successful!');
                dispatch(clearCart());
                navigate(`/orders/${dbOrder._id}`);
              }
            },
            prefill: {
              name: addressForm.fullName,
              email: user?.email,
              contact: addressForm.phone,
            },
            theme: { color: '#FF6B35' },
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.open();
        }
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom">
        {/* Checkout Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-200'}`}>1</div>
              <span className="font-semibold hidden sm:inline">Shipping</span>
            </div>
            <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 rounded ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-200'}`}>2</div>
              <span className="font-semibold hidden sm:inline">Payment</span>
            </div>
            <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 rounded ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-200'}`}>3</div>
              <span className="font-semibold hidden sm:inline">Review</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Location</h2>
                </div>
                
                <div className="mb-8 border border-gray-200 rounded-2xl p-4 bg-gray-50">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-500"/> Select Location on Map</h3>
                  <OpenStreetMapAddress onAddressSelect={handleAddressSelect} />
                  
                  {addressForm.formattedAddress && (
                    <div className="mt-4 p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <span className="font-semibold block">Selected Address:</span>
                        {addressForm.formattedAddress}
                      </div>
                    </div>
                  )}

                  {addressForm.pincode && (
                    <div className="mt-3 flex items-center gap-2">
                      {isDeliverable ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5" /> {deliveryEstimate}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Delivery not available in this area
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-t pt-6"><Home className="w-4 h-4 text-primary-500"/> Complete Address Details</h3>
                <form onSubmit={handleAddressSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="input-label">Full Name *</label>
                      <input 
                        type="text" required
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                        className="input-field" placeholder="Enter Full Name"
                      />
                    </div>
                    <div>
                      <label className="input-label">Mobile Number *</label>
                      <input 
                        type="tel" required pattern="[0-9]{10}" maxLength="10"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                        className="input-field" placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="input-label">House / Flat / Block No. *</label>
                      <input 
                        type="text" required
                        value={addressForm.houseNo}
                        onChange={(e) => setAddressForm({...addressForm, houseNo: e.target.value})}
                        className="input-field" placeholder="e.g. Flat 402, Block A"
                      />
                    </div>
                    <div>
                      <label className="input-label">Street / Area / Locality *</label>
                      <input 
                        type="text" required
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                        className="input-field" placeholder="e.g. MG Road"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Landmark (Optional)</label>
                    <input 
                      type="text"
                      value={addressForm.landmark}
                      onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                      className="input-field" placeholder="e.g. Near Metro Station"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="input-label">City *</label>
                      <input 
                        type="text" required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                        className="input-field" placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="input-label">State *</label>
                      <input 
                        type="text" required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                        className="input-field" placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="input-label">Pincode *</label>
                      <input 
                        type="text" required pattern="[0-9]{6}" maxLength="6"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                        className="input-field" placeholder="6-digit Pincode"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={!isDeliverable} className="btn-primary flex items-center gap-2">
                      Save & Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary-500">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  </div>
                  <button onClick={() => setStep(1)} className="text-sm font-medium text-primary-600 hover:underline">Edit Address</button>
                </div>

                <div className="space-y-4">
                  <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedPayment === 'razorpay' ? 'border-primary-500 bg-orange-50/50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="razorpay"
                        checked={selectedPayment === 'razorpay'}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">Pay Online (Razorpay)</span>
                          <div className="flex gap-1">
                            <span className="text-xs bg-white px-2 py-1 rounded shadow-sm border font-medium">UPI / Cards</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Secure payment via UPI, Credit/Debit Cards, NetBanking</p>
                      </div>
                    </div>
                  </label>

                  <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedPayment === 'cod' ? 'border-primary-500 bg-orange-50/50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="cod"
                        checked={selectedPayment === 'cod'}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                        <p className="text-sm text-gray-500 mt-1">Pay at your doorstep when receiving the order</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="btn-outline">Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">
                    Review Order <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Review Your Order</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500"/> Delivery To</h3>
                      <button onClick={() => setStep(1)} className="text-xs text-primary-600 font-medium hover:underline">Edit</button>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{addressForm.fullName}</p>
                    <p className="text-sm text-gray-600 mt-1">{addressForm.houseNo}, {addressForm.street}</p>
                    {addressForm.landmark && <p className="text-sm text-gray-600">Landmark: {addressForm.landmark}</p>}
                    <p className="text-sm text-gray-600">{addressForm.city}, {addressForm.state} - {addressForm.pincode}</p>
                    <p className="text-sm text-gray-600 mt-1">Phone: {addressForm.phone}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2"><CreditCard className="w-4 h-4 text-gray-500"/> Payment</h3>
                      <button onClick={() => setStep(2)} className="text-xs text-primary-600 font-medium hover:underline">Edit</button>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {selectedPayment === 'razorpay' ? 'Online Payment (UPI/Card)' : 'Cash on Delivery (COD)'}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium bg-green-100/50 w-fit px-2 py-1 rounded">
                      <Lock className="w-3 h-3" /> Secure Checkout
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Truck className="w-4 h-4 text-gray-500"/> Order Items ({items.length})</h3>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                    {items.map(item => (
                      <div key={item._id} className="p-4 flex gap-4">
                        <img src={getProductImage(item)} alt="" className="w-16 h-16 object-contain rounded bg-gray-50 border p-1" />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-semibold text-gray-900">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 flex justify-between">
                  <button onClick={() => setStep(2)} className="btn-outline">Back</button>
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={loading}
                    className="btn-primary px-8 flex items-center gap-2 shadow-lg shadow-primary-500/30"
                  >
                    {loading ? 'Processing...' : `Pay ₹${Math.round(totalAmount)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Order Summary */}
          <div className="lg:w-[350px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Items Total</span>
                  <span className="font-medium text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST / Taxes</span>
                  <span className="font-medium text-gray-900">₹{Math.round(gst)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
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

              <div className="flex justify-between items-end mb-6">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">₹{Math.round(totalAmount)}</span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  Safe and secure payments. 100% Authentic products. Return policy available for eligible items.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
