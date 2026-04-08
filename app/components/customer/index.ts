// ===============================================
// CUSTOMER COMPONENTS INDEX
// ===============================================

export { default as CustomerHeader } from './CustomerHeader';
export { default as StoreCard } from './StoreCard';
export { default as StoreList } from './StoreList';
export { default as CategoryGrid } from './CategoryGrid';
export { default as ProductCard } from './ProductCard';
export { default as ProductHeader } from './ProductHeader';
export { default as ProductGrid } from './ProductGrid';
export { default as CartFooter } from './CartFooter';
export { default as ProductDetailHeader } from './ProductDetailHeader';
export { default as ProductImageSection } from './ProductImageSection';
export { default as ProductInfoSection } from './ProductInfoSection';
export { default as SizeSelectorSection } from './SizeSelectorSection';
export { default as InformationSection } from './InformationSection';
export { default as CartHeader } from './CartHeader';
export { default as CartItem } from './CartItem';
export { default as CouponSection } from './CouponSection';
export { default as PriceSummary } from './PriceSummary';
export { default as InfoSections } from './InfoSections';
export { default as PlaceOrderButton } from './PlaceOrderButton';
export { default as PaymentHeader } from './PaymentHeader';
export { default as PaymentMethods } from './PaymentMethods';
export { default as PaymentDetails } from './PaymentDetails';

// Types
export interface Store {
  id: number;
  name: string;
  rating: string;
  deliveryTime: string;
  location: string;
  logo: boolean;
  productImage: string | null;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  image?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  volume: string;
  category: string;
  inStock: boolean;
  alcoholContent: string;
  image?: string;
}

export interface SizeOption {
  id: string;
  volume: string;
  price: number;
}

export interface CartItemData {
  id: string;
  name: string;
  brand: string;
  volume: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  category: string;
}

export interface PriceSummaryData {
  subtotal: number;
  discount: number;
  packagingCharges: number;
  liquorHandlingCharge: number;
  deliveryCharge: number;
  total: number;
  totalSavings: number;
}

export type PaymentMethodType = 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet';