import apiClient from './apiClient';
import { ApiResponse, AuthResponse, User } from './types';

export interface LoginRequest {
  email: string;
  password: string;
  user_type: string;
  device_id?: string;
  fcm_token?: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  user_type: string;
  referral_code?: string;
  device_id?: string;
  fcm_token?: string;
}

export interface ShopRegisterRequest {
  // Owner information
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  owner_date_of_birth: string;
  owner_gender: 'male' | 'female' | 'other';
  password: string;
  password_confirmation: string;
  
  // Shop information
  shop_name: string;
  shop_description: string;
  shop_phone: string;
  shop_email?: string;
  whatsapp_number?: string;
  license_number: string;
  gst_number?: string;
  pan_number?: string;
  fssai_license?: string;
  
  // Address information
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  pincode: string;
  city_id: number;
  latitude?: number;
  longitude?: number;
  
  // Business information
  business_type: string;
  establishment_year: string;
  opening_time: string;
  closing_time: string;
  is_24_hours: boolean;
  working_days: number[];
  minimum_order_amount: number;
  delivery_radius_km: number;
  
  // Optional fields
  device_id?: string;
  fcm_token?: string;
  language?: string;
}

export interface ShopLoginRequest {
  identifier: string; // phone or email
  password: string;
  device_id?: string;
  fcm_token?: string;
}

export interface OTPVerificationRequest {
  phone: string;
  otp: string;
  user_type: string;
}

export interface AgeVerificationRequest {
  document_type: string;
  document_number: string;
  document_images: string[];
  face_photo: string;
}

export interface Shop {
  id: string;
  uuid: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  city_id: number;
  latitude: number;
  longitude: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_active: boolean;
  rating: number;
  total_orders: number;
  performance_score: number;
  commission_rate: number;
  minimum_order_amount: number;
  delivery_radius_km: number;
  shop_code: string;
  verified_at: string | null;
  license_number: string;
  gst_number?: string;
  pan_number?: string;
  fssai_license?: string;
  business_type: string;
  establishment_year: string;
  opening_time: string;
  closing_time: string;
  is_24_hours: boolean;
  working_days: number[];
  license_images: string[];
  shop_images: string[];
  created_at: string;
  updated_at: string;
}

export interface ShopAuthResponse extends AuthResponse {
  shop: Shop;
}

export interface ShopRegisterResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    shop_id: string;
    shop_code: string;
    phone: string;
    email: string;
    shop_name: string;
    status: string;
    requires_otp_verification: boolean;
    estimated_review_time: string;
  };
}

export interface CityResponse {
  id: number;
  name: string;
  state: string;
  country: string;
  is_active: boolean;
}

export const authAPI = {
  // Customer Authentication
  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post('/auth/customer/login', data),

  loginWithGoogle: (data: {token:string}): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post('/auth/customer/login-with-google', data),

  register: (data: RegisterRequest): Promise<ApiResponse<{ message: string; user: User; phone: string }>> =>
    apiClient.post('/auth/customer/register', data),

  verifyOTP: (data: OTPVerificationRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post('/auth/customer/verify-otp', data),

  resendOTP: (data:{phone?: string,email?: string}): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/resend-otp', data),

  forgotPassword: (data : {email?: string, phone?: string}): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/customer/forgot-password', data),

  verifyForgotOTP: (data: {email?: string; phone?: string; otp: string; }): Promise<ApiResponse<{ token: string }>> =>
    apiClient.post('/auth/customer/verify-forgot-password-otp', data),

  resetPassword: (data: { phone?: string; email?: string; key: string; password: string; password_confirmation: string }): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/customer/reset-password', data),

  verifyToken: (token: string): Promise<ApiResponse<{ is_valid: boolean; user: User }>> =>
    apiClient.post('/verify-token', { token }),

  refreshToken: (refresh_token: string): Promise<ApiResponse<{ token: string; refresh_token: string }>> =>
    apiClient.post('/auth/refresh', { refresh_token }),

  logout: (): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/logout'),

  storeDeviceToken: (device_token:string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/store-device-token', { device_token }),
  // Shop Owner Authentication
  shopLogin: (data: ShopLoginRequest): Promise<ApiResponse<ShopAuthResponse>> =>
    apiClient.post('/auth/shop/login', data),

  shopRegister: (data: ShopRegisterRequest): Promise<ApiResponse<ShopRegisterResponse>> => {
    // Prepare FormData for multipart request
    const formData = shopHelpers.prepareFormData(data);
    
    console.log('Shop registration data being sent:', data);
    
    return apiClient.post('/auth/shop/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  shopVerifyOTP: (data: OTPVerificationRequest): Promise<ApiResponse<ShopAuthResponse>> =>
    apiClient.post('/auth/shop/verify-otp', data),

  shopResendOTP: (phone: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/shop/resend-otp', { phone }),

  shopForgotPassword: (identifier: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/shop/forgot-password', { identifier }),

  shopResetPassword: (data: { phone: string; otp: string; password: string; password_confirmation: string }): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/shop/reset-password', data),

  shopLogout: (): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/shop/logout'),

  // Shop Management
  getShopProfile: (): Promise<ApiResponse<{ user: User; shop: Shop }>> =>
    apiClient.get('/auth/shop/profile'),

  updateShopProfile: (data: Partial<ShopRegisterRequest>): Promise<ApiResponse<{ user: User; shop: Shop }>> =>
    apiClient.put('/auth/shop/profile', data),

  getShopRegistrationStatus: (shopId: string): Promise<ApiResponse<{ 
    status: string; 
    verification_notes?: string; 
    verified_at?: string;
    rejection_reason?: string;
  }>> =>
    apiClient.get(`/auth/shop/registration-status/${shopId}`),

  // File Uploads for Shops
  uploadShopImages: (images: File[] | any[]): Promise<ApiResponse<{ urls: string[] }>> => {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`shop_images[${index}]`, image);
    });
    return apiClient.post('/auth/shop/upload-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  uploadLicenseDocuments: (documents: File[] | any[]): Promise<ApiResponse<{ urls: string[] }>> => {
    const formData = new FormData();
    documents.forEach((doc, index) => {
      formData.append(`license_images[${index}]`, doc);
    });
    return apiClient.post('/auth/shop/upload-license', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Age Verification (Customer)
  submitAgeVerification: (data: AgeVerificationRequest): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/age-verification', data),

  getVerificationStatus: (): Promise<ApiResponse<{ status: string; verified_at: string | null }>> =>
    apiClient.get('/auth/verification-status'),

  // User Type Management
  updateUserType: (user_type: string): Promise<ApiResponse<{ user: User }>> =>
    apiClient.post('/auth/update-user-type', { user_type }),

  // Common APIs
  getCities: (): Promise<ApiResponse<CityResponse[]>> =>
    apiClient.get('/cities'),

  searchCities: (query: string): Promise<ApiResponse<CityResponse[]>> =>
    apiClient.get(`/cities/search?q=${encodeURIComponent(query)}`),

  // Combined Login (detects user type automatically)
  universalLogin: (email: string, password: string, device_id?: string, fcm_token?: string): Promise<ApiResponse<AuthResponse | ShopAuthResponse>> =>
    apiClient.post('/auth/login', { email, password, device_id, fcm_token }),

  // Get user by phone (for user type detection)
  getUserByPhone: (phone: string): Promise<ApiResponse<{ user_type: string; exists: boolean }>> =>
    apiClient.post('/auth/check-user', { phone }),

  // Password validation
  validatePassword: (password: string): Promise<ApiResponse<{ is_valid: boolean; errors: string[] }>> =>
    apiClient.post('/auth/validate-password', { password }),

  // Check if email/phone exists
  checkAvailability: (data: { email?: string; phone?: string }): Promise<ApiResponse<{ 
    email_available: boolean; 
    phone_available: boolean; 
    existing_user_type?: string;
  }>> =>
    apiClient.post('/auth/check-availability', data),

  deliveryRegister: (data: any): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/auth/delivery/register', data , { headers: { 'Content-Type': 'multipart/form-data' } })

};

// Helper functions for shop registration
export const shopHelpers = {
  /**
   * Convert form data to shop registration format
   */
  formatShopRegistrationData: (formData: any): ShopRegisterRequest => {
    // Ensure password confirmation is included
    const apiData: ShopRegisterRequest = {
      // Owner info
      owner_first_name: formData.ownerFirstName?.trim() || '',
      owner_last_name: formData.ownerLastName?.trim() || '',
      owner_email: formData.ownerEmail?.trim().toLowerCase() || '',
      owner_phone: formData.ownerPhone?.replace(/\D/g, '').substring(0, 10) || '',
      owner_date_of_birth: formData.ownerDateOfBirth || '',
      owner_gender: formData.ownerGender || 'male',
      password: formData.password || '',
      password_confirmation: formData.confirmPassword || formData.password || '',
      
      // Shop info
      shop_name: formData.shopName?.trim() || '',
      shop_description: formData.shopDescription?.trim() || '',
      shop_phone: formData.shopPhone?.replace(/\D/g, '').substring(0, 10) || '',
      shop_email: formData.shopEmail?.trim().toLowerCase() || undefined,
      whatsapp_number: formData.whatsappNumber?.replace(/\D/g, '').substring(0, 10) || undefined,
      license_number: formData.licenseNumber?.trim().toUpperCase() || '',
      gst_number: formData.gstNumber?.trim().toUpperCase() || undefined,
      pan_number: formData.panNumber?.trim().toUpperCase() || undefined,
      fssai_license: formData.fssaiLicense?.trim() || undefined,
      
      // Address info
      address_line_1: formData.addressLine1?.trim() || '',
      address_line_2: formData.addressLine2?.trim() || undefined,
      landmark: formData.landmark?.trim() || undefined,
      pincode: formData.pincode?.replace(/\D/g, '').substring(0, 6) || '',
      city_id: parseInt(formData.cityId) || 1,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      
      // Business info
      business_type: formData.businessType || 'retail',
      establishment_year: String(formData.establishmentYear || new Date().getFullYear()),
      opening_time: formData.openingTime || '09:00',
      closing_time: formData.closingTime || '22:00',
      is_24_hours: Boolean(formData.is24Hours),
      working_days: Array.isArray(formData.workingDays) ? formData.workingDays : [1,2,3,4,5,6,7],
      minimum_order_amount: parseFloat(formData.minimumOrderAmount) || 0,
      delivery_radius_km: Math.min(parseFloat(formData.deliveryRadius) || 5, 25), // Ensure max 25km
    };

    // Clean up undefined values to avoid sending them
    Object.keys(apiData).forEach(key => {
      if (apiData[key as keyof ShopRegisterRequest] === undefined) {
        delete apiData[key as keyof ShopRegisterRequest];
      }
    });

    return apiData;
  },

  /**
   * Validate shop registration data before sending
   */
  validateShopData: (data: ShopRegisterRequest): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    // Owner validation
    if (!data.owner_first_name?.trim()) errors.owner_first_name = 'First name is required';
    if (!data.owner_last_name?.trim()) errors.owner_last_name = 'Last name is required';
    if (!data.owner_email?.trim()) errors.owner_email = 'Email is required';
    if (!data.owner_phone?.trim()) errors.owner_phone = 'Phone is required';
    if (!data.password) errors.password = 'Password is required';
    if (data.password !== data.password_confirmation) errors.password_confirmation = 'Passwords do not match';
    if (!data.owner_date_of_birth) errors.owner_date_of_birth = 'Date of birth is required';
    if (!data.owner_gender) errors.owner_gender = 'Gender is required';

    // Phone validation
    if (data.owner_phone && !/^[6-9]\d{9}$/.test(data.owner_phone)) {
      errors.owner_phone = 'Invalid phone number format';
    }
    if (data.shop_phone && !/^[6-9]\d{9}$/.test(data.shop_phone)) {
      errors.shop_phone = 'Invalid shop phone number format';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.owner_email && !emailRegex.test(data.owner_email)) {
      errors.owner_email = 'Invalid email format';
    }

    // Shop validation
    if (!data.shop_name?.trim()) errors.shop_name = 'Shop name is required';
    if (!data.shop_description?.trim()) errors.shop_description = 'Shop description is required';
    if (!data.license_number?.trim()) errors.license_number = 'License number is required';

    // GST validation (if provided)
    if (data.gst_number) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(data.gst_number) || data.gst_number.length !== 15) {
        errors.gst_number = 'Invalid GST number format (15 characters required)';
      }
    }

    // PAN validation (if provided)
    if (data.pan_number) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(data.pan_number) || data.pan_number.length !== 10) {
        errors.pan_number = 'Invalid PAN number format (10 characters required)';
      }
    }

    // Address validation
    if (!data.address_line_1?.trim()) errors.address_line_1 = 'Address is required';
    if (!data.pincode?.trim()) errors.pincode = 'Pincode is required';
    if (data.pincode && !/^[1-9][0-9]{5}$/.test(data.pincode)) {
      errors.pincode = 'Invalid pincode format';
    }

    // Business validation
    if (!data.establishment_year) errors.establishment_year = 'Establishment year is required';
    
    const currentYear = new Date().getFullYear();
    const estYear = parseInt(String(data.establishment_year));
    if (estYear < 1900 || estYear > currentYear) {
      errors.establishment_year = `Establishment year must be between 1900 and ${currentYear}`;
    }

    // Validate delivery radius
    if (data.delivery_radius_km && data.delivery_radius_km > 25) {
      errors.delivery_radius_km = 'Delivery radius cannot exceed 25km';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Format working days for display
   */
  formatWorkingDays: (workingDays: number[]): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const sortedDays = [...workingDays].sort();
    
    if (sortedDays.length === 7) return 'All Days';
    if (sortedDays.length === 0) return 'Closed';
    
    return sortedDays.map(day => dayNames[day === 7 ? 0 : day]).join(', ');
  },

  /**
   * Calculate shop rating display
   */
  formatShopRating: (rating: number): string => {
    return rating > 0 ? `${rating.toFixed(1)} ⭐` : 'No rating yet';
  },

  /**
   * Format shop status for display
   */
  formatShopStatus: (status: string): { text: string; color: string } => {
    const statusMap = {
      pending: { text: 'Under Review', color: '#FFA500' },
      approved: { text: 'Approved', color: '#28A745' },
      rejected: { text: 'Rejected', color: '#DC3545' },
      suspended: { text: 'Suspended', color: '#6C757D' },
    };
    return statusMap[status as keyof typeof statusMap] || { text: status, color: '#6C757D' };
  },

  /**
   * Prepare FormData for multipart request
   */
  prepareFormData: (data: ShopRegisterRequest): FormData => {
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle arrays (working_days)
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, String(item));
          });
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }
};

export default authAPI;