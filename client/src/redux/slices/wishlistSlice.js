import { createSlice } from '@reduxjs/toolkit';
import { toggleWishlistItem } from './authSlice';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {
    setWishlist: (state, action) => { state.items = action.payload; },
  },
  extraReducers: (builder) => {
    builder.addCase(toggleWishlistItem.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export const { setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
