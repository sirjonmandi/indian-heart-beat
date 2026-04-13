import { createSlice,createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CartState, CartItem } from '../types';
import { customerAPI } from '@/services/api/customerAPI';
const initialState: CartState = {
  items: [],
  itemsCount:0,
  totalItems: 0,
  totalAmount: 0,
  appliedCoupon: null,
  discountAmount: 0,
  subTotal: 0,
  packagingFee: 0,
  deliveryFee: 0,
  handlingFee: 0,
  orderType:'instant',
  scheduled:null,
  error: null,
  products: null,
  cartConditions: [],
  couponCode: undefined,
};

// Async thunks for API calls
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (cartItem: CartItem, { rejectWithValue }) => {
    try {
      const response = await customerAPI.addToCart({
        product_id: cartItem.productId,
        shop_id: cartItem.shopId,
        variant_id: cartItem.variantId,
        quantity: cartItem.quantity,
        notes: cartItem.notes || '',
      });

      return { cartItem, response: response.data };
    } catch (error: any) {
      console.error('Error adding product to cart:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (payload: { cartId:string }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.removeFromCart({ cart_id: payload.cartId });
      return { payload, response: response.data };
    } catch (error: any) {
      console.error('Error removing product from cart:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCart();
      const {data:responseData} = response;
      if (responseData) {
        const {success, data, message} = responseData;
        // console.log('================= get cart response  ===================');
        // console.log(success);
        // console.log(message);
        // console.log(JSON.stringify(data,null,2));
        // console.log('====================================');
        if(success)
        {
          return data;
        }else{
          getCart()
        }
      }else{
        getCart()
      }
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart items');
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async (payload: { cartId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.updateCartItem({cart_id:payload.cartId, quantity:payload.quantity});
      return response.data;
    } catch (error: any) {
      console.error('Error updating cart item quantity:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item quantity');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'home/fetchProducts',
  async (payload: {category:number; shop_id: number}, { rejectWithValue }) => {
    try {
      console.log("fetiching products from api" + JSON.stringify(payload,null,2) );
      const response = await customerAPI.getProducts({
          category:payload.category,
          shop_id:payload.shop_id,
      });
      console.log("api response "+JSON.stringify(response,null,2));
      return response.data;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item quantity');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'home/applyCoupon',
  async (payload: {coupon:string}, {rejectWithValue}) =>{
    try {
       console.log("fetiching products from api" + JSON.stringify(payload,null,2) );
       const response = await customerAPI.applyCoupon({
          code:payload.coupon,
        })

      return response.data;
    } catch (error) {
      console.error('Error while appling coupon :', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to apply coupon!');
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'home/removeCoupon',
  async (payload: { coupon:string}, {rejectWithValue}) =>{
    try {
       console.log("removing coupon from api" + JSON.stringify(payload,null,2) );
       const response = await customerAPI.removeCoupon({
          code:payload.coupon,
        })
      return response.data;
    } catch (error) {
      console.error('Error while removing coupon :', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to remove coupon!');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCoupon:(state) => {
      state.couponCode = undefined;
    },
    // Synchronous actions for optimistic updates
    optimisticAddToCart: (state, action: PayloadAction<CartItem>) => {
      const cartItemKey = `${action.payload.storeId}-${action.payload.productId}-${action.payload.variantId || 'default'}`;
      const existingItem = state.items.find(item => 
        item.productId === action.payload.productId && 
        item.variantId === action.payload.variantId
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({
          ...action.payload,
          cartItemKey,
        });
      }
      const cartSummary = action.payload.data.cart_summary;
      cartSlice.caseReducers.calculateTotals(state, cartSummary);
    },
    optimisticRemoveFromCart: (state, action: PayloadAction<{ cartId: string }>) => {
      state.items = state.items.filter(item => 
        !(item.cartItemKey === action.payload.cartId)
      );
      const cartSummary = action.payload.data.cart_summary;
      cartSlice.caseReducers.calculateTotals(state, cartSummary);
    },
    optimisticGetCart: (state) => {
      state.items = [];
      // cartSlice.caseReducers.calculateTotals(state,action.payload.data.cart_summary);
    },
    optimisticUpdateQuantity: (state, action: PayloadAction<{ cartId: string; quantity: number }>) => {
      const item = state.items.find(item => item.cartItemKey === action.payload.cartId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      const cartSummary = action.payload.data.cart_summary;
      cartSlice.caseReducers.calculateTotals(state, cartSummary);
    },
    calculateTotals: (state, cartSummary) => {
      state.itemsCount = cartSummary.item_count;
      state.subTotal = cartSummary?.subtotal || state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      state.discountAmount = cartSummary?.discount || 0; // 5% discount
      state.packagingFee = cartSummary?.packaging_charge || 0;
      state.deliveryFee = cartSummary?.delivery_charge || 0;
      state.handlingFee = cartSummary?.handling_charge || 0;
      state.totalItems = cartSummary.item_count  || state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = cartSummary.final_total;
      state.cartConditions = Object.values(cartSummary.cart_conditions) || [] ;
      // const subtotal = state.items.reduce((total, item) => {
      //   const itemPrice = item.price || 100;
      //   return total + (item.quantity * itemPrice);
      // }, 0);
      
      // state.subTotal = Math.max(0, subtotal - state.discountAmount);
    },

    clearError: (state) => {
      state.error = null;
    },
    
    resetOrderType:(state) =>{
      state.orderType = 'instant';
    },
    resetScheduled: (state) => {
      state.scheduled = null;
    },
    setOrderType: (state,action) => {
      state.orderType = action.payload;
    },
    
    setScheduled: (state,action) => {
      state.scheduled = action.payload;
    },

    // Direct state updates (for when you want to sync from server response)
    syncCartState: (state, action: PayloadAction<{
      items: CartItem[];
      appliedCoupon?: string | null;
      discountAmount?: number;
    }>) => {
      state.items = action.payload.items;
      state.appliedCoupon = action.payload.appliedCoupon || null;
      state.discountAmount = action.payload.discountAmount || 0;

      const cartSummary = action.payload.data.cart_summary;
      cartSlice.caseReducers.calculateTotals(state, cartSummary);
    },

    resetCartState:(state)=>{
      return initialState;
    }
  },
  extraReducers: (builder) => {
    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        
        const { cartItem } = action.payload;
        const cartItemKey = `${cartItem.shopId}-${cartItem.productId}-${cartItem.variantId || 'default'}`;
        const existingItem = state.items.find(item => 
          item.productId === cartItem.productId && 
          item.variantId === cartItem.variantId
        );

        if (existingItem) {
          existingItem.quantity += cartItem.quantity;
        } else {
          state.items.push({
            ...cartItem,
            cartItemKey,
          });
        }
        const { cart_summary } = action.payload.response.data;
        cartSlice.caseReducers.calculateTotals(state, cart_summary);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Remove from cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const { payload } = action.payload;
        
        state.items = state.items.filter(item => 
          !(item.cartItemKey === payload.cartId)
        );
        const { cart_summary } = action.payload.response.data;
        cartSlice.caseReducers.calculateTotals(state, cart_summary);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Get cart
    builder
      .addCase(getCart.pending, (state) => {
          state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        // console.log('=============== get cart contents =====================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        // Check if payload and data exist
        if (!action.payload) {
          return;
        }
        
        const  data  = action.payload;
        
        // Check if cart_summary exists (if you need it later)
        const cartSummary = data.cart_summary || null;
        cartSlice.caseReducers.calculateTotals(state, cartSummary);
        // Check if cart_items exists and is an object
        const cartItemsObj = data.cart_items;
        
        // add coupon if available
        if(cartSummary.coupon)
        {
          state.couponCode = cartSummary.coupon.name;
        } else {
          cartSlice.caseReducers.resetCoupon(state);
        }


        if (!cartItemsObj || typeof cartItemsObj !== 'object') {
          console.warn('Cart items is null, undefined, or not an object');
          state.items = [];
          return;
        }
        
        // Transform cart items with additional safety checks
        state.items = Object.keys(cartItemsObj).map((cartItemKey) => {
          const item = cartItemsObj[cartItemKey];
          
          // Additional safety check for each item
          if (!item) {
            console.warn(`Cart item ${cartItemKey} is null or undefined`);
            return null;
          }
          
          return {
            cartItemKey: cartItemKey,
            id: item.attributes?.product_id || null,
            variantId: item.attributes?.variant_id || null,
            name: item.name || 'Unknown Product',
            brand: item.attributes?.shop_name || null,
            volume: item.attributes?.variant_attributes?.volume ?? null,
            price: item.price || 0,
            originalPrice: item.attributes?.original_price || 0,
            quantity: item.quantity || 0,
            category: null, // not in your payload
            image: item.attributes?.image || null,
            variantDetails: {
              size: item.attributes?.variant_attributes?.size ?? null,
              color: item.attributes?.variant_attributes?.color ?? null,
              material: item.attributes?.variant_attributes?.material ?? null,
              style: item.attributes?.variant_attributes?.style ?? null,
            },
          };
        }).filter(Boolean); // Remove any null items from the array
      })
      .addCase(getCart.rejected, (state, action) => {
          state.error = action.payload as string;
      });
    builder
      .addCase(updateQuantity.pending, (state) => {
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        const { id, quantity } = action.payload.data.item;
        const existingItem = state.items.find(item => item.cartItemKey === id);
        if (existingItem) {
          existingItem.quantity = quantity;
        }
        cartSlice.caseReducers.calculateTotals(state,action.payload.data.cart_summary);
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) =>{
        // console.log('================= fetch products from slice ===================');
        // console.log(JSON.stringify(action.payload.data.data,null,2));
        // console.log('====================================');
        state.products = action.payload.data.data;
      })
      .addCase(fetchProducts.rejected, (state, action) =>{
          state.error = action.payload as string;
      });
    builder
      .addCase(applyCoupon.pending, (state, action) => {
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) =>{
        // console.log('================= ApplyCoupon from slice ===================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        const {coupon_code,coupon_title} = action.payload.data;
        state.couponCode = coupon_code;
      })
      .addCase(applyCoupon.rejected, (state, action) =>{
          state.error = action.payload as string;
      });
    builder
      .addCase(removeCoupon.pending, (state, action) => {
        state.error = null;
      })
      .addCase(removeCoupon.fulfilled, (state, action) =>{
        // console.log('================= RemoveCoupon from slice ===================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        // const {coupon_code,coupon_title} = action.payload.data;
        // state.couponCode = coupon_code;
        cartSlice.caseReducers.resetCoupon(state);
      })
      .addCase(removeCoupon.rejected, (state, action) =>{
          state.error = action.payload as string;
      });
    
  }
});

export const {
  optimisticAddToCart,
  optimisticGetCart,
  optimisticRemoveFromCart,
  setOrderType,
  resetOrderType,
  setScheduled,
  resetScheduled,
  resetCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;