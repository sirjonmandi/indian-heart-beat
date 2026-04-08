import { VerifyPaymentRequest } from '@/utils/paymentFunctions';
import apiClient from './apiClient';
import { ApiResponse, PaginatedResponse } from './types';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  images: string[];
  price: number;
  mrp: number;
  discount_percentage: number;
  alcohol_percentage: number;
  volume_ml: number;
  rating: number;
  is_featured: boolean;
  in_stock: boolean;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  rating: number;
  delivery_time: number;
  delivery_charge: number;
  minimum_order: number;
  is_open: boolean;
  distance_km: number;
  latitude: number;
  longitude: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  shop_id: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  shop: Shop;
  items: Array<{
    product: Product;
    quantity: number;
    price: number;
  }>;
  status: string;
  total_amount: number;
  delivery_charge: number;
  payment_method: string;
  delivery_address: any;
  estimated_delivery_time: string;
  actual_delivery_time?: string;
  tracking: any;
  created_at: string;
}

export const customerAPI = {
  // Home & Products
  getHomeData: (): Promise<ApiResponse<{ banners: any[]; categories: any[]; featured_products: Product[]; nearby_shops: Shop[] }>> =>
    apiClient.get('/customer/home'),

  getProducts: (params?: { page?: number; category?: string; search?: string; shop_id?: string; brand?:string; }): Promise<ApiResponse<PaginatedResponse<Product>>> =>
    apiClient.get('/customer/products', { params }),

  getProductDetails: ( params:{product_id: string; shop_id:string; variant_id:string;}): Promise<ApiResponse<{ product: Product; related_products: Product[] }>> =>
    apiClient.get("/customer/products/details",{ params }),

  getFeaturedProducts: (): Promise<ApiResponse<{ products: Product[] }>> =>
    apiClient.get('/customer/products/featured'),

  searchProducts: (query: string): Promise<ApiResponse<{ products: Product[]; suggestions: string[] }>> =>
    apiClient.get(`/customer/search?q=${query}`),

  // Categories & Brands
  getCategories: (): Promise<ApiResponse<{ categories: any[] }>> =>
    apiClient.get('/customer/categories'),

  getBrands: (): Promise<ApiResponse<{ brands: any[] }>> =>
    apiClient.get('/customer/brands'),

  // Shops
  getNearbyShops: (latitude: number, longitude: number, params?: { radius?: number; category?: string }): Promise<ApiResponse<{ shops: Shop[] }>> =>
    apiClient.get('/customer/nearby-shops', { params: { latitude, longitude, ...params } }),

  getShopDetails: (shop_id: string, customer_latitude: number, customer_longitude: number): Promise<ApiResponse<{ shop: Shop; products: Product[]; delivery_info: any }>> =>
    apiClient.get(`/customer/shops/${shop_id}`, { params: { customer_latitude, customer_longitude } }),

  // Cart
  getCart: (): Promise<ApiResponse<{ items: CartItem[]; summary: any }>> =>
    apiClient.get('/customer/cart'),

  addToCart: (data : { product_id: string, shop_id: string, quantity: number, variant_id:string, notes?: string }): Promise<ApiResponse<{ item: CartItem; cart_count: number }>> =>
    apiClient.post('/customer/cart/add', data),

  updateCartItem: (data: { cart_id: string; quantity: number }): Promise<ApiResponse<{ item: CartItem }>> =>
    apiClient.put(`/customer/cart/update`, data),

  removeFromCart: (data: { cart_id: string }): Promise<ApiResponse<{ message: string; cart_count: number }>> =>
    apiClient.delete(`/customer/cart/remove`, { data }),

  clearCart: (): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete('/customer/cart'),

  applyCoupon: (data : {code: string}): Promise<ApiResponse<{ discount: number; message: string }>> =>
    apiClient.post('/customer/cart/apply-coupon', data),

  removeCoupon: (data: {code: string}): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/customer/cart/remove-coupon', data),
  // payments
  verifyPayment: (data: VerifyPaymentRequest): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/customer/payments/verify', data),
  failedPayment: (data: { order_id: string; error_code: string; error_description: string }): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/customer/payments/failed', data),
  // Orders
  createOrder: (data: {
    delivery_address_id?: string;
    order_type: string;
    payment_method: string;
    payment_data?: any;
    coupon_code?: string;
    notes?: string;
    scheduled_at?: string;
  }): Promise<ApiResponse<{ order: Order; payment_intent?: any }>> =>
    apiClient.post('/customer/orders', data),

  getOrders: (params?: { status?: string; page?: number }): Promise<ApiResponse<PaginatedResponse<Order>>> =>
    apiClient.get('/customer/orders', { params }),

  getOrderDetails: (order_id: string): Promise<ApiResponse<{ order: Order }>> =>
    apiClient.get(`/customer/orders/${order_id}`),

  cancelOrder: (order_id: string, reason: string): Promise<ApiResponse<{ message: string; refund_amount?: number }>> =>
    apiClient.post(`/customer/orders/${order_id}/cancel`, { reason }),

  reorderItems: (order_id: string): Promise<ApiResponse<{ message: string; cart_items: number }>> =>
    apiClient.post(`/customer/orders/${order_id}/reorder`),

  // Order Tracking
  getOrderTracking: (order_id: string): Promise<ApiResponse<{ tracking: any; delivery_partner?: any; eta?: any }>> =>
    apiClient.get(`/customer/orders/${order_id}/tracking`),

  // Reviews & Ratings
  rateOrder: (order_id: string, data: { shop_rating: number; delivery_rating: number; product_ratings?: any; review?: string }): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/customer/orders/${order_id}/rate`, data),

  getReviews: (params?: { product_id?: string; shop_id?: string; page?: number }): Promise<ApiResponse<PaginatedResponse<any>>> =>
    apiClient.get('/customer/reviews', { params }),

  // Addresses
  getAddresses: (): Promise<ApiResponse<{ addresses: any[] }>> =>
    apiClient.get('/customer/addresses'),

  addAddress: (data: any): Promise<ApiResponse<{ address: any }>> =>
    apiClient.post('/customer/addresses', data),

  updateAddress: (address_id: string, data: any): Promise<ApiResponse<{ address: any }>> =>
    apiClient.put(`/customer/addresses/${address_id}`, data),

  deleteAddress: (address_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/customer/addresses/${address_id}`),

  setDefaultAddress: (address_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/customer/addresses/${address_id}/set-default`),

  // Profile
  getProfile: (): Promise<ApiResponse<{ user: any; profile: any; preferences: any }>> =>
    apiClient.get('/customer/profile'),

  updateProfile: (data: any): Promise<ApiResponse<{ user: any }>> =>
    apiClient.put('/customer/profile', data),

  changePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/customer/change-password', data),

  // Notifications
  getNotifications: (params?: { page?: number; unread_only?: boolean }): Promise<ApiResponse<PaginatedResponse<any>>> =>
    apiClient.get('/customer/notifications', { params }),

  markNotificationRead: (notification_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/customer/notifications/${notification_id}/read`),

  markAllNotificationsRead: (): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/customer/notifications/mark-all-read'),

  // Coupons & Offers
  getAvailableCoupons: (): Promise<ApiResponse<{ coupons: any[] }>> =>
    apiClient.get('/customer/coupons'),

  // Wishlist
  getWishlist: (): Promise<ApiResponse<{ items: any[] }>> =>
    apiClient.get('/customer/wishlist'),

  addToWishlist: (product_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/customer/wishlist', { product_id }),

  removeFromWishlist: (product_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/customer/wishlist/${product_id}`),

  // Wallet & Referrals
  getWallet: (): Promise<ApiResponse<{ balance: number; transactions: any[] }>> =>
    apiClient.get('/customer/wallet'),

  getReferralInfo: (): Promise<ApiResponse<{ referral_code: string; referrals: any[]; rewards: any }>> =>
    apiClient.get('/customer/referral'),

  // Support
  getHelpTopics: (): Promise<ApiResponse<{ topics: any[] }>> =>
    apiClient.get('/customer/help'),

  createSupportTicket: (data: { subject: string; message: string; category: string; attachments?: string[] }): Promise<ApiResponse<{ ticket: any }>> =>
    apiClient.post('/customer/support', data),

  getSupportTickets: (): Promise<ApiResponse<{ tickets: any[] }>> =>
    apiClient.get('/customer/support'),
};
