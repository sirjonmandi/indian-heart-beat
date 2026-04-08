import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import Geolocation from '@react-native-community/geolocation';
import { deliveryAPI } from '@services/api/deliveryAPI'; // Commented out for dummy mode

// Define RootState interface if not already defined
interface RootState {
  delivery: DeliveryState;
  // ... other state properties
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  shop: {
    name: string;
    address?: string;
  };
  customer?: {
    name?: string;
    address?: string;
  };
  distance: number;
  deliveryFee: number;
  estimatedTime: number;
  status?: string;
}


interface DeliveryState {
  isOnline: boolean;
  isAvailable: boolean;
  partnerStatus:string;
  profile: any;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  notification:any;
  currentOrder:any;
  todayEarnings: number;
  totalDeliveries: number;
  weekEarnings:number;
  monthEarnings:number;
  totalEarnings:number;
  pendingPayout:number;
  acceptanceRate: number;
  rating: number;
  availableOrders: DeliveryOrder[];
  activeOrder: DeliveryOrder | null;
  orderHistory: DeliveryOrder[];
  earnings: any[];
  bankDetails:any | null;
  loading: boolean;
  error: string | null;
  earningsData:any | null;
  notificationPreferences?:any;
  performanceData?:{
    period:string,
    stats:{},
    recentRatings:{},
    badges:{},
    improvements:{},
  };
  payoutHistory?: any;
  schedules:any | null;
  selectedDateSchedules:any | null;
}

const initialState: DeliveryState = {
  isOnline: false,
  isAvailable: false,
  partnerStatus:'pending',
  profile:null,
  currentLocation: null,
  todayEarnings: 0,
  totalDeliveries: 0,
  weekEarnings: 0,
  monthEarnings: 0,
  totalEarnings:0,
  pendingPayout:0,
  notification:null,
  currentOrder:null,
  acceptanceRate: 0,
  rating: 0,
  availableOrders: [],
  activeOrder: null,
  orderHistory: [],
  earnings: [],
  bankDetails:null,
  loading: false,
  error: null,
  earningsData:[],
  notificationPreferences:{
    orderNotification:true,
    earningsNotification:true,
    promotionalNotification:true,
  },
  performanceData: {
    period: '',
    stats: {},
    recentRatings: {},
    badges: {},
    improvements: {},
  },
  payoutHistory:null,
  schedules:null,
  selectedDateSchedules:null,
};

// helper function 
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// DUMMY: Async thunks with mock data
export const fetchDashboardData = createAsyncThunk(
  'delivery/fetchDashboardData',
  async () => {
    const response = await deliveryAPI.getDashboardData();
    return response.data;
    
  }
);

export const toggleAvailability = createAsyncThunk(
  'delivery/toggleAvailability',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const response = await deliveryAPI.toggleAvailability(!state.delivery.isOnline);
    return response.data;
  }
);

export const updateLocation = createAsyncThunk(
  'delivery/updateLocation',
  async (location: { latitude: number; longitude: number }) => {
    console.log('📍 Updating location (DUMMY MODE):', location);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { location };

    /* TODO: Uncomment when API is ready
    const response = await deliveryAPI.updateLocation(location);
    return { ...response.data, location };
    */
  }
);

export const fetchAvailableOrders = createAsyncThunk(
  'delivery/fetchAvailableOrders',
  async () => {
    const response = await deliveryAPI.getAvailableOrders();
    // console.log(JSON.stringify(response.data,null,2));
    return response.data;

  }
);

export const fetchOrderDetails = createAsyncThunk(
  'delivery/fetchOrderDetails',
  async (orderId:string) =>{
    const response = await deliveryAPI.fetchOrderDetails(orderId);
    return toCamelCase(response.data);
  }
);
export const acceptOrder = createAsyncThunk(
  'delivery/acceptOrder',
  async (orderId: string) => {
    // console.log('✅ Accepting order (DUMMY MODE):', orderId);
    const response = await deliveryAPI.acceptOrder(orderId);
    return response.data;
    // */
  }
);

export const rejectOrder = createAsyncThunk(
  'delivery/rejectOrder',
  async ({ orderId, reason }: { orderId: string; reason: string }) => {
    // console.log('❌ Rejecting order (DUMMY MODE):', {orderId,reason});
    const response = await deliveryAPI.rejectOrder(orderId,reason);
    return response.data;
  }
);

export const pickupOrder = createAsyncThunk(
  'delivery/pickupOrder',
  async({orderId,data}:{orderId:string,data:{pickupImage:{ uri:string; type:string; name:string} | null , pickupNotes:string}},{rejectWithValue}) =>{
    try {
      const formData = new FormData();

      if (data.pickupImage) {
        formData.append("pickup_photo", {
          uri: data.pickupImage.uri,
          type: data.pickupImage.type,
          name: data.pickupImage.name,
        } as any);
      }

      formData.append("pickup_notes", String(data.pickupNotes ?? ""));

      const response = await deliveryAPI.pickupOrder(orderId, formData);
      return response.data;
    } catch (error: any) {
      console.error("something went wrong while pickup order", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const outForDelivery = createAsyncThunk(
  'delivery/outForDelivery',
  async ({orderId}:{orderId:string}) => {
    try {
      const response = await deliveryAPI.startDelivery(orderId);
      return response.data;
    } catch (error) {
      console.error("something went wrong while out for delivery" + JSON.stringify(error,null,2));      
    }
  }
);

export const updateDeliveryStatus = createAsyncThunk(
  'delivery/updateDeliveryStatus',
  async ({ orderId, status }: { orderId: string; status: string }) => {
    console.log('🔄 Updating delivery status (DUMMY MODE):', orderId, status);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { orderId, status };

    /* TODO: Uncomment when API is ready
    const response = await deliveryAPI.updateDeliveryStatus(orderId, status);
    return response.data;
    */
  }
);

export const completeDelivery = createAsyncThunk(
  'delivery/completeDelivery',
  async ({orderId,data}:{orderId:string ,data:{deliveryImage:{ uri:string; type:string; name:string; size:string}, customerSignature:string, deliveryNotes:string, cashCollected:string}},{rejectWithValue}) => {
    console.log('🎉 Completing delivery (DUMMY MODE):', orderId);
    try {
      const formData = new FormData();
      if (data.deliveryImage) {
        formData.append("delivery_photo", {
          uri: data.deliveryImage.uri,
          type: data.deliveryImage.type,
          name: data.deliveryImage.name,
        } as any);
      }
      
      formData.append("customer_signature", String(data.customerSignature ?? ""));
      formData.append("delivery_notes", String(data.deliveryNotes ?? ""));
      if (data.cashCollected) {
        formData.append("cash_collected", data.cashCollected);
      }

      console.log('================ complete delivery ====================');
      console.log(formData);
      console.log('====================================');
      const response = await deliveryAPI.completeDelivery(orderId,formData);
      return response.data;
    } catch (error:any) {
      console.error("something went wrong while deliverying order", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'delivery/fetchProfile',
  async()=>{
    console.log("fetch Profile data !");
    const response = await deliveryAPI.getProfile();
    return response.data;
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'delivery/updateNotificationSettings',
  async(settings:any,{rejectWithValue})=>{
    try {
      console.log("update Notification Settings !",JSON.stringify(settings,null,2));
      const response = await deliveryAPI.updateNotificationSettings({
        order_notifications: settings.orderNotifications,
        earning_notifications: settings.earningsNotifications,
        promotional_notifications: settings.promotionalNotifications,
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error:any) {
      // console.error("something went wrong while updating notification settings", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrderNotification = createAsyncThunk(
  'delivery/fetchOrderNotification',
  async()=>{
      console.log("fetch order notification");
      const response = await deliveryAPI.fetchOrderNotification();
      return response.data;
  }
);

export const fetchBankDetails = createAsyncThunk(
  'delivery/fetchBankDetails',
  async()=>{
    console.log("fetch Bank Details !");
    const response = await deliveryAPI.getBankDetails();
    return response.data;
  }
);

export const UpdateBankDetails = createAsyncThunk(
  'delivery/updateBankDetails',
  async({data}:{data:any},{rejectWithValue})=>{
    try {
      const response = await deliveryAPI.updateBankDetails(data);
      return response.data;
    } catch (error:any) {
      // console.error("something went wrong while updating bank details", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }

  }
);

export const fetchEarningsData = createAsyncThunk(
  'delivery/fetchEarningsData',
  async(period:string,{rejectWithValue})=>{
    try {
      const response = await deliveryAPI.getEarningsSummary(period);

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error:any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const requestPayout = createAsyncThunk(
  'delivery/requestPayout',
  async(_, { rejectWithValue }) => {
    try {
      const response = await deliveryAPI.payoutRequest();
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error:any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPayoutHistory = createAsyncThunk(
  'delivery/fetchPayoutHistory',
  async(_, { rejectWithValue }) => {
    try {
      const response = await deliveryAPI.getPayoutHistory();
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    }
    catch (error:any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPerformanceData = createAsyncThunk(
  'delivery/fetchPerformanceData',
  async (period: string, { rejectWithValue }) => {
    try {
      console.log(period);
      const response = await deliveryAPI.getPerformanceReport(period);
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error:any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendFeedback = createAsyncThunk(
  'delivery/sendFeedback',
  async ({data}:{data:any},{rejectWithValue}) =>{
    try {
      const response = await deliveryAPI.sendFeedback(data);
      // console.log('====================================');
      // console.log(JSON.stringify(response.data,null,2));
      // console.log('====================================');
      return response.data;
    } catch (error:any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendRatingAndReviews = createAsyncThunk(
  'delivery/sendRatingsAndReviews',
  async ({data}:{data:any},{rejectWithValue}) => {
    try {
      // console.log('====================================');
      // console.log(JSON.stringify(data,null,2));
      // console.log('====================================');
      const response = await deliveryAPI.sendRatingsAndReview(data);
      // console.log('====================================');
      // console.log(JSON.stringify(response.data,null,2));
      // console.log('====================================');
      return response.data;
    } catch (error:any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSchedule = createAsyncThunk(
  'delivery/fetchSchedule',
  async(_,{rejectWithValue})=>{
    try {
      const response = await deliveryAPI.getSchedule();
      // console.log('====================================');
      // console.log(JSON.stringify(response.data,null,2));
      // console.log('====================================');
      return response.data;
    } catch (error:any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
); 

export const fetchScheduleByDate = createAsyncThunk(
  'delivery/fetchScheduleByDate',
  async(date:string,{rejectWithValue})=>{
    try {
      const response = await deliveryAPI.getScheduleByDate(date);
      // console.log('====================================');
      // console.log(JSON.stringify(response.data,null,2));
      // console.log('====================================');
      return response.data;
    } catch (error:any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
); 

export const updateSchedule = createAsyncThunk(
  'delivery/updateSchedule',
  async({data}:{data:any},{rejectWithValue})=>{
    try {
      console.log('====================================');
      console.log(JSON.stringify(data,null,2));
      console.log('====================================');
      const response = await deliveryAPI.updateSchedule({schedules:data.schedules, remove_ids:data.removeIds});
      // console.log('====================================');
      // console.log(JSON.stringify(response.data,null,2));
      // console.log('====================================');
      return response.data;
    } catch (error:any) {
        return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.currentLocation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // DUMMY: Manual toggles for testing
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      state.isAvailable = action.payload;
    },
    clearNotification:(state) =>{
      state.notification = null;
    },

    // setDummyData: (state) => {
    //   state.todayEarnings = 850;
    //   state.totalDeliveries = 23;
    //   state.acceptanceRate = 95;
    //   state.rating = 4.8;
    //   state.availableOrders = dummyOrders;
    //   state.isOnline = true;
    //   state.isAvailable = true;
    // },
  },
  extraReducers: (builder) => {
    builder
      // fetch profile data
      .addCase(fetchProfile.pending, (state) =>{
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) =>{
        console.log('====================================');
        console.log(JSON.stringify(action.payload.data.delivery_partner,null,2));
        console.log(JSON.stringify(action.payload.data.delivery_partner.notification_preference,null,2));
        console.log('====================================');
        state.profile = action.payload.data;
        state.notificationPreferences = {
          orderNotification: action.payload.data.delivery_partner.notification_preference?.order_notifications,
          earningsNotification: action.payload.data.delivery_partner.notification_preference?.earning_notifications,
          promotionalNotification: action.payload.data.delivery_partner.notification_preference?.promotional_notifications,
        };
      })
      .addCase(fetchProfile.rejected, (state,action) =>{
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile data';
      })

      // fetch bank details data
      .addCase(fetchBankDetails.pending, (state) =>{
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankDetails.fulfilled, (state, action) =>{
        state.bankDetails = action.payload.data;
      })
      .addCase(fetchBankDetails.rejected, (state,action) =>{
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bank details data';
      })

      //fetch earnings data
      .addCase(fetchEarningsData.pending, (state) =>{
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarningsData.fulfilled, (state, action) =>{
        // console.log('================FetchEarningsData====================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        state.todayEarnings = action.payload.data.today.total_earnings;
        state.weekEarnings = action.payload.data.this_week.total_earnings;
        state.monthEarnings = action.payload.data.this_month.total_earnings;
        state.totalEarnings = action.payload.data.total.total_earnings;
        state.pendingPayout = action.payload.data.payouts.pending_amount;
        state.earningsData = {
            baseEarnings: action.payload.data.earnings_data.base_earnings,
            distanceBonus: action.payload.data.earnings_data.distance_bonus,
            timeBonus: action.payload.data.earnings_data.time_bonus,
            tips: action.payload.data.earnings_data.tips,
            chartData: {
              labels: action.payload.data.earnings_data.chart_data.labels,
              datasets: [
                {
                  data: action.payload.data.earnings_data.chart_data.data_sets,
                  strokeWidth: 2,
                },
              ],
            },
        };
        // state.bankDetails = action.payload.data;
      })
      .addCase(fetchEarningsData.rejected, (state,action) =>{
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch earing details data';
      })


      .addCase(fetchOrderNotification.pending, (state)=>{
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderNotification.fulfilled, (state, action) =>{
        // console.log('=============== fetchOrderNotificationdData =====================');
        // console.log(JSON.stringify(action.payload, null, 2));
        // console.log('====================================');
        state.notification = action.payload.notifications;
      })
      .addCase(fetchOrderNotification.rejected, (state,action) =>{
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile data';
      })

      // update bank details 

      .addCase(UpdateBankDetails.pending, (state)=>{
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateBankDetails.fulfilled, (state, action) =>{
        // console.log('====================================');
        // console.log(JSON.stringify(action.payload, null, 2));
        // console.log('====================================');
        state.bankDetails = action.payload.data;
      })
      .addCase(UpdateBankDetails.rejected, (state,action) =>{
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile data';
      })


      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        // console.log('=============== fetchDashboardData =====================');
        // console.log(JSON.stringify(action.payload, null, 2));
        // console.log('====================================');
        const { is_online, is_available, availability_status, status, current_shift, night_shift_bonus } = action.payload.data.partner_status;
        const { total_deliveries, earnings, total_distance, average_rating } = action.payload.data.today_stats;
        const { acceptance_rate } = action.payload.data.performance;
        state.loading = false;
        state.todayEarnings = earnings;
        state.totalDeliveries = total_deliveries;
        state.acceptanceRate = acceptance_rate;
        state.rating = average_rating;
        state.isOnline = is_online;
        state.isAvailable = is_available;
        state.partnerStatus = status;
        state.activeOrder = action.payload.data.active_orders || null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      })
      
      // Toggle availability
      .addCase(toggleAvailability.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.isOnline = action.payload.data.is_available;
        state.isAvailable = action.payload.data.availability_status;
        console.log(action.payload.data);
      })
      .addCase(toggleAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle availability';
      })
      
      // Update location
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload.location;
      })
      
      // Fetch available orders
      .addCase(fetchAvailableOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.availableOrders = action.payload.data;
      })
      .addCase(fetchAvailableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })

      //order details 
      .addCase(fetchOrderDetails.pending,(state) =>{
        state.loading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) =>{
        // console.log('================ fetch Order Details ====================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) =>{
        state.loading = false;
        state.error = action.error.message || 'Failed to accept order';
      })
      
      // Accept order
      .addCase(acceptOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.activeOrder = action.payload.order;
        state.availableOrders = state.availableOrders.filter(
          order => order.id !== action.payload.order.id
        );
        state.isAvailable = false;
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to accept order';
      })
      
      // Reject order
      .addCase(rejectOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        state.availableOrders = state.availableOrders.filter(
          order => order.id !== action.payload.orderId
        );
      })
      .addCase(rejectOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to accept order';
      })

      //pickup order

      .addCase(pickupOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(pickupOrder.fulfilled, (state, action) => {
        // console.log('================ Order Pickup Resonse ====================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        state.loading = false;
      })
      .addCase(pickupOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to Order Pickup Resonse';
      })

      // outForDelivery

      .addCase(outForDelivery.pending, (state) => {
        state.loading = true;
      })
      .addCase(outForDelivery.fulfilled, (state, action) => {
        // console.log('================ out for delivery ====================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        state.loading = false;
      })
      .addCase(outForDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to out for delivery';
      })
      
      // Complete delivery
      .addCase(completeDelivery.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeDelivery.fulfilled, (state, action) => {
        // console.log('================ delivery Completed ====================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        state.loading = false;
        state.activeOrder = null;
        state.isAvailable = true;
        // state.orderHistory.unshift(action.payload.order);
        // Add earnings from completed delivery
        // state.todayEarnings += action.payload.order.deliveryFee || 0;
      })
      .addCase(completeDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to complete delivery';
      })

      //fetch performance data
      .addCase(fetchPerformanceData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceData.fulfilled, (state, action) => {
        console.log('================FetchPerformanceData====================');
        console.log(JSON.stringify(action.payload,null,2));
        console.log('====================================');
        const { period, stats, recent_ratings, badges, improvements } = action.payload.data;
        state.loading = false;
        state.performanceData = {
          period,
          stats,
          recentRatings: recent_ratings,
          badges,
          improvements,
        };
      })
      .addCase(fetchPerformanceData.rejected, (state,action) =>{
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch performance data';
      });

      // fetch payout history
      builder
      .addCase(fetchPayoutHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayoutHistory.fulfilled, (state, action) => {
        console.log('================FetchPayoutHistory====================');
        console.log(JSON.stringify(action.payload,null,2));
        console.log('====================================');
        state.loading = false;
        state.payoutHistory = action.payload.data;
      })
      .addCase(fetchPayoutHistory.rejected, (state,action) =>{
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payout history data';
      });

      builder
      .addCase(sendFeedback.pending,(state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendFeedback.fulfilled,(state, action) => {
        console.log('================sendFeedback====================');
        console.log(JSON.stringify(action.payload,null,2));
        console.log('====================================');
        state.loading = false;
      })
      .addCase(sendFeedback.rejected,(state, action) => {
        state.loading = false;
        //  console.log(JSON.stringify(action.payload,null,2));
        state.error = action.error.message || 'Failed to send feedback';
      });

      builder
      .addCase(sendRatingAndReviews.pending,(state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendRatingAndReviews.fulfilled,(state, action) => {
        console.log('================sendRatingsAndReview====================');
        console.log(JSON.stringify(action.payload,null,2));
        console.log('====================================');
        state.loading = false;
      })
      .addCase(sendRatingAndReviews.rejected,(state, action) => {
        state.loading = false;
         console.log(JSON.stringify(action.payload,null,2));
        state.error = action.error.message || 'Failed to send ratings and review';
      });

      builder
      .addCase(updateSchedule.pending,(state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled,(state, action) => {
        // console.log('================updateSchedule====================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        state.loading = false;
      })
      .addCase(updateSchedule.rejected,(state, action) => {
        state.loading = false;
        console.log("log in slice" + JSON.stringify(action.payload,null,2));
        state.error = action.error.message || 'Failed to update schedule';
      });


      builder
      .addCase(fetchSchedule.pending,(state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled,(state, action) => {
        // console.log('================updateSchedule====================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        state.schedules = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchSchedule.rejected,(state, action) => {
        state.loading = false;
         console.log(JSON.stringify(action.payload,null,2));
        state.error = action.error.message || 'Failed to update schedule';
      });

      builder
      .addCase(fetchScheduleByDate.pending,(state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleByDate.fulfilled,(state, action) => {
        // console.log('================fetchScheduleByDate====================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        state.selectedDateSchedules = action.payload.data.schedules;
        state.loading = false;
      })
      .addCase(fetchScheduleByDate.rejected,(state, action) => {
        state.loading = false;
         console.log(JSON.stringify(action.payload,null,2));
        state.error = action.error.message || 'Failed to update schedule';
      });

  },
});

export const { 
  setCurrentLocation, 
  clearError, 
  setOnlineStatus, 
  clearNotification,
  // setDummyData 
} = deliverySlice.actions;

export default deliverySlice.reducer;