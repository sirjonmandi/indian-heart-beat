import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { RootState } from '../store';
import {
  addToCart as addToCartAction,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  calculateTotals,
} from '../store/slices/cartSlice';
import { CartItem, Product } from '../store/types';
import { demoProducts } from '../data/demoProducts';
import { Constants } from '../utils/constants';

interface CartProduct extends Product {
  quantity: number;
  totalPrice: number;
  notes?: string;
  selectedVariant?: string;
}

interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  platformFee: number;
  total: number;
  savings: number;
  itemCount: number;
  uniqueItemCount: number;
}

interface CouponValidation {
  isValid: boolean;
  discount: number;
  message: string;
  code?: string;
}

interface UseCartReturn {
  // Cart State
  items: CartProduct[];
  summary: CartSummary;
  appliedCoupon: string | null;
  isEmpty: boolean;
  isLoading: boolean;
  
  // Cart Actions
  addToCart: (productId: string, quantity?: number, options?: { notes?: string; variant?: string }) => Promise<boolean>;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearAllItems: () => void;
  
  // Item Utilities
  getItemQuantity: (productId: string) => number;
  isItemInCart: (productId: string) => boolean;
  canAddMore: (productId: string) => boolean;
  
  // Coupon Management
  validateAndApplyCoupon: (code: string) => Promise<CouponValidation>;
  removeCouponCode: () => void;
  
  // Cart Validation
  validateCart: () => { isValid: boolean; errors: string[] };
  checkMinimumOrder: () => { isValid: boolean; shortfall: number };
  checkDeliveryAvailability: () => boolean;
  
  // Utilities
  getCartShareableText: () => string;
  exportCartData: () => any;
  importCartData: (data: any) => boolean;
}

const useCart = (): UseCartReturn => {
  const dispatch = useDispatch();
  const cartState = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  // Get products with cart quantities
  const items: CartProduct[] = useMemo(() => {
    return cartState.items.map(cartItem => {
      const product = demoProducts.find(p => p.id === cartItem.productId);
      if (!product) {
        // Handle case where product is not found (removed from catalog)
        return null;
      }
      
      return {
        ...product,
        quantity: cartItem.quantity,
        totalPrice: product.price * cartItem.quantity,
        notes: cartItem.notes,
        selectedVariant: cartItem.selectedVariant,
      };
    }).filter(Boolean) as CartProduct[];
  }, [cartState.items]);

  // Calculate cart summary
  const summary: CartSummary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueItemCount = items.length;
    
    // Calculate delivery fee
    let deliveryFee = Constants.DELIVERY_CHARGE;
    if (subtotal >= Constants.FREE_DELIVERY_ABOVE) {
      deliveryFee = 0;
    }
    
    // Calculate taxes (18% GST on alcohol)
    const taxes = Math.round(subtotal * 0.18);
    
    // Platform fee (₹5 for orders below ₹500)
    const platformFee = subtotal < 500 ? 5 : 0;
    
    // Apply coupon discount
    const discount = cartState.discountAmount || 0;
    
    // Calculate total savings (discounts + saved delivery fee)
    const productSavings = items.reduce((sum, item) => {
      const originalPrice = item.originalPrice || item.price;
      return sum + ((originalPrice - item.price) * item.quantity);
    }, 0);
    const deliverySavings = subtotal >= Constants.FREE_DELIVERY_ABOVE ? Constants.DELIVERY_CHARGE : 0;
    const savings = productSavings + deliverySavings + discount;
    
    const total = subtotal + deliveryFee + taxes + platformFee - discount;
    
    return {
      subtotal,
      deliveryFee,
      taxes,
      discount,
      platformFee,
      total: Math.max(0, total),
      savings,
      itemCount,
      uniqueItemCount,
    };
  }, [items, cartState.discountAmount]);

  // Add item to cart
  const addToCart = useCallback(async (
    productId: string, 
    quantity = 1, 
    options: { notes?: string; variant?: string } = {}
  ): Promise<boolean> => {
    try {
      const product = demoProducts.find(p => p.id === productId);
      
      if (!product) {
        Alert.alert('Error', 'Product not found');
        return false;
      }
      
      if (!product.inStock) {
        Alert.alert('Out of Stock', `${product.name} is currently out of stock`);
        return false;
      }
      
      // Check maximum quantity limit (e.g., 10 per product)
      const currentQuantity = getItemQuantity(productId);
      const maxQuantity = 10;
      
      if (currentQuantity + quantity > maxQuantity) {
        Alert.alert(
          'Quantity Limit', 
          `You can only add up to ${maxQuantity} units of ${product.name}`
        );
        return false;
      }
      
      // Age verification check
      if (!user?.ageVerified) {
        Alert.alert(
          'Age Verification Required',
          'Please complete age verification to add alcohol products to cart'
        );
        return false;
      }
      
      dispatch(addToCartAction({
        productId,
        quantity,
        notes: options.notes,
        selectedVariant: options.variant,
      }));
      
      // Show success feedback
      Alert.alert(
        'Added to Cart',
        `${product.name} has been added to your cart`,
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
      return false;
    }
  }, [dispatch, user?.ageVerified]);

  // Remove item from cart
  const removeItem = useCallback((productId: string) => {
    const product = demoProducts.find(p => p.id === productId);
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove ${product?.name || 'this item'} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => dispatch(removeFromCart(productId))
        }
      ]
    );
  }, [dispatch]);

  // Update item quantity
  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    const maxQuantity = 10;
    if (quantity > maxQuantity) {
      Alert.alert('Quantity Limit', `Maximum ${maxQuantity} units allowed per product`);
      return;
    }
    
    dispatch(updateQuantity({ productId, quantity }));
  }, [dispatch, removeItem]);

  // Clear all cart items
  const clearAllItems = useCallback(() => {
    if (items.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => dispatch(clearCart())
        }
      ]
    );
  }, [dispatch, items.length]);

  // Get quantity of specific item
  const getItemQuantity = useCallback((productId: string): number => {
    const item = cartState.items.find(item => item.productId === productId);
    return item?.quantity || 0;
  }, [cartState.items]);

  // Check if item is in cart
  const isItemInCart = useCallback((productId: string): boolean => {
    return cartState.items.some(item => item.productId === productId);
  }, [cartState.items]);

  // Check if can add more of item
  const canAddMore = useCallback((productId: string): boolean => {
    const currentQuantity = getItemQuantity(productId);
    const product = demoProducts.find(p => p.id === productId);
    return product?.inStock && currentQuantity < 10;
  }, [getItemQuantity]);

  // Validate and apply coupon
  const validateAndApplyCoupon = useCallback(async (code: string): Promise<CouponValidation> => {
    // Simulate API call to validate coupon
    return new Promise((resolve) => {
      setTimeout(() => {
        const upperCode = code.toUpperCase();
        
        // Demo coupon codes
        const coupons = {
          'WELCOME20': { discount: Math.min(summary.subtotal * 0.20, 200), minOrder: 299 },
          'FIRST10': { discount: Math.min(summary.subtotal * 0.10, 100), minOrder: 199 },
          'SAVE50': { discount: 50, minOrder: 499 },
          'FREE100': { discount: 100, minOrder: 999 },
          'NEWUSER': { discount: Math.min(summary.subtotal * 0.15, 150), minOrder: 399 },
        };
        
        const coupon = coupons[upperCode as keyof typeof coupons];
        
        if (!coupon) {
          resolve({
            isValid: false,
            discount: 0,
            message: 'Invalid coupon code'
          });
          return;
        }
        
        if (summary.subtotal < coupon.minOrder) {
          resolve({
            isValid: false,
            discount: 0,
            message: `Minimum order of ₹${coupon.minOrder} required for this coupon`
          });
          return;
        }
        
        dispatch(applyCoupon({ code: upperCode, discount: coupon.discount }));
        
        resolve({
          isValid: true,
          discount: coupon.discount,
          message: `Coupon applied! You saved ₹${coupon.discount}`,
          code: upperCode
        });
      }, 1000);
    });
  }, [dispatch, summary.subtotal]);

  // Remove coupon
  const removeCouponCode = useCallback(() => {
    dispatch(removeCoupon());
  }, [dispatch]);

  // Validate cart before checkout
  const validateCart = useCallback(() => {
    const errors: string[] = [];
    
    if (items.length === 0) {
      errors.push('Cart is empty');
    }
    
    // Check stock availability
    items.forEach(item => {
      const product = demoProducts.find(p => p.id === item.id);
      if (!product?.inStock) {
        errors.push(`${item.name} is out of stock`);
      }
    });
    
    // Check age verification
    if (!user?.ageVerified) {
      errors.push('Age verification required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [items, user?.ageVerified]);

  // Check minimum order amount
  const checkMinimumOrder = useCallback(() => {
    const shortfall = Math.max(0, Constants.MIN_ORDER_AMOUNT - summary.subtotal);
    return {
      isValid: shortfall === 0,
      shortfall
    };
  }, [summary.subtotal]);

  // Check delivery availability
  const checkDeliveryAvailability = useCallback(() => {
    // In a real app, this would check user's address against service areas
    return true; // For demo, always return true
  }, []);

  // Get shareable cart text
  const getCartShareableText = useCallback(() => {
    if (items.length === 0) return 'My cart is empty';
    
    let text = '🍺 My Beergo Cart:\n\n';
    items.forEach(item => {
      text += `• ${item.name} (${item.quantity}x) - ₹${item.totalPrice}\n`;
    });
    text += `\nTotal: ₹${summary.total}`;
    text += '\n\nOrder now on Beergo app!';
    
    return text;
  }, [items, summary.total]);

  // Export cart data
  const exportCartData = useCallback(() => {
    return {
      items: cartState.items,
      appliedCoupon: cartState.appliedCoupon,
      discountAmount: cartState.discountAmount,
      timestamp: new Date().toISOString(),
    };
  }, [cartState]);

  // Import cart data
  const importCartData = useCallback((data: any): boolean => {
    try {
      if (!data || !Array.isArray(data.items)) {
        return false;
      }
      
      // Validate imported data
      const validItems = data.items.filter((item: any) => 
        item.productId && 
        typeof item.quantity === 'number' && 
        item.quantity > 0
      );
      
      if (validItems.length === 0) {
        return false;
      }
      
      // Clear current cart and import new data
      dispatch(clearCart());
      
      validItems.forEach((item: CartItem) => {
        dispatch(addToCartAction(item));
      });
      
      // Apply coupon if exists
      if (data.appliedCoupon && data.discountAmount) {
        dispatch(applyCoupon({
          code: data.appliedCoupon,
          discount: data.discountAmount
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing cart data:', error);
      return false;
    }
  }, [dispatch]);

  return {
    // State
    items,
    summary,
    appliedCoupon: cartState.appliedCoupon,
    isEmpty: items.length === 0,
    isLoading: false, // Could be connected to loading state
    
    // Actions
    addToCart,
    removeItem,
    updateItemQuantity,
    clearAllItems,
    
    // Utilities
    getItemQuantity,
    isItemInCart,
    canAddMore,
    
    // Coupons
    validateAndApplyCoupon,
    removeCouponCode,
    
    // Validation
    validateCart,
    checkMinimumOrder,
    checkDeliveryAvailability,
    
    // Utils
    getCartShareableText,
    exportCartData,
    importCartData,
  };
};

export default useCart;

// ============================================
// Additional Cart Utilities
// ============================================

// Cart persistence utility
export const saveCartToStorage = async (cartData: any) => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.setItem(Constants.STORAGE_KEYS.CART_DATA, JSON.stringify(cartData));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

export const loadCartFromStorage = async () => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const cartData = await AsyncStorage.default.getItem(Constants.STORAGE_KEYS.CART_DATA);
    return cartData ? JSON.parse(cartData) : null;
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return null;
  }
};

// Cart analytics helper
export const trackCartEvent = (event: string, data?: any) => {
  // In a real app, this would send analytics events
  console.log('Cart Event:', event, data);
};

// Cart comparison utility
export const compareCartItems = (items1: CartItem[], items2: CartItem[]) => {
  if (items1.length !== items2.length) return false;
  
  return items1.every(item1 => {
    const item2 = items2.find(i => i.productId === item1.productId);
    return item2 && item2.quantity === item1.quantity;
  });
};

// Quick add preset carts
export const PRESET_CARTS = {
  'party-pack': [
    { productId: '1', quantity: 6 }, // Beer
    { productId: '3', quantity: 1 }, // Vodka
    { productId: '5', quantity: 1 }, // Rum
  ],
  'wine-night': [
    { productId: '4', quantity: 2 }, // Wine
  ],
  'whiskey-collection': [
    { productId: '2', quantity: 1 }, // Royal Challenge
  ],
};

// Cart recommendation engine
export const getCartRecommendations = (currentItems: CartItem[]): Product[] => {
  // Simple recommendation logic based on cart contents
  const categories = currentItems.map(item => {
    const product = demoProducts.find(p => p.id === item.productId);
    return product?.category;
  });
  
  const uniqueCategories = [...new Set(categories)];
  
  // Recommend mixers if alcohol is in cart
  if (uniqueCategories.some(cat => ['Beer', 'Wine', 'Whiskey', 'Vodka', 'Rum', 'Gin'].includes(cat || ''))) {
    return demoProducts.filter(p => p.category === 'Mixers').slice(0, 3);
  }
  
  // Recommend popular items
  return demoProducts
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5);
};

// Price alert utility
export const checkPriceAlerts = (items: CartItem[]): { productId: string; oldPrice: number; newPrice: number }[] => {
  // In a real app, this would check against saved price alerts
  return [];
};

// Cart expiry utility
export const getCartExpiryTime = (): Date => {
  // Cart expires after 24 hours
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
};

// Stock availability checker
export const checkStockAvailability = async (items: CartItem[]): Promise<{ productId: string; available: boolean; stock: number }[]> => {
  // Simulate API call to check stock
  return items.map(item => {
    const product = demoProducts.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      available: product?.inStock || false,
      stock: Math.floor(Math.random() * 50) + 1, // Random stock for demo
    };
  });
};