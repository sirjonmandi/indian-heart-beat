export const Constants = {
  // API Configuration
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:8000/api' 
    : 'https://beergo.in/beergo-backup/public/api/v1',
  
  // App Configuration
  APP_NAME: 'Maharaj Enterprise',
  APP_VERSION: '1.3.5',
  
  // Delivery Configuration
  MIN_ORDER_AMOUNT: 299,
  FREE_DELIVERY_ABOVE: 999,
  DELIVERY_CHARGE: 49,
  DELIVERY_TIME_MINUTES: 10,
  
  // Age Verification
  MINIMUM_AGE: 21,
  
  // OTP Configuration
  OTP_LENGTH: 6,
  OTP_RESEND_TIME: 30, // seconds
  
  // Location Configuration
  DEFAULT_LOCATION: {
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Payment Configuration
  RAZORPAY_KEY:'rzp_test_RIHF7soCxek04g',

  // GOOGLE_KEY:'164872747758-0qidljj3a6qlshh0p4u8i90tmq0m3oap.apps.googleusercontent.com',
  GOOGLE_KEY:'434916858654-uooiljq2rc0u66f4vul9mqkclp9j9dbj.apps.googleusercontent.com',
  

  // Storage Keys
  STORAGE_KEYS: {
    USER_TOKEN: '@beergo:user_token',
    USER_DATA: '@beergo:user_data',
    USER_TYPE: '@beergo:user_type', // NEW
    CART_DATA: '@beergo:cart_data',
    ADDRESSES: '@beergo:addresses',
    PREFERENCES: '@beergo:preferences',
    SHOP_DATA: '@beergo:shop_data', // NEW
    DELIVERY_DATA: '@beergo:delivery_data', // NEW
  },
  
  // User Types
  USER_TYPES: {
    CUSTOMER: 'customer',
    SHOP_OWNER: 'shop_owner',
    DELIVERY_PARTNER: 'delivery_partner',
    ADMIN: 'admin',
  },
  
  // User Type Themes
  USER_TYPE_THEMES: {
    customer: {
      primary: '#FFD700',
      secondary: '#FFF8DC',
      accent: '#DAA520',
    },
    shop_owner: {
      primary: '#4CAF50',
      secondary: '#E8F5E8',
      accent: '#2E7D32',
    },
    delivery_partner: {
      primary: '#2196F3',
      secondary: '#E3F2FD',
      accent: '#1565C0',
    },
    admin: {
      primary: '#9C27B0',
      secondary: '#F3E5F5',
      accent: '#7B1FA2',
    },
  },
  
  // Screen Names - UPDATED WITH MULTI-USER TYPE SUPPORT
  SCREENS: {
    // ===============================================
    // AUTH SCREENS
    // ===============================================
    SPLASH: 'Splash',
    ONBOARDING: 'Onboarding', 
    USER_TYPE_SELECTION: 'UserTypeSelection', // NEW
    LOGIN: 'Login',
    REGISTER: 'Register',
    OTP_VERIFICATION: 'OTPVerification',
    AGE_VERIFICATION: 'AgeVerification',
    RESET_PASSWORD_OTP: 'ResetPasswordOTP',
    RESET_PASSWORD: 'ResetPassword',
    LOCATION_PERMISSION: 'LocationPermission',
    PINCODE_CHECK: 'PincodeCheck',
    SHOP_REGISTER : 'ShopRegister',
    DELIVERY_PARTNER_REGISTER: 'DeliveryPartnerRegister',
    
    // ===============================================
    // CUSTOMER SCREENS (Your existing screens)
    // ===============================================
    // Main Navigation
    HOME: 'Home',
    HOME_TAB: 'HomeTab',
    CART: 'Cart',
    CART_TAB: 'CartTab',
    ORDERS_TAB: 'OrdersTab',
    
    // Product & Store Screens
    STORE_DETAIL: 'StoreDetail',
    SEARCH: 'Search',
    CATEGORY: 'Category',
    PRODUCT_LIST: 'ProductList',
    PRODUCT_DETAIL: 'ProductDetail',
    
    // Shopping Flow
    CHECKOUT: 'Checkout',
    PAYMENT: 'Payment',
    ORDER_SUCCESS: 'OrderSuccess',
    
    // Order Management
    ORDER_TRACKING: 'OrderTracking',
    ORDER_HISTORY: 'OrderHistory',
    ORDER_DETAILS: 'OrderDetails',
    
    // Profile & Settings
    PROFILE: 'Profile',
    PROFILE_EDIT: 'ProfileEdit',
    ADDRESSES: 'Addresses',
    ADD_ADDRESS: 'AddAddress',
    EDIT_ADDRESS: 'EditAddress',
    WALLET: 'Wallet',
    REFERRAL: 'Referral',
    WISHLIST: 'Wishlist',
    COUPONS: 'Coupons',
    HELP_SUPPORT: 'HelpSupport',
    SETTINGS: 'Settings',
    NOTIFICATIONS: 'Notifications',
    SUPPORT: 'Support',
    ABOUT_US: 'AboutUs',
    FEEDBACK: 'Feedback',
    RATINGSREVIEWS: 'RatingsReviews',

    // ===============================================
    // SHOP OWNER SCREENS (NEW)
    // ===============================================
    // Main Navigation
    STORE_DASHBOARD_TAB: 'StoreDashboardTab',
    STORE_ORDERS_TAB: 'StoreOrdersTab',
    STORE_INVENTORY_TAB: 'StoreInventoryTab',
    STORE_EARNINGS_TAB: 'StoreEarningsTab',
    STORE_PROFILE_TAB: 'StoreProfileTab',
    
    
    // Dashboard & Analytics
    STORE_DASHBOARD: 'StoreDashboard',
    STORE_ANALYTICS: 'StoreAnalytics',
    STORE_PERFORMANCE: 'StorePerformance',
    STORE_REPORTS: 'StoreReports',
    
    // Order Management
    STORE_ORDER_MANAGEMENT: 'StoreOrderManagement',
    SHOP_ORDER_DETAILS: 'ShopOrderDetails',
    STORE_ORDER_HISTORY: 'StoreOrderHistory',
    
    // Inventory Management
    STORE_INVENTORY: 'StoreInventory',
    ADD_PRODUCT: 'AddProduct',
    EDIT_PRODUCT: 'EditProduct',
    PRODUCT_BULK_EDIT: 'ProductBulkEdit',
    STOCK_MANAGEMENT: 'StockManagement',
    
    // Earnings & Finance
    STORE_EARNINGS: 'StoreEarnings',
    STORE_SETTLEMENTS: 'StoreSettlements',
    STORE_PAYOUTS: 'StorePayouts',
    
    // Shop Profile & Settings
    STORE_PROFILE: 'StoreProfile',
    SHOP_SETTINGS: 'ShopSettingsScereen',
    SHOP_REPORTS: 'ShopReportsScreen',
    STORE_BUSINESS_HOURS: 'StoreBusinessHours',
    STORE_BANK_DETAILS: 'StoreBankDetails',
    STORE_DOCUMENTS: 'StoreDocuments',
    STORE_VERIFICATION: 'StoreVerification',
    
    // ===============================================
    // DELIVERY PARTNER SCREENS (NEW)
    // ===============================================
    // Main Navigation
    DELIVERY_DASHBOARD_TAB: 'DeliveryDashboardTab',
    DELIVERY_ORDERS_TAB: 'DeliveryOrdersTab',
    DELIVERY_EARNINGS_TAB: 'DeliveryEarningsTab',
    DELIVERY_PROFILE_TAB: 'DeliveryProfileTab',
    
    // Dashboard & Status
    DELIVERY_DASHBOARD: 'DeliveryDashboard',
    DELIVERY_STATUS: 'DeliveryStatus',
    DELIVERY_PERFORMANCE: 'DeliveryPerformance',
    
    // Order Management
    DELIVERY_ORDERS: 'DeliveryOrders',
    DELIVERY_ORDER_DETAILS: 'DeliveryOrderDetailsScreen',
    DELIVERY_ORDER_HISTORY: 'DeliveryOrderHistory',
    DELIVERY_TRACKING: 'DeliveryTracking',
    DELIVERY_NAVIGATION: 'DeliveryNavigation',
    
    // Earnings & Finance
    DELIVERY_EARNINGS: 'DeliveryEarnings',
    DELIVERY_PAYOUTS: 'DeliveryPayouts',
    DELIVERY_INCENTIVES: 'DeliveryIncentives',
    DELIVERY_CASH_COLLECTION: 'DeliveryCashCollection',
    
    // Partner Profile & Settings
    DELIVERY_PROFILE: 'DeliveryProfile',
    DELIVERY_PROFILE_EDIT: 'DeliveryProfileEdit',
    DELIVERY_SETTINGS: 'DeliverySettingsScreen',
    DELIVERY_VEHICLE: 'DeliveryVehicle',
    DELIVERY_DOCUMENTS: 'DeliveryDocuments',
    DELIVERY_BANK_DETAILS: 'DeliveryBankDetails',
    DELIVERY_SCHEDULE: 'DeliverySchedule',
    DELIVERY_ZONES: 'DeliveryZones',
    PERFORMANCE_REPORT: 'PerformanceReport',
    WORKSHCEDULE: 'WorkSchedule',
    
    // ===============================================
    // ADMIN SCREENS (Future Use)
    // ===============================================
    ADMIN_DASHBOARD: 'AdminDashboard',
    ADMIN_USER_MANAGEMENT: 'AdminUserManagement',
    ADMIN_SHOP_MANAGEMENT: 'AdminShopManagement',
    ADMIN_DELIVERY_MANAGEMENT: 'AdminDeliveryManagement',
    ADMIN_ORDER_MANAGEMENT: 'AdminOrderManagement',
    ADMIN_ANALYTICS: 'AdminAnalytics',
    ADMIN_SETTINGS: 'AdminSettings',
    
    // ===============================================
    // SHARED SCREENS (Available to all user types)
    // ===============================================
    SHARED_NOTIFICATIONS: 'SharedNotifications',
    SHARED_HELP_SUPPORT: 'SharedHelpSupport',
    SHARED_CONTACT_US: 'SharedContactUs',
    SHARED_TERMS: 'SharedTerms',
    SHARED_PRIVACY: 'SharedPrivacy',
    SHARED_ABOUT: 'SharedAbout',
  },
  
  // Product Categories
  CATEGORIES: [
    { id: 1, name: 'Beer', icon: '🍺', color: '#FFA500' },
    { id: 2, name: 'Wine', icon: '🍷', color: '#8B0000' },
    { id: 3, name: 'Whiskey', icon: '🥃', color: '#D2691E' },
    { id: 4, name: 'Vodka', icon: '🍸', color: '#4169E1' },
    { id: 5, name: 'Rum', icon: '🍹', color: '#8B4513' },
    { id: 6, name: 'Gin', icon: '🍀', color: '#228B22' },
    { id: 7, name: 'Mixers', icon: '🥤', color: '#FF6347' },
  ],
  
  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY_FOR_PICKUP: 'ready_for_pickup',
    ASSIGNED_TO_PARTNER: 'assigned_to_partner', // NEW
    PICKED_UP: 'picked_up',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned', // NEW
    REFUNDED: 'refunded', // NEW
  },
  
  // Payment Methods
  PAYMENT_METHODS: {
    CARD: 'card',
    UPI: 'upi',
    NETBANKING: 'netbanking',
    WALLET: 'wallet',
    COD: 'cash_on_delivery',
  },
  
  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
  },
  
  // Shop Status
  SHOP_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    SUSPENDED: 'suspended',
    REJECTED: 'rejected',
    TEMPORARILY_CLOSED: 'temporarily_closed',
  },
  
  // Delivery Partner Status
  DELIVERY_STATUS: {
    AVAILABLE: 'available',
    BUSY: 'busy',
    OFFLINE: 'offline',
    ON_BREAK: 'on_break',
  },
  
  // Delivery Tracking Status
  DELIVERY_TRACKING_STATUS: {
    ASSIGNED: 'assigned',
    HEADING_TO_SHOP: 'heading_to_shop',
    AT_SHOP: 'at_shop',
    PICKED_UP: 'picked_up',
    HEADING_TO_CUSTOMER: 'heading_to_customer',
    AT_CUSTOMER: 'at_customer',
    DELIVERED: 'delivered',
  },
  
  // Document Types for Age Verification
  DOCUMENT_TYPES: [
    { id: 'aadhaar', name: 'Aadhaar Card', icon: '📄' },
    { id: 'driving_license', name: 'Driving License', icon: '🪪' },
    { id: 'passport', name: 'Passport', icon: '📘' },
    { id: 'voter_id', name: 'Voter ID', icon: '🗳️' },
  ],
  
  // Vehicle Types for Delivery Partners
  VEHICLE_TYPES: [
    { id: 'bicycle', name: 'Bicycle', icon: '🚲', capacity: '5kg' },
    { id: 'motorcycle', name: 'Motorcycle', icon: '🏍️', capacity: '15kg' },
    { id: 'scooter', name: 'Scooter', icon: '🛵', capacity: '10kg' },
    { id: 'car', name: 'Car', icon: '🚗', capacity: '25kg' },
  ],
  
  // Notification Types
  NOTIFICATION_TYPES: {
    ORDER_UPDATE: 'order_update',
    PAYMENT_UPDATE: 'payment_update',
    PROMOTION: 'promotion',
    SYSTEM: 'system',
    SUPPORT: 'support',
    REMINDER: 'reminder',
  },
  
  // Badge Types
  BADGE_TYPES: {
    PERFORMANCE: 'performance',
    ACHIEVEMENT: 'achievement',
    MILESTONE: 'milestone',
    SPECIAL: 'special',
    SEASONAL: 'seasonal',
  },
  
  // Coupon Types
  COUPON_TYPES: {
    PERCENTAGE: 'percentage',
    FIXED_AMOUNT: 'fixed_amount',
    FREE_DELIVERY: 'free_delivery',
    CASHBACK: 'cashback',
    FIRST_ORDER: 'first_order',
    LOYALTY: 'loyalty',
  },
  
  // API Endpoints by User Type
  API_ENDPOINTS: {
    // Auth Endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      VERIFY_OTP: '/auth/verify-otp',
      REFRESH_TOKEN: '/auth/refresh',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    
    // Customer Endpoints
    CUSTOMER: {
      PROFILE: '/customer/profile',
      ADDRESSES: '/customer/addresses',
      ORDERS: '/customer/orders',
      CART: '/customer/cart',
      WISHLIST: '/customer/wishlist',
      WALLET: '/customer/wallet',
      COUPONS: '/customer/coupons',
      REVIEWS: '/customer/reviews',
    },
    
    // Shop Owner Endpoints
    SHOP: {
      DASHBOARD: '/shop/dashboard',
      PROFILE: '/shop/profile',
      ORDERS: '/shop/orders',
      INVENTORY: '/shop/inventory',
      EARNINGS: '/shop/earnings',
      ANALYTICS: '/shop/analytics',
      SETTINGS: '/shop/settings',
    },
    
    // Delivery Partner Endpoints
    DELIVERY: {
      DASHBOARD: '/delivery/dashboard',
      PROFILE: '/delivery/profile',
      ORDERS: '/delivery/orders',
      EARNINGS: '/delivery/earnings',
      TRACKING: '/delivery/tracking',
      SCHEDULE: '/delivery/schedule',
    },
    
    // Shared Endpoints
    SHARED: {
      PRODUCTS: '/products',
      CATEGORIES: '/categories',
      SHOPS: '/shops',
      LOCATION: '/location',
      NOTIFICATIONS: '/notifications',
      SUPPORT: '/support',
    },
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    AGE_VERIFICATION_REQUIRED: 'Age verification is required to continue.',
    LOCATION_PERMISSION_REQUIRED: 'Location permission is required for delivery.',
    MINIMUM_ORDER_NOT_MET: `Minimum order amount is ₹${299}`,
    OUT_OF_STOCK: 'This item is currently out of stock.',
    SERVICE_UNAVAILABLE: 'Service is not available in your area.',
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    ORDER_PLACED: 'Order placed successfully!',
    PAYMENT_SUCCESS: 'Payment completed successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    ADDRESS_ADDED: 'Address added successfully!',
    PRODUCT_ADDED: 'Product added to inventory successfully!',
    ORDER_ACCEPTED: 'Order accepted successfully!',
    DELIVERY_COMPLETED: 'Delivery completed successfully!',
  },
  
  // Deep Link Prefixes
  DEEP_LINKS: {
    PREFIX: 'beergo://',
    CUSTOMER: 'beergo://customer/',
    SHOP: 'beergo://shop/',
    DELIVERY: 'beergo://delivery/',
    AUTH: 'beergo://auth/',
  },
  
  // Feature Flags
  FEATURES: {
    BIOMETRIC_AUTH: true,
    DARK_MODE: true,
    OFFLINE_MODE: false,
    VOICE_SEARCH: false,
    AR_PRODUCT_VIEW: false,
    LIVE_CHAT: true,
    SOCIAL_LOGIN: true,
    REFERRAL_SYSTEM: true,
    LOYALTY_PROGRAM: true,
    MULTI_LANGUAGE: false,
  },
  
  // Performance Configuration
  PERFORMANCE: {
    IMAGE_CACHE_SIZE: 100, // MB
    API_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    PAGINATION_SIZE: 20,
    INFINITE_SCROLL_THRESHOLD: 0.7,
  },
  
  // Map Configuration
  MAP_CONFIG: {
    DEFAULT_ZOOM: 15,
    MIN_ZOOM: 10,
    MAX_ZOOM: 20,
    MARKER_ANIMATION_DURATION: 300,
    TRACKING_INTERVAL: 5000, // 5 seconds
    GEOFENCE_RADIUS: 100, // meters
  },
};