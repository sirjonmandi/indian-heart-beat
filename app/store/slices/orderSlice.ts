import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { shopAPI } from '@services/api/shopAPI';

// Types
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'completed' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  status: OrderStatus;
  updatedAt: string;
  estimatedReadyTime?: string;
  rejectionReason?: string;
  // Add other order properties as needed
}

interface OrderState {
  // Orders data
  orders: Order[];
  currentOrder: Order | null;
  pendingOrders: Order[];
  confirmedOrders: Order[];
  completedOrders: Order[];
  rejectedOrders: Order[];
  
  //lengths
  pendingCount: number,
  confirmedCount: number,
  completedCount: number,
  readyForPickupCount: number,
  // Loading states
  loading: boolean;
  fetchingOrders: boolean;
  acceptingOrder: boolean;
  rejectingOrder: boolean;
  markingReady: boolean;
  
  // Error states
  error: string | null;
  fetchError: string | null;
  acceptError: string | null;
  rejectError: string | null;
  markReadyError: string | null;
  
  // UI State
  lastUpdated: string | null;
  refreshing: boolean;
  selectedOrderId: string | null;
  statusFilter: OrderStatus | 'all';
  searchQuery: string;
  dateRange: { start: string | null; end: string | null };
  currentPage: number;
  totalOrders: number;
}

const initialState: OrderState = {
  // Orders data
  orders: [],
  currentOrder: null,
  pendingOrders: [],
  confirmedOrders: [],
  completedOrders: [],
  rejectedOrders: [],

  //lengths
  pendingCount: 0,
  confirmedCount: 0,
  completedCount: 0,
  readyForPickupCount: 0,

  // Loading states
  loading: false,
  fetchingOrders: false,
  acceptingOrder: false,
  rejectingOrder: false,
  markingReady: false,
  
  // Error states
  error: null,
  fetchError: null,
  acceptError: null,
  rejectError: null,
  markReadyError: null,
  
  // UI State
  lastUpdated: null,
  refreshing: false,
  selectedOrderId: null,
  statusFilter: 'all',
  searchQuery: '',
  dateRange: { start: null, end: null },
  currentPage: 1,
  totalOrders: 0,
};

// Async Thunks
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (params: {
    status?: string; 
    page?: number; 
    limit?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getOrders(params);
      
      // Handle both scenarios: direct API response or axios response object
      const apiResponse = response.data ? response.data : response;
      const success = response.success !== undefined ? response.success : (response.status === 200 || response.statusText === 'OK');
      const data = response.data ? (response.data.data || response.data) : response;
      const message = response.message || 'Orders retrieved successfully';
      
      if (success) {
        return data;
      } else {
        return rejectWithValue(message || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('Orders fetch error:', error);
      
      // Handle different types of errors
      if (error?.status === 401 || error?.response?.status === 401) {
        return rejectWithValue('Authentication failed. Please login again.');
      } else if (error?.status === 403 || error?.response?.status === 403) {
        return rejectWithValue('You are not authorized to view orders.');
      } else if (error?.status === 404 || error?.response?.status === 404) {
        return rejectWithValue('No orders found.');
      } else if (error?.status >= 500 || error?.response?.status >= 500) {
        return rejectWithValue('Server error. Please try again later.');
      } else if (error?.message) {
        return rejectWithValue(error.message);
      } else if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (!error?.response && !error?.status) {
        return rejectWithValue('Network connection failed. Please check your internet connection.');
      } else {
        return rejectWithValue('Failed to load orders. Please try again.');
      }
    }
  }
);

export const acceptOrder = createAsyncThunk(
  'order/acceptOrder',
  async (orderId: string, { rejectWithValue, dispatch }) => {
    try {
      console.log('Accepting order:', orderId);
      
      const response = await shopAPI.acceptOrder(orderId);
      console.log('Accept order response:', response);
      
      // Handle both scenarios: direct API response or axios response object
      const success = response.success !== undefined ? response.success : (response.status === 200 || response.statusText === 'OK');
      const data = response.data ? (response.data.data || response.data) : response;
      const message = response.message || 'Order accepted successfully';
      
      if (success) {

        // Refresh orders after successful accept
        dispatch(fetchOrders({ status: 'pending' }));
        
        return { orderId, ...data, message };
      } else {
        return rejectWithValue(message || 'Failed to accept order');
      }
    } catch (error: any) {
      console.error('Accept order error:', error);
      
      // Handle specific errors
      if (error?.status === 401 || error?.response?.status === 401) {
        return rejectWithValue('Authentication failed. Please login again.');
      } else if (error?.status === 403 || error?.response?.status === 403) {
        return rejectWithValue('You are not authorized to accept this order.');
      } else if (error?.status === 404 || error?.response?.status === 404) {
        return rejectWithValue('Order not found.');
      } else if (error?.status === 409 || error?.response?.status === 409) {
        return rejectWithValue('Order has already been processed.');
      } else if (error?.status === 422 || error?.response?.status === 422) {
        const message = error?.message || error?.response?.data?.message || 'Cannot accept order. Please check order status.';
        return rejectWithValue(message);
      } else if (error?.status >= 500 || error?.response?.status >= 500) {
        return rejectWithValue('Server error occurred. Please try again later.');
      } else if (error?.message) {
        return rejectWithValue(error.message);
      } else if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (!error?.response && !error?.status) {
        return rejectWithValue('Network connection failed. Please check your internet connection.');
      } else {
        return rejectWithValue('Failed to accept order. Please try again.');
      }
    }
  }
);

export const rejectOrder = createAsyncThunk(
  'order/rejectOrder',
  async ({ orderId, reason }: { 
    orderId: string; 
    reason?: string; 
  }, { rejectWithValue, dispatch }) => {
    try {
      
      const response = await shopAPI.rejectOrder(orderId, reason);
      
      // Handle both scenarios: direct API response or axios response object
      const success = response.success !== undefined ? response.success : (response.status === 200 || response.statusText === 'OK');
      const data = response.data ? (response.data.data || response.data) : response;
      const message = response.message || 'Order rejected successfully';
      
      if (success) {
        // Refresh orders after successful reject
        dispatch(fetchOrders({ status: 'pending' }));
        
        return { orderId, reason, ...data, message };
      } else {
        return rejectWithValue(message || 'Failed to reject order');
      }
    } catch (error: any) {
      console.error('Reject order error:', error);
      
      // Handle specific errors
      if (error?.status === 401 || error?.response?.status === 401) {
        return rejectWithValue('Authentication failed. Please login again.');
      } else if (error?.status === 403 || error?.response?.status === 403) {
        return rejectWithValue('You are not authorized to reject this order.');
      } else if (error?.status === 404 || error?.response?.status === 404) {
        return rejectWithValue('Order not found.');
      } else if (error?.status === 409 || error?.response?.status === 409) {
        return rejectWithValue('Order has already been processed.');
      } else if (error?.status === 422 || error?.response?.status === 422) {
        const message = error?.message || error?.response?.data?.message || 'Cannot reject order. Please check order status.';
        return rejectWithValue(message);
      } else if (error?.status >= 500 || error?.response?.status >= 500) {
        return rejectWithValue('Server error occurred. Please try again later.');
      } else if (error?.message) {
        return rejectWithValue(error.message);
      } else if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (!error?.response && !error?.status) {
        return rejectWithValue('Network connection failed. Please check your internet connection.');
      } else {
        return rejectWithValue('Failed to reject order. Please try again.');
      }
    }
  }
);

export const markOrderReady = createAsyncThunk(
  'order/markOrderReady',
  async ({ orderId, estimatedReadyTime }: { 
    orderId: string; 
    estimatedReadyTime?: string; 
  }, { rejectWithValue, dispatch }) => {
    try {
      console.log('Marking order ready:', orderId, 'ETA:', estimatedReadyTime);
      
      const response = await shopAPI.markOrderReady(orderId, estimatedReadyTime);
      console.log('Mark order ready response:', response);
      
      // Handle both scenarios: direct API response or axios response object
      const success = response.success !== undefined ? response.success : (response.status === 200 || response.statusText === 'OK');
      const data = response.data ? (response.data.data || response.data) : response;
      const message = response.message || 'Order marked as ready successfully';
      
      if (success) {
        dispatch(fetchOrders({ status: 'confirmed' }));
        return { orderId, estimatedReadyTime, ...data, message };
      } else {
        return rejectWithValue(message || 'Failed to mark order as ready');
      }
    } catch (error: any) {
      console.error('Mark order ready error:', error);
      
      // Handle specific errors
      if (error?.status === 401 || error?.response?.status === 401) {
        return rejectWithValue('Authentication failed. Please login again.');
      } else if (error?.status === 403 || error?.response?.status === 403) {
        return rejectWithValue('You are not authorized to update this order.');
      } else if (error?.status === 404 || error?.response?.status === 404) {
        return rejectWithValue('Order not found.');
      } else if (error?.status === 409 || error?.response?.status === 409) {
        return rejectWithValue('Order cannot be marked as ready. Please check order status.');
      } else if (error?.status === 422 || error?.response?.status === 422) {
        const message = error?.message || error?.response?.data?.message || 'Cannot mark order as ready. Please check order status.';
        return rejectWithValue(message);
      } else if (error?.status >= 500 || error?.response?.status >= 500) {
        return rejectWithValue('Server error occurred. Please try again later.');
      } else if (error?.message) {
        return rejectWithValue(error.message);
      } else if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (!error?.response && !error?.status) {
        return rejectWithValue('Network connection failed. Please check your internet connection.');
      } else {
        return rejectWithValue('Failed to mark order as ready. Please try again.');
      }
    }
  }
);

// Additional thunk for fetching a single order
export const fetchSingleOrder = createAsyncThunk(
  'order/fetchSingleOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getOrder(orderId);
      console.log('Single order response:', response);
      
      const apiResponse = response.data ? response.data : response;
      const success = response.success !== undefined ? response.success : (response.status === 200 || response.statusText === 'OK');
      const data = response.data ? (response.data.data || response.data) : response;
      
      if (success) {
        return data;
      } else {
        return rejectWithValue(apiResponse.message || 'Failed to fetch order');
      }
    } catch (error: any) {
      console.error('Single order fetch error:', error);
      
      if (error?.status === 404 || error?.response?.status === 404) {
        return rejectWithValue('Order not found.');
      } else if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue('Failed to load order details.');
      }
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.fetchError = null;
      state.acceptError = null;
      state.rejectError = null;
      state.markReadyError = null;
    },

    clearSpecificError: (state, action: PayloadAction<'fetch' | 'accept' | 'reject' | 'markReadyForPickup'>) => {
      const errorType = action.payload;
      switch (errorType) {
        case 'fetch':
          state.fetchError = null;
          break;
        case 'accept':
          state.acceptError = null;
          break;
        case 'reject':
          state.rejectError = null;
          break;
        case 'markReadyForPickup':
          state.markReadyForPickupError = null;
          break;
      }
    },
    
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    
    setSelectedOrder: (state, action: PayloadAction<string | null>) => {
      state.selectedOrderId = action.payload;
      if (action.payload) {
        const order = state.orders.find(o => o.id === action.payload);
        state.currentOrder = order || null;
      } else {
        state.currentOrder = null;
      }
    },
    
    setStatusFilter: (state, action: PayloadAction<OrderStatus | 'all'>) => {
      state.statusFilter = action.payload;
      state.currentPage = 1; // Reset pagination when filter changes
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset pagination when search changes
    },
    
    setDateRange: (state, action: PayloadAction<{ start: string | null; end: string | null }>) => {
      state.dateRange = action.payload;
      state.currentPage = 1; // Reset pagination when date range changes
    },
    
    // For real-time updates (WebSocket or SSE)
    addNewOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
      state.totalOrders += 1;
      
      // Add to appropriate category list
      if (action.payload.status === 'pending') {
        state.pendingOrders.unshift(action.payload);
      }
    },
    
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus; updatedOrder?: Order }>) => {
      const { orderId, status, updatedOrder } = action.payload;
      
      // Update in main orders array
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        if (updatedOrder) {
          state.orders[orderIndex] = updatedOrder;
        } else {
          state.orders[orderIndex].status = status;
          state.orders[orderIndex].updatedAt = new Date().toISOString();
        }
      }
      
      // Update current order if it's selected
      if (state.currentOrder?.id === orderId) {
        if (updatedOrder) {
          state.currentOrder = updatedOrder;
        } else {
          state.currentOrder.status = status;
          state.currentOrder.updatedAt = new Date().toISOString();
        }
      }
      
      // Update category lists
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        // Remove from all category lists
        state.pendingOrders = state.pendingOrders.filter(o => o.id !== orderId);
        state.confirmedOrders = state.confirmedOrders.filter(o => o.id !== orderId);
        state.completedOrders = state.completedOrders.filter(o => o.id !== orderId);
        state.rejectedOrders = state.rejectedOrders.filter(o => o.id !== orderId);
        
        // Add to appropriate category list
        switch (status) {
          case 'pending':
            state.pendingOrders.push(order);
            break;
          case 'confirmed':
          case 'preparing':
          case 'ready_for_pickup':
            state.confirmedOrders.push(order);
            break;
          case 'completed':
          case 'delivered':
            state.completedOrders.push(order);
            break;
          case 'cancelled':
            state.rejectedOrders.push(order);
            break;
        }
      }
    },
    
    // Reset state (useful for logout)
    resetOrderState: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.fetchingOrders = true;
        state.loading = true;
        state.fetchError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.fetchingOrders = false;
        state.loading = false;
        state.refreshing = false;
        state.fetchError = null;
        state.lastUpdated = new Date().toISOString();

        console.log('Orders data payload:', JSON.stringify(action.payload));

        //set counts 
        state.pendingCount = action.payload.counts.pending || state.pendingOrders.length;
        state.confirmedCount = action.payload.counts.confirmed || state.confirmedOrders.length;
        state.readyForPickupCount = action.payload.counts.ready_for_pickup || 0;
        state.completedCount = action.payload.counts.completed || state.completedOrders.length;

        // Update orders data with safe fallbacks
        state.orders = Array.isArray(action.payload.orders) ? action.payload.orders : 
                      Array.isArray(action.payload) ? action.payload : [];
        
        // Update total count
        state.totalOrders = action.payload.total || state.orders.length;
      
        // Categorize orders
        const orders = state.orders;
        state.pendingOrders = orders.filter(order => order.status === 'pending');
        state.confirmedOrders = orders.filter(order => 
          ['confirmed', 'preparing', 'ready_for_pickup'].includes(order.status)
        );
        state.completedOrders = orders.filter(order => 
          ['completed', 'delivered'].includes(order.status)
        );
        state.rejectedOrders = orders.filter(order => 
          order.status === 'cancelled'
        );
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.fetchingOrders = false;
        state.loading = false;
        state.refreshing = false;
        state.fetchError = action.payload as string;
        console.error('Orders fetch rejected:', action.payload);
      });

    // Fetch Single Order
    builder
      .addCase(fetchSingleOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentOrder = action.payload;
        
        // Update in main orders array if it exists
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
      })
      .addCase(fetchSingleOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Single order fetch rejected:', action.payload);
      });

    // Accept Order
    builder
      .addCase(acceptOrder.pending, (state) => {
        state.acceptingOrder = true;
        state.acceptError = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.acceptingOrder = false;
        state.acceptError = null;
        
        const { orderId } = action.payload;
        console.log('Order accepted successfully:', action.payload);
        
        // Update order status in state to 'confirmed'
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'confirmed';
          state.orders[orderIndex].updatedAt = new Date().toISOString();
        }
        
        // Update current order if it's selected
        if (state.currentOrder?.id === orderId) {
          state.currentOrder.status = 'confirmed';
          state.currentOrder.updatedAt = new Date().toISOString();
        }
        
        // Move from pending to confirmed lists
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          state.pendingOrders = state.pendingOrders.filter(o => o.id !== orderId);
          state.confirmedOrders.push(order);
        }
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.acceptingOrder = false;
        state.acceptError = action.payload as string;
        console.error('Accept order rejected:', action.payload);
      });

    // Reject Order
    builder
      .addCase(rejectOrder.pending, (state) => {
        state.rejectingOrder = true;
        state.rejectError = null;
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        state.rejectingOrder = false;
        state.rejectError = null;
        
        const { orderId, reason } = action.payload;
        console.log('Order rejected successfully:', action.payload);
        
        // Update order status in state to 'cancelled'
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'cancelled';
          state.orders[orderIndex].rejectionReason = reason;
          state.orders[orderIndex].updatedAt = new Date().toISOString();
        }
        
        // Update current order if it's selected
        if (state.currentOrder?.id === orderId) {
          state.currentOrder.status = 'cancelled';
          state.currentOrder.rejectionReason = reason;
          state.currentOrder.updatedAt = new Date().toISOString();
        }
        
        // Move from pending to rejected lists
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          state.pendingOrders = state.pendingOrders.filter(o => o.id !== orderId);
          state.rejectedOrders.push(order);
        }
      })
      .addCase(rejectOrder.rejected, (state, action) => {
        state.rejectingOrder = false;
        state.rejectError = action.payload as string;
        console.error('Reject order rejected:', action.payload);
      });

    // Mark Order Ready
    builder
      .addCase(markOrderReady.pending, (state) => {
        state.markingReady = true;
        state.markReadyError = null;
      })
      .addCase(markOrderReady.fulfilled, (state, action) => {
        state.markingReady = false;
        state.markReadyError = null;
        
        const { orderId, estimatedReadyTime } = action.payload;
        console.log('Order marked ready successfully:', action.payload);
        
        // Update order status in state
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'ready_for_pickup';
          state.orders[orderIndex].estimatedReadyTime = estimatedReadyTime;
          state.orders[orderIndex].updatedAt = new Date().toISOString();
        }
        
        // Update current order if it's selected
        if (state.currentOrder?.id === orderId) {
          state.currentOrder.status = 'ready_for_pickup';
          state.currentOrder.estimatedReadyTime = estimatedReadyTime;
          state.currentOrder.updatedAt = new Date().toISOString();
        }
        
        // Order stays in confirmedOrders list but with updated status
        const order = state.confirmedOrders.find(o => o.id === orderId);
        if (order) {
          order.status = 'ready_for_pickup';
          order.estimatedReadyTime = estimatedReadyTime;
          order.updatedAt = new Date().toISOString();
        }
      })
      .addCase(markOrderReady.rejected, (state, action) => {
        state.markingReady = false;
        state.markReadyError = action.payload as string;
        console.error('Mark order ready rejected:', action.payload);
      });
  },
});

// Export actions
export const {
  clearError,
  clearSpecificError,
  setRefreshing,
  setSelectedOrder,
  setStatusFilter,
  setSearchQuery,
  setDateRange,
  addNewOrder,
  updateOrderStatus,
  resetOrderState,
} = orderSlice.actions;

// Selectors
export const selectOrderData = (state: { order: OrderState }) => state.order;
export const selectOrders = (state: { order: OrderState }) => state.order.orders;
export const selectCurrentOrder = (state: { order: OrderState }) => state.order.currentOrder;
export const selectPendingOrders = (state: { order: OrderState }) => state.order.pendingOrders;
export const selectConfirmedOrders = (state: { order: OrderState }) => state.order.confirmedOrders;
export const selectCompletedOrders = (state: { order: OrderState }) => state.order.completedOrders;
export const selectRejectedOrders = (state: { order: OrderState }) => state.order.rejectedOrders;

export const selectIsLoading = (state: { order: OrderState }) => state.order.loading;
export const selectIsFetchingOrders = (state: { order: OrderState }) => state.order.fetchingOrders;
export const selectIsAcceptingOrder = (state: { order: OrderState }) => state.order.acceptingOrder;
export const selectIsRejectingOrder = (state: { order: OrderState }) => state.order.rejectingOrder;
export const selectIsMarkingReady = (state: { order: OrderState }) => state.order.markingReady;

export const selectError = (state: { order: OrderState }) => state.order.error;
export const selectFetchError = (state: { order: OrderState }) => state.order.fetchError;
export const selectAcceptError = (state: { order: OrderState }) => state.order.acceptError;
export const selectRejectError = (state: { order: OrderState }) => state.order.rejectError;
export const selectMarkReadyError = (state: { order: OrderState }) => state.order.markReadyError;

export const selectPendingOrdersCount = (state: { order: OrderState }) => state.order.pendingOrders.length;
export const selectReadyOrdersCount = (state: { order: OrderState }) => 
  state.order.confirmedOrders.filter(order => order.status === 'ready_for_pickup').length;

// Thunk selectors (for conditional dispatching)
export const selectShouldRefreshOrders = (state: { order: OrderState }) => {
  const { lastUpdated } = state.order;
  if (!lastUpdated) return true;
  
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  return new Date(lastUpdated) < twoMinutesAgo;
};

export const selectOrderById = (orderId: string) => (state: { order: OrderState }) =>
  state.order.orders.find(order => order.id === orderId);

export const selectOrdersByStatus = (status: OrderStatus) => (state: { order: OrderState }) =>
  state.order.orders.filter(order => order.status === status);

export default orderSlice.reducer;