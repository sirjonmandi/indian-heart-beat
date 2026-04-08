export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  
  // Customer
  CUSTOMER: {
    HOME: '/customer/home',
    PRODUCTS: '/customer/products',
    CART: '/customer/cart',
    ORDERS: '/customer/orders',
    PROFILE: '/customer/profile',
    ADDRESSES: '/customer/addresses',
    NEARBY_SHOPS: '/customer/nearby-shops',
  },
  
  // Shop
  SHOP: {
    DASHBOARD: '/shop/dashboard',
    ORDERS: '/shop/orders',
    INVENTORY: '/shop/inventory',
    EARNINGS: '/shop/earnings',
    PROFILE: '/shop/profile',
  },
  
  // Delivery
  DELIVERY: {
    DASHBOARD: '/delivery/dashboard',
    ORDERS: '/delivery/orders',
    EARNINGS: '/delivery/earnings',
    PROFILE: '/delivery/profile',
    LOCATION: '/delivery/update-location',
  },
  
  // Location
  LOCATION: {
    SERVICEABILITY: '/location/check-serviceability',
    GEOCODE: '/location/geocode',
    REVERSE_GEOCODE: '/location/reverse-geocode',
    DISTANCE: '/location/calculate-distance',
  },
  
  // Payment
  PAYMENT: {
    METHODS: '/customer/payment-methods',
    RAZORPAY_ORDER: '/payment/razorpay/create-order',
    RAZORPAY_VERIFY: '/payment/razorpay/verify',
    REFUND: '/payment/refund',
  },
  
  // Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    MULTIPLE: '/upload/multiple',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;



// ================================
// USAGE EXAMPLES
// ================================

// Example usage in components:
/*
// In a React component with Redux
import { useDispatch } from 'react-redux';
import { deliveryAPI } from '@services/api';
import { setCurrentLocation } from '@store/slices/deliverySlice';

const DeliveryComponent = () => {
  const dispatch = useDispatch();

  const updateLocation = async (location) => {
    try {
      await deliveryAPI.updateLocation(location);
      dispatch(setCurrentLocation(location));
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  return (
    // Component JSX
  );
};

// With React Query hooks
import { useProducts, useAddToCart } from '@services/api/hooks';

const ProductList = () => {
  const { data: products, isLoading, error } = useProducts({ category: 'beer' });
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate({
      product_id: productId,
      shop_id: 'shop123',
      quantity: 1,
    });
  };

  return (
    // Component JSX
  );
};
*/