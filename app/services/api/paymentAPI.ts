import apiClient from './apiClient';
import { ApiResponse } from './types';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  details: any;
  is_default: boolean;
}

export const paymentAPI = {
  // Payment Methods
  getPaymentMethods: (): Promise<ApiResponse<{ methods: PaymentMethod[] }>> =>
    apiClient.get('/customer/payment-methods'),

  addPaymentMethod: (data: { type: string; details: any }): Promise<ApiResponse<{ method: PaymentMethod }>> =>
    apiClient.post('/customer/payment-methods', data),

  deletePaymentMethod: (method_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/customer/payment-methods/${method_id}`),

  setDefaultPaymentMethod: (method_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/customer/payment-methods/${method_id}/set-default`),

  // Razorpay Integration
  createRazorpayOrder: (amount: number, currency: string = 'INR'): Promise<ApiResponse<{
    razorpay_order_id: string;
    amount: number;
    currency: string;
    key: string;
  }>> =>
    apiClient.post('/payment/razorpay/create-order', { amount, currency }),

  verifyRazorpayPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id: string;
  }): Promise<ApiResponse<{ verified: boolean; order: any }>> =>
    apiClient.post('/payment/razorpay/verify', data),

  // Refunds
  initiateRefund: (order_id: string, amount?: number, reason?: string): Promise<ApiResponse<{
    refund_id: string;
    amount: number;
    status: string;
    estimated_completion: string;
  }>> =>
    apiClient.post('/payment/refund', { order_id, amount, reason }),

  getRefundStatus: (refund_id: string): Promise<ApiResponse<{ refund: any }>> =>
    apiClient.get(`/payment/refund/${refund_id}`),
};
