import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const calculateTotals = (items) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  return { subtotal, totalItems };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: cartItemsFromStorage,
    shippingAddress: null,
    paymentMethod: 'cod',
    coupon: null,
    shippingCharge: 0,
    gst: 0,
    ...calculateTotals(cartItemsFromStorage),
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i._id === product._id);

      if (existing) {
        existing.quantity += quantity;
        toast.success(`${product.name} quantity updated!`);
      } else {
        state.items.push({ ...product, quantity });
        toast.success(`${product.name} added to cart!`);
      }

      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.totalItems = totals.totalItems;

      // Calculate GST (simplified)
      state.gst = state.items.reduce((acc, item) => {
        return acc + (item.price * item.quantity * (item.gst || 0)) / 100;
      }, 0);

      state.shippingCharge = state.subtotal >= 499 ? 0 : 49;

      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) {
        state.items = state.items.filter((i) => i._id !== action.payload);
        toast.success(`${item.name} removed from cart`);
        const totals = calculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.totalItems = totals.totalItems;
        state.gst = state.items.reduce((acc, i) => acc + (i.price * i.quantity * (i.gst || 0)) / 100, 0);
        state.shippingCharge = state.subtotal >= 499 ? 0 : state.items.length > 0 ? 49 : 0;
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i._id !== id);
        } else {
          item.quantity = quantity;
        }
        const totals = calculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.totalItems = totals.totalItems;
        state.gst = state.items.reduce((acc, i) => acc + (i.price * i.quantity * (i.gst || 0)) / 100, 0);
        state.shippingCharge = state.subtotal >= 499 ? 0 : state.items.length > 0 ? 49 : 0;
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.totalItems = 0;
      state.gst = 0;
      state.shippingCharge = 0;
      state.coupon = null;
      localStorage.removeItem('cartItems');
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      toast.success(`Coupon "${action.payload.code}" applied! You save ₹${action.payload.discountAmount}`);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      toast.success('Coupon removed');
    },
  },
});

export const {
  addToCart, removeFromCart, updateQuantity, clearCart,
  saveShippingAddress, setPaymentMethod, applyCoupon, removeCoupon,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.subtotal;
export const selectCartItemsCount = (state) => state.cart.totalItems;
export const selectGrandTotal = (state) => {
  const { subtotal, shippingCharge, gst, coupon } = state.cart;
  const discount = coupon?.discountAmount || 0;
  return subtotal + shippingCharge + gst - discount;
};

export default cartSlice.reducer;
