import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import productSlice from './slices/productSlice';
import orderSlice from './slices/orderSlice';
import deliveryReducer from './slices/deliverySlice'; // Add this
import customerOrderSlice from './slices/customerOrderSlice';
import customerHomeSlice from './slices/customerHomeSlice';
import shopSlice from './slices/shopSlice'; // Assuming you have a shop slice
export const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    products: productSlice,
    orders: orderSlice,
    delivery: deliveryReducer, // Add this line to include the delivery slice
    shop: shopSlice, // Assuming you have a shop slice
    customerOrders: customerOrderSlice,
    customerHome: customerHomeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;