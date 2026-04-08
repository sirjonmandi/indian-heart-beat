import apiClient from './apiClient';
import { ApiResponse, PaginatedResponse } from './types';

export interface DeliveryDashboardData {
  today_earnings: number;
  total_deliveries: number;
  acceptance_rate: number;
  rating: number;
  is_online: boolean;
  is_available: boolean;
  active_order: any;
  stats: {
    completed_today: number;
    distance_today: number;
    hours_online: number;
  };
}

export interface AvailableOrder {
  id: string;
  order_number: string;
  shop: {
    id: string;
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
  };
  customer: {
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
  };
  items: Array<{
    product_name: string;
    quantity: number;
  }>;
  total_amount: number;
  delivery_fee: number;
  distance_km: number;
  estimated_time: number;
  payment_method: string;
  created_at: string;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  battery_level?: number;
}

export const deliveryAPI = {
  // Dashboard
  getDashboardData: (): Promise<ApiResponse<DeliveryDashboardData>> =>
    apiClient.get('/delivery/dashboard'),

  // Availability
  toggleAvailability: (is_online: boolean): Promise<ApiResponse<{ is_online: boolean; is_available: boolean }>> =>
    apiClient.post('/delivery/toggle-availability', { is_online }),

  // Location
  updateLocation: (location: LocationUpdate): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/delivery/update-location', location),

  // Orders
  getAvailableOrders: (): Promise<ApiResponse<{ orders: AvailableOrder[] }>> =>
    apiClient.get('/delivery/orders/available'),

  fetchOrderDetails: (orderId:string): Promise<ApiResponse<{ order: AvailableOrder; message:string }>> =>
    apiClient.get(`/delivery/orders/${orderId}`),

  acceptOrder: (order_id: string): Promise<ApiResponse<{ order: any; message: string }>> =>
    apiClient.post(`/delivery/orders/${order_id}/accept`),

  rejectOrder: (order_id: string,reason:string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/delivery/orders/${order_id}/reject`,  { reason }),

  updateDeliveryStatus: (order_id: string, status: string): Promise<ApiResponse<{ order: any }>> =>
    apiClient.post(`/delivery/orders/${order_id}/status`, { status }),

  pickupOrder: (order_id: string, data:any): Promise<ApiResponse<{ order: any; earnings: any }>> =>
    apiClient.post(`/delivery/orders/${order_id}/pickup`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  startDelivery: (order_id: string): Promise<ApiResponse<{ order: any; earnings: any }>> =>
    apiClient.post(`/delivery/orders/${order_id}/startDelivery`),
  
  completeDelivery: (order_id: string, data:any): Promise<ApiResponse<{ order: any; earnings: any }>> =>
    apiClient.post(`/delivery/orders/${order_id}/deliver`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Route Optimization
  getOptimizedRoute: (): Promise<ApiResponse<{ route: any; waypoints: any[] }>> =>
    apiClient.get('/delivery/optimized-route'),

  // Earnings
  getEarnings: (params?: { period?: string; start_date?: string; end_date?: string }): Promise<ApiResponse<{ earnings: any[]; summary: any }>> =>
    apiClient.get('/delivery/earnings', { params }),

  getEarningsSummary: (params?:{period?:string}): Promise<ApiResponse<{ today: number; week: number; month: number; total: number }>> =>
    apiClient.get('/delivery/earnings/summary', { params }),

  payoutRequest: (): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/delivery/payouts/request'),

  getPayoutHistory: (): Promise<ApiResponse<PaginatedResponse<any>>> =>
    apiClient.get('/delivery/payouts/history'),
  // History
  getOrderHistory: (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<PaginatedResponse<any>>> =>
    apiClient.get('/delivery/orders/history', { params }),

  // Profile
  getProfile: (): Promise<ApiResponse<{ partner: any; documents: any; bank_details: any }>> =>
    apiClient.get('/delivery/profile'),

  updateProfile: (data: any): Promise<ApiResponse<{ partner: any }>> =>
    apiClient.put('/delivery/profile', data),

  getBankDetails: (): Promise<ApiResponse<{ partner: any; documents: any; bank_details: any }>> =>
    apiClient.get('/delivery/bank-details'),

  updateBankDetails: (data: any): Promise<ApiResponse<{ bank_details: any }>> =>
    apiClient.post('/delivery/bank-details', data),

  // Schedule
  getSchedule: (): Promise<ApiResponse<{ schedules: any[] }>> =>
    apiClient.get('/delivery/schedule'),

  getScheduleByDate: (date?:string): Promise<ApiResponse<{ schedules: any[] }>> =>
    apiClient.get(`/delivery/schedule/${date}`),


  updateSchedule: (data: any): Promise<ApiResponse<{ schedules: any[] }>> =>
    apiClient.post('/delivery/schedule', data),

  // Performance
  getPerformanceMetrics: (period?: string): Promise<ApiResponse<{ metrics: any; ranking: any }>> =>
    apiClient.get(`/delivery/performance?period=${period || 'week'}`),
  getPerformanceReport: (period?: string): Promise<ApiResponse<{ report: any }>> =>
    apiClient.get('/delivery/performance',{ params: { period } }),
  //order notification
  fetchOrderNotification:():Promise<ApiResponse<{data:any}>> => apiClient.get('/delivery/orders/notifications'),

  //update notification settings
  updateNotificationSettings:(settings:any):Promise<ApiResponse<{message:string}>> => apiClient.post('/delivery/notification-settings',settings),

  sendFeedback:(data: any):Promise<ApiResponse<{message:string}>> => 
    apiClient.post('/delivery/feedback', data),

  sendRatingsAndReview:(data: any):Promise<ApiResponse<{message:string}>> => 
    apiClient.post('/delivery/ratings-and-review', data),

};

// ================================
// SHOP OWNER API
// ================================