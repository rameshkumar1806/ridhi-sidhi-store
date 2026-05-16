import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', orderData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Order creation failed');
  }
});

export const fetchMyOrders = createAsyncThunk('orders/myOrders', async (params = {}, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/orders/my-orders?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/orders/${id}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Order not found');
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/${id}/cancel`, { reason });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Cancellation failed');
  }
});

export const createRazorpayOrder = createAsyncThunk('orders/razorpay/create', async (amount, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders/razorpay/create', { amount });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Payment initiation failed');
  }
});

export const verifyRazorpayPayment = createAsyncThunk('orders/razorpay/verify', async (paymentData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders/razorpay/verify', paymentData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
  }
});

// Admin thunks
export const fetchAllOrders = createAsyncThunk('orders/admin/all', async (params = {}, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/orders/admin/all?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/admin/updateStatus', async ({ id, status, note, trackingNumber }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/admin/${id}/status`, { status, note, trackingNumber });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Update failed');
  }
});

export const deleteOrderAdmin = createAsyncThunk('orders/admin/delete', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/orders/admin/${id}`);
    return id; // Return the ID so we can remove it from state
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Delete failed');
  }
});


export const fetchDashboardStats = createAsyncThunk('orders/admin/dashboard', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/admin/dashboard');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    dashboardStats: null,
    pagination: {},
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearOrderError: (state) => { state.error = null; },
    clearOrderSuccess: (state) => { state.success = false; },
    resetCurrentOrder: (state) => { state.currentOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(createOrder.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; state.success = true; })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchOrder.pending, (state) => { state.loading = true; })
      .addCase(fetchOrder.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; })
      .addCase(fetchOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(fetchAllOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchAllOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
        if (state.currentOrder?._id === action.payload._id) state.currentOrder = action.payload;
      })
      .addCase(deleteOrderAdmin.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o._id !== action.payload);
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.dashboardStats = action.payload; });
  },
});

export const { clearOrderError, clearOrderSuccess, resetCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
