export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  phone: string;
  user_type: 'customer' | 'shop_owner' | 'delivery_partner' | 'admin';
  first_name: string;
  last_name: string;
  avatar?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_in: number;
}
