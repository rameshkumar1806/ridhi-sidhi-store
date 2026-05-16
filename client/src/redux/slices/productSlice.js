import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/products?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Product not found');
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/featured');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/categories');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const fetchSearchSuggestions = createAsyncThunk('products/suggestions', async (q, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/suggestions?q=${q}`);
    return data.data;
  } catch (error) {
    return rejectWithValue([]);
  }
});

export const fetchInventoryStats = createAsyncThunk('products/fetchInventoryStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/inventory/stats');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory stats');
  }
});

export const submitReview = createAsyncThunk('products/review', async ({ id, reviewData }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/products/${id}/reviews`, reviewData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Review failed');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    relatedProducts: [],
    featured: [],
    bestSellers: [],
    trending: [],
    categories: [],
    suggestions: [],
    pagination: { page: 1, pages: 1, total: 0 },
    inventoryStats: null,
    loading: false,
    productLoading: false,
    error: null,
  },
  reducers: {
    clearProductError: (state) => { state.error = null; },
    clearSuggestions: (state) => { state.suggestions = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProduct.pending, (state) => { state.productLoading = true; state.error = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.productLoading = false;
        state.currentProduct = action.payload.data;
        state.relatedProducts = action.payload.related;
      })
      .addCase(fetchProduct.rejected, (state, action) => { state.productLoading = false; state.error = action.payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload.featured;
        state.bestSellers = action.payload.bestSellers;
        state.trending = action.payload.trending;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; })
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => { state.suggestions = action.payload; })
      .addCase(fetchInventoryStats.fulfilled, (state, action) => { state.inventoryStats = action.payload; });
  },
});

export const { clearProductError, clearSuggestions } = productSlice.actions;
export default productSlice.reducer;
