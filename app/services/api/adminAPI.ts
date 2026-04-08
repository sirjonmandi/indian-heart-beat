import apiClient from './apiClient';
import { ApiResponse, PaginatedResponse } from './types';

export const adminAPI = {
  // Dashboard
  getDashboardStats: (): Promise<ApiResponse<{
    total_users: number;
    total_shops: number;
    total_partners: number;
    total_orders: number;
    revenue_today: number;
    revenue_month: number;
    active_users: number;
    pending_verifications: number;
  }>> =>
    apiClient.get('/admin/dashboard'),

  // User Management
  getUsers: (params?: { user_type?: string; status?: string; page?: number; search?: string }): Promise<ApiResponse<PaginatedResponse<any>>> =>
    apiClient.get('/admin/users', { params }),

  getUserDetails: (user_id: string): Promise<ApiResponse<{ user: any; profile: any; activity: any[] }>> =>
    apiClient.get(`/admin/users/${user_id}`),

  updateUserStatus: (user_id: string, status: string, reason?: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/admin/users/${user_id}/status`, { status, reason }),

  // Shop Management
  getShops: (params?: { status?: string; page?: number; search?: string }): Promise<ApiResponse<PaginatedResponse<any>>> =>
    apiClient.get('/admin/shops', { params }),

  getShopDetails: (shop_id: string): Promise<ApiResponse<{ shop: any; owner: any; documents: any[]; performance: any }>> =>
    apiClient.get(`/admin/shops/${shop_id}`),

  approveShop: (shop_id: string, notes?: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/admin/shops/${shop_id}/approve`, { notes }),

  rejectShop: (shop_id: string, reason: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/admin/shops/${shop_id}/reject`, { reason }),

  suspendShop: (shop_id: string, reason: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/admin/shops/${shop_id}/suspend`, { reason }),

  // Delivery Partner Management
  getDeliveryPartners: (params?: { status?: string; page?: number; search?: string }): Promise<ApiResponse<PaginatedResponse<any>>> =>
    apiClient.get('/admin/delivery-partners', { params }),

  getPartnerDetails: (partner_id: string): Promise<ApiResponse<{ partner: any; user: any; documents: any[]; performance: any }>> =>
    apiClient.get(`/admin/delivery-partners/${partner_id}`),

  approvePartner: (partner_id: string, notes?: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/admin/delivery-partners/${partner_id}/approve`, { notes }),

  rejectPartner: (partner_id: string, reason: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/admin/delivery-partners/${partner_id}/reject`, { reason }),

  // Order Management
  getAllOrders: (params?: { status?: string; page?: number; search?: string; start_date?: string; end_date?: string }): Promise<ApiResponse<PaginatedResponse<any>>> =>
    apiClient.get('/admin/orders', { params }),

  getOrderDetails: (order_id: string): Promise<ApiResponse<{ order: any; timeline: any[]; payments: any[] }>> =>
    apiClient.get(`/admin/orders/${order_id}`),

  // Analytics
  getAnalytics: (params: { type: string; period: string; start_date?: string; end_date?: string }): Promise<ApiResponse<{ data: any; charts: any[] }>> =>
    apiClient.get('/admin/analytics', { params }),

  exportAnalytics: (params: { type: string; period: string; format: string }): Promise<Blob> =>
    apiClient.get('/admin/analytics/export', { params, responseType: 'blob' }),

  // System Settings
  getSettings: (): Promise<ApiResponse<{ settings: any }>> =>
    apiClient.get('/admin/settings'),

  updateSettings: (settings: any): Promise<ApiResponse<{ message: string }>> =>
    apiClient.put('/admin/settings', settings),

  // Content Management
  getBanners: (): Promise<ApiResponse<{ banners: any[] }>> =>
    apiClient.get('/admin/banners'),

  createBanner: (data: FormData): Promise<ApiResponse<{ banner: any }>> =>
    apiClient.uploadFile('/admin/banners', data),

  updateBanner: (banner_id: string, data: any): Promise<ApiResponse<{ banner: any }>> =>
    apiClient.put(`/admin/banners/${banner_id}`, data),

  deleteBanner: (banner_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/admin/banners/${banner_id}`),

  // Coupon Management
  getCoupons: (): Promise<ApiResponse<{ coupons: any[] }>> =>
    apiClient.get('/admin/coupons'),

  createCoupon: (data: any): Promise<ApiResponse<{ coupon: any }>> =>
    apiClient.post('/admin/coupons', data),

  updateCoupon: (coupon_id: string, data: any): Promise<ApiResponse<{ coupon: any }>> =>
    apiClient.put(`/admin/coupons/${coupon_id}`, data),

  deleteCoupon: (coupon_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/admin/coupons/${coupon_id}`),
};