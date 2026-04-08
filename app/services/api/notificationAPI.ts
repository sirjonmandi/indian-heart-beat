// src/services/api/notificationAPI.ts
import apiClient from './apiClient';
import { ApiResponse } from './types';

export const notificationAPI = {
  // FCM Token Management
  updateFCMToken: (token: string, device_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/notifications/fcm-token', { token, device_id }),

  // Notification Preferences
  getNotificationPreferences: (): Promise<ApiResponse<{ preferences: any }>> =>
    apiClient.get('/notifications/preferences'),

  updateNotificationPreferences: (preferences: any): Promise<ApiResponse<{ message: string }>> =>
    apiClient.put('/notifications/preferences', preferences),

  // Send Notifications (Admin/System)
  sendNotification: (data: {
    user_ids?: string[];
    user_type?: string;
    title: string;
    body: string;
    data?: any;
    notification_type: string;
  }): Promise<ApiResponse<{ message: string; sent_count: number }>> =>
    apiClient.post('/notifications/send', data),

  // Notification Templates (Admin)
  getNotificationTemplates: (): Promise<ApiResponse<{ templates: any[] }>> =>
    apiClient.get('/notifications/templates'),

  createNotificationTemplate: (data: any): Promise<ApiResponse<{ template: any }>> =>
    apiClient.post('/notifications/templates', data),
};