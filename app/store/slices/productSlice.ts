import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductState, Product, Category, ProductFilters } from '../types';

const initialState: ProductState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
  filters: {
    category: null,
    priceRange: [0, 10000],
    rating: 0,
    sortBy: 'popularity',
    inStockOnly: true,
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.loading = false;
      state.products = action.payload;
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCategoriesSuccess: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchCategoriesSuccess,
  updateFilters,
  clearFilters,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;