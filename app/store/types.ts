export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  ageVerified: boolean;
  addresses: Address[];
  preferences: UserPreferences;
}

export interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  title: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  currency: string;
}

export interface CartItem {
  shopId: string;
  productId: string;
  variantId?: string;
  cartItemKey?: string;
  quantity: number;
  price:number;
  selectedVariant?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: Address;
  paymentMethod: string;
  createdAt: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  shop: Shop;
  deliveryPartner?: DeliveryPartner;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  minimumOrder: number;
  deliveryFee: number;
  isOpen: boolean;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicleNumber: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  alcoholPercentage: number;
  volume: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tags: string[];
  preparationTime: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount: number;
}

export interface ProductFilters {
  category: string | null;
  priceRange: [number, number];
  rating: number;
  sortBy: 'price' | 'rating' | 'name' | 'popularity';
  inStockOnly: boolean;
}

// Redux State Interfaces
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  itemsCount:number;
  totalItems: number;
  totalAmount: number;
  appliedCoupon: string | null;
  discountAmount: number;
  subTotal: number;
  packagingFee: number;
  deliveryFee: number;
  handlingFee: number;
  orderType: string;
  scheduled: {
    id: string;
    displayText: string;
    startTime: string;
    endTime: string;
    startHour: number;
    startMinute: number;
    scheduledAt: string;
  } | null;
  error:string | null;
  products:any;
  cartConditions:any;
  couponCode:string | undefined;
}

export interface ProductState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  theme: 'light' | 'dark';
  language: string;
  networkStatus: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

// Root State Interface
export interface RootState {
  auth: AuthState;
  cart: CartState;
  products: ProductState;
  orders: OrderState;
  app: AppState;
}

// Action Types
export type AuthActionTypes = 
  | 'AUTH_LOGIN_REQUEST'
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_REGISTER_REQUEST'
  | 'AUTH_REGISTER_SUCCESS'
  | 'AUTH_REGISTER_FAILURE'
  | 'AUTH_VERIFY_OTP_REQUEST'
  | 'AUTH_VERIFY_OTP_SUCCESS'
  | 'AUTH_VERIFY_OTP_FAILURE'
  | 'AUTH_UPDATE_PROFILE'
  | 'AUTH_SUCCESS';

export type CartActionTypes =
  | 'CART_ADD_ITEM'
  | 'CART_REMOVE_ITEM'
  | 'CART_UPDATE_QUANTITY'
  | 'CART_CLEAR'
  | 'CART_APPLY_COUPON'
  | 'CART_REMOVE_COUPON';

export type ProductActionTypes =
  | 'PRODUCTS_FETCH_REQUEST'
  | 'PRODUCTS_FETCH_SUCCESS'
  | 'PRODUCTS_FETCH_FAILURE'
  | 'PRODUCTS_SET_FILTERS'
  | 'PRODUCTS_CLEAR_FILTERS';

export type OrderActionTypes =
  | 'ORDERS_FETCH_REQUEST'
  | 'ORDERS_FETCH_SUCCESS'
  | 'ORDERS_FETCH_FAILURE'
  | 'ORDERS_CREATE_REQUEST'
  | 'ORDERS_CREATE_SUCCESS'
  | 'ORDERS_CREATE_FAILURE'
  | 'ORDERS_UPDATE_STATUS';
