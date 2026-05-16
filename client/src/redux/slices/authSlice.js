import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Load user from localStorage
const userFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// Async Thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('userInfo', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('userInfo', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', userData);
    localStorage.setItem('userInfo', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Update failed');
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/profile');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load profile');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data.message;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/auth/reset-password/${token}`, { password });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Password reset failed');
  }
});

export const toggleWishlistItem = createAsyncThunk('auth/toggleWishlist', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/auth/wishlist/${productId}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('userInfo');
      toast.success('Logged out successfully');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    updateUserLocally: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('userInfo', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; });
    builder.addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    // Register
    builder.addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; });
    builder.addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    // Update Profile
    builder.addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; });
    builder.addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    // Get Profile
    builder.addCase(getProfile.fulfilled, (state, action) => {
      state.user = { ...state.user, ...action.payload };
    });
    // Forgot Password
    builder.addCase(forgotPassword.pending, (state) => { state.loading = true; });
    builder.addCase(forgotPassword.fulfilled, (state, action) => { state.loading = false; state.message = action.payload; });
    builder.addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    // Reset Password
    builder.addCase(resetPassword.pending, (state) => { state.loading = true; });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload?.data?.token) {
        // Auto login after reset
        state.user = { token: action.payload.data.token };
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    });
    builder.addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    // Toggle Wishlist
    builder.addCase(toggleWishlistItem.fulfilled, (state, action) => {
      if (state.user) {
        state.user.wishlist = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    });
  },
});

export const { logout, clearAuthError, clearMessage, updateUserLocally } = authSlice.actions;
export default authSlice.reducer;
