import { Header } from '@/components';
import apiClient from './apiClient';
import { ApiResponse, PaginatedResponse } from './types';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

// Updated interfaces to match PHP controller response
export interface ShopDashboardData {
  // Main status indicators - matching PHP response
  isActive: boolean;
  shopStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: Array<{
    id: string;
    order_number: string;
    customer: {
      name: string;
      phone: string;
    };
    items: Array<{
      product_name: string;
      quantity: number;
      price: number;
    }>;
    total_amount: number;
    payment_method: string;
    status: string;
    created_at: string;
  }>;
  completedOrders: number;
  rating: number;
  performance: number;
  
  // Detailed stats object
  stats: {
    ordersToday: number;
    avgOrderValue: number;
    topSellingProduct: string;
    weeklyOrders?: number;
    weeklyCompletedOrders?: number;
  };
  
  // Shop information
  shop: {
    id: string;
    name: string;
    status: string;
    verified_at: string | null;
    is_accepting_orders: boolean;
    commission_rate: number;
    minimum_order_amount: number;
  };
  
  // Additional context
  canToggleStatus: boolean;
  statusMessage: string;
}

export interface ShopOrder {
  id: string;
  order_number: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  estimated_delivery_time?: string;
}

export interface InventoryItem {
  id: string;
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    images: string[];
  };
  selling_price: number;
  stock: number;
  low_stock_threshold: number;
  is_available: boolean;
  is_featured: boolean;
  last_updated: string;
}

export interface EarningsData {
  chart_data: Array<{
    date: string;
    earnings: number;
  }>;
  total_earnings: number;
  this_month_earnings: number;
  pending_settlement: number;
}

export interface Settlement {
  id: string;
  amount: number;
  status: string;
  transaction_id: string;
  settled_at: string;
  created_at: string;
}

// Toggle status response interface
export interface ToggleStatusResponse {
  is_active: boolean;
  message: string;
  shop_status: string;
  can_accept_orders: boolean;
}

export const shopAPI = {
  // Dashboard
  getDashboardData: (): Promise<ApiResponse<ShopDashboardData>> =>
    apiClient.get('/shop/dashboard'),

  // Shop Status - Updated to handle new response structure
  toggleShopStatus: (is_active: boolean): Promise<ApiResponse<ToggleStatusResponse>> =>
    apiClient.post('/shop/toggle-status', { is_active }),

  // Get shop statistics for date range
  getShopStats: (params: {
    start_date: string;
    end_date: string;
  }): Promise<ApiResponse<{
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    average_order_value: number;
    period: {
      start_date: string;
      end_date: string;
      days: number;
    };
  }>> =>
    apiClient.get('/shop/dashboard/stats', { params }),

  // Orders
  getOrders: (params?: { 
    status?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<ApiResponse<{
    orders: ShopOrder[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      per_page: number;
    };
  }>> =>
    apiClient.get('/shop/orders', { params }),

  getShopReports: (period?: string): Promise<ApiResponse<{
    report: {
      total_orders: number;
      completed_orders: number;
      cancelled_orders: number;
      total_revenue: number;
      average_order_value: number;
    };
  }>> =>
    apiClient.get('/shop/reports', { params: { period } }),

  getShopSettings: (): Promise<ApiResponse<{
    autoAcceptOrders: boolean;
    notificationPreference: {
      enabled: boolean;
      orderNotifications: boolean;
      paymentNotifications: boolean;
    };
  }>> =>
    apiClient.get('/shop/settings/notification-preference'),

  updateShopSettings: (data: {
    auto_accept_orders: boolean;
    enable_notifications: boolean;
    sound_notifications: boolean;
    vibration_notifications: boolean;
    order_notifications: boolean;
    payment_notifications: boolean;
  }): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/shop/settings/notification-preference', data),

  getPendingOrders: (): Promise<ApiResponse<{
    orders: ShopOrder[];
    pagination: any;
  }>> =>
    apiClient.get('/shop/orders', { params: { status: 'pending' } }),

  getOrderDetails: (orderId: string): Promise<ApiResponse<{ order: ShopOrder }>> =>
    apiClient.get(`/shop/orders/${orderId}`),

  acceptOrder: (orderId: string): Promise<ApiResponse<{ 
    order: { id: string; status: string }; 
    message: string; 
  }>> =>
    apiClient.post(`/shop/orders/${orderId}/accept`),

  rejectOrder: (orderId: string, reason?: string): Promise<ApiResponse<{ 
    order_id: string; 
    message: string; 
  }>> =>
    apiClient.post(`/shop/orders/${orderId}/reject`, { reason }),

  markOrderReady: (orderId: string): Promise<ApiResponse<{ 
    order: { id: string; status: string }; 
    message: string; 
  }>> =>
    apiClient.post(`/shop/orders/${orderId}/ready`),

  //Bank Detials
  fetchBankDetails: (): Promise<ApiResponse<{ partner: any; documents: any; bank_details: any }>> =>
  apiClient.get('/shop/bank-details'),

  updateBankDetails: (data: any): Promise<ApiResponse<{ bank_details: any }>> =>
  apiClient.post('/shop/bank-details', data),

  // Inventory - Updated to handle axios response structure
  getInventory: (params?: { 
    search?: string; 
    category?: string; 
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<{
    inventory: InventoryItem[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      per_page: number;
    };
  }>> =>
    apiClient.get('/shop/inventory', { params }),

  addProduct: (productData: {
    name: string;
    brand: string;
    category: string;
    description?: string;
    price: number;
    mrp?: number;
    stock: number;
    alcoholPercentage?: number;
    volume?: number;
    images?: string[]; // Changed from File[] to string[] for React Native
    isActive?: boolean;
    lowStockThreshold?: number;
  }): Promise<ApiResponse<{ message: string }>> => {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('name', productData.name);
    formData.append('brand', productData.brand);
    formData.append('category', productData.category);
    formData.append('price', productData.price.toString());
    formData.append('stock', productData.stock.toString());
    
    // Add optional fields
    if (productData.description) formData.append('description', productData.description);
    if (productData.mrp) formData.append('mrp', productData.mrp.toString());
    if (productData.alcoholPercentage) formData.append('alcoholPercentage', productData.alcoholPercentage.toString());
    if (productData.volume) formData.append('volume', productData.volume.toString());
    if (productData.isActive !== undefined) formData.append('isActive', productData.isActive ? '1' : '0'); // Convert boolean to string
    if (productData.lowStockThreshold) formData.append('lowStockThreshold', productData.lowStockThreshold.toString());
    
    // Add images for React Native
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((imageUri, index) => {
        // Create file object for React Native
        const imageFile = {
          uri: imageUri,
          type: 'image/jpeg', // Default to jpeg
          name: `image_${index}.jpg`,
        } as any;
        
        formData.append('images[]', imageFile);
      });
    }
    
    return apiClient.post('/shop/inventory', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateProductAvailability: (
    productId: string, 
    is_available: boolean
  ): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/shop/inventory/${productId}/toggle-availability`, { is_available }),

  updateProductStock: (
    productId: string, 
    stock: number
  ): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/shop/inventory/${productId}/stock`, { stock }),

  updateProductPrice: (
    productId: string, 
    price: number
  ): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/shop/inventory/${productId}/price`, { price }),

  deleteProduct: (productId: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/shop/inventory/${productId}`),

  getLowStockItems: (): Promise<ApiResponse<{
    low_stock_items: Array<{
      id: string;
      product: {
        id: string;
        name: string;
        brand: string;
        category: string;
      };
      current_stock: number;
      threshold: number;
      urgency: 'out_of_stock' | 'low_stock';
    }>;
  }>> =>
    apiClient.get('/shop/inventory/low-stock'),
  // get single product
  getInventoryProduct: (productId: string): Promise<ApiResponse<InventoryItem>> =>
    apiClient.get(`/shop/inventory/${productId}`),

  // Update product details
  updateProduct: (productId: string, productData:{
    name: string;
    brand: string;
    category: string;
    description?: string;
    price: number;
    mrp?: number;
    stock: number;
    alcoholPercentage?: number;
    volume?: number;
    images?: string[]; // Changed from File[] to string[] for React Native
    isActive?: boolean;
    lowStockThreshold?: number;
  }): Promise<ApiResponse<{ message: string }>> =>{
    const formData = new FormData();

    formData.append('_method', 'PUT'); // Use PUT method for update
    
    // Add fields
    if (productData.name) formData.append('name', productData.name);
    if (productData.brand) formData.append('brand', productData.brand);
    if (productData.category) formData.append('category', productData.category);

    if (productData.price) formData.append('price', productData.price.toString());
    if (productData.stock) formData.append('stock', productData.stock.toString());
    if (productData.description) formData.append('description', productData.description);
    if (productData.mrp) formData.append('mrp', productData.mrp.toString());
    if (productData.alcoholPercentage) formData.append('alcoholPercentage', productData.alcoholPercentage.toString());
    if (productData.volume) formData.append('volume', productData.volume.toString());
    if (productData.isActive !== undefined) formData.append('isActive', productData.isActive ? '1' : '0'); // Convert boolean to string
    if (productData.lowStockThreshold) formData.append('lowStockThreshold', productData.lowStockThreshold.toString());
    
    // Add images for React Native
    if (productData.images && productData.images.length >= 0) {

      const images = productData.images;
      // Separate existing and new images
      const existingImages = images.filter(uri => uri.startsWith('http'));
      existingImages.forEach((imageUri) => {
          formData.append('keepImages[]', imageUri);
      });
      const newImages = images.filter(uri => uri.startsWith('file://'));
        newImages.forEach((imageUri, index) => {
          // Create file object for React Native
          const imageFile = {
            uri: imageUri,
            type: 'image/jpeg', // Default to jpeg
            name: `image_${index}.jpg`,
          } as any;
          formData.append('images[]', imageFile);
        });
    }

    return apiClient.post(`/shop/inventory/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Earnings & Reports
  getEarningsData: (params?:{period?:string}): Promise<ApiResponse<EarningsData>> =>
    apiClient.get(`/shop/earnings`,{params}),
  // getEarningsData: (period: string = 'month'): Promise<ApiResponse<EarningsData>> =>
  //   apiClient.get(`/shop/earnings?period=${period}`),

  getSettlements: (): Promise<ApiResponse<{ settlements: Settlement[] }>> =>
    apiClient.get('/shop/settlements'),

  downloadSettments:(): Promise<ApiResponse<{ settlements: Settlement[] }>> =>
    apiClient.get('/shop/settlements/download/data',{
      responseType: 'blob', // Important for file downloads
    }),

  // Enhanced utility methods for development/testing
  getDummyDashboardData: (): Promise<ApiResponse<ShopDashboardData>> => {
    // Updated to match the new PHP controller response structure
    return Promise.resolve({
      success: true,
      data: {
        // Main status indicators
        isActive: true,
        shopStatus: 'approved' as const,
        todayRevenue: 15500,
        totalOrders: 42,
        pendingOrders: [
          {
            id: '1',
            order_number: 'SH001',
            customer: {
              name: 'John Doe',
              phone: '+91 9876543210',
            },
            items: [
              { product_name: 'Premium Whiskey', quantity: 1, price: 1000 },
              { product_name: 'Beer Pack', quantity: 1, price: 250 },
            ],
            total_amount: 1250,
            payment_method: 'Online',
            status: 'pending',
            created_at: '2 mins ago',
          },
          {
            id: '2',
            order_number: 'SH002',
            customer: {
              name: 'Jane Smith',
              phone: '+91 9876543211',
            },
            items: [
              { product_name: 'Red Wine', quantity: 1, price: 890 },
            ],
            total_amount: 890,
            payment_method: 'Cash on Delivery',
            status: 'pending',
            created_at: '5 mins ago',
          },
        ],
        completedOrders: 38,
        rating: 4.6,
        performance: 92,
        
        // Detailed stats object
        stats: {
          ordersToday: 42,
          avgOrderValue: 369,
          topSellingProduct: 'Premium Whiskey',
          weeklyOrders: 156,
          weeklyCompletedOrders: 143,
        },
        
        // Shop information
        shop: {
          id: 'shop-uuid-123',
          name: 'Sample Liquor Store',
          status: 'approved',
          verified_at: '2024-01-15T10:30:00Z',
          is_accepting_orders: true,
          commission_rate: 12.5,
          minimum_order_amount: 500,
        },
        
        // Additional context
        canToggleStatus: true,
        statusMessage: 'Shop is open and accepting orders',
      },
      message: 'Dashboard data retrieved successfully',
    });
  },

  // Test different shop statuses
  getDummyPendingShopData: (): Promise<ApiResponse<ShopDashboardData>> => {
    return Promise.resolve({
      success: true,
      data: {
        isActive: false,
        shopStatus: 'pending' as const,
        todayRevenue: 0,
        totalOrders: 0,
        pendingOrders: [],
        completedOrders: 0,
        rating: 0,
        performance: 0,
        stats: {
          ordersToday: 0,
          avgOrderValue: 0,
          topSellingProduct: 'No sales yet',
        },
        shop: {
          id: 'shop-uuid-123',
          name: 'Sample Liquor Store',
          status: 'pending',
          verified_at: null,
          is_accepting_orders: false,
          commission_rate: 12.5,
          minimum_order_amount: 500,
        },
        canToggleStatus: false,
        statusMessage: 'Shop approval pending - We\'ll notify you once approved',
      },
      message: 'Dashboard data retrieved successfully',
    });
  },

  getDummyRejectedShopData: (): Promise<ApiResponse<ShopDashboardData>> => {
    return Promise.resolve({
      success: true,
      data: {
        isActive: false,
        shopStatus: 'rejected' as const,
        todayRevenue: 0,
        totalOrders: 0,
        pendingOrders: [],
        completedOrders: 0,
        rating: 0,
        performance: 0,
        stats: {
          ordersToday: 0,
          avgOrderValue: 0,
          topSellingProduct: 'No sales yet',
        },
        shop: {
          id: 'shop-uuid-123',
          name: 'Sample Liquor Store',
          status: 'rejected',
          verified_at: null,
          is_accepting_orders: false,
          commission_rate: 12.5,
          minimum_order_amount: 500,
        },
        canToggleStatus: false,
        statusMessage: 'Shop application rejected - Please contact support',
      },
      message: 'Dashboard data retrieved successfully',
    });
  },

  // Error simulation for testing
  simulateApiError: (errorType: 'network' | 'server' | 'auth' = 'server'): Promise<ApiResponse<ShopDashboardData>> => {
    const errors = {
      network: { message: 'Network connection failed. Please check your internet connection.' },
      server: { message: 'Internal server error. Please try again later.' },
      auth: { message: 'Authentication failed. Please login again.' },
    };

    return Promise.reject({
      response: {
        status: errorType === 'auth' ? 401 : errorType === 'network' ? 0 : 500,
        data: errors[errorType],
      },
    });
  },
};