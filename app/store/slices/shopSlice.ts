import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { shopAPI, ShopDashboardData, ToggleStatusResponse } from '@services/api/shopAPI';
import RNFS from 'react-native-fs';
import { Alert, Platform } from 'react-native';
import { openFile, requestStoragePermission } from '@/components/common/NotificationRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient  from '@/services/api/apiClient';

import Share from 'react-native-share';
// Types
interface ShopState {
  // Dashboard data - matching API response structure
  isActive: boolean;
  shopStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: ShopDashboardData['pendingOrders'];
  completedOrders: number;
  rating: number;
  performance: number;
  stats: ShopDashboardData['stats'];
  shop: ShopDashboardData['shop'] | null;
  canToggleStatus: boolean;
  statusMessage: string;
  autoAcceptOrders: boolean;
  notificationPreference:any;

  // earings data
  totalEarnings:number;
  thisMonthEarnings:number;
  pendingSettlement:number;
  earningsData:any;
  settlements:any;
  
  // Inventory data
  inventory: any[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  currentProduct: any | null; // For single product details
  
  // UI State
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  toggleStatusLoading: boolean;
  
  //bank
  bankDetails:any;
  // Additional states
  refreshing: boolean;

  reports?: any;
}

const initialState: ShopState = {
  // Dashboard data
  isActive: false,
  shopStatus: 'pending',
  todayRevenue: 0,
  totalOrders: 0,
  pendingOrders: [],
  completedOrders: 0,
  rating: 0,
  performance: 0,
  stats: {
    ordersToday: 0,
    avgOrderValue: 0,
    topSellingProduct: 'No sales yet',
  },
  shop: null,
  canToggleStatus: false,
  statusMessage: '',

  autoAcceptOrders: false,
  notificationPreference:null,
  
  // Inventory data
  inventory: [],
  inventoryLoading: false,
  inventoryError: null,
  currentProduct:null,

  //bank
  bankDetails:null,

  // UI State
  loading: false,
  error: null,
  lastUpdated: null,
  toggleStatusLoading: false,
  refreshing: false,

  // Earnings data
  totalEarnings:0,
  thisMonthEarnings:0,
  pendingSettlement:0,
  earningsData:null,
  settlements:null,

  reports: null,
};

// Async Thunks
export const fetchDashboardData = createAsyncThunk(
  'shop/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getDashboardData();
      console.log('shop dashboard data ', response);
      
      // Handle both scenarios: direct API response or axios response object
      const apiResponse = response.data ? response.data : response;
      const success = response.success !== undefined ? response.success : (response.status === 200 || response.statusText === 'OK');
      const data = response.data ? (response.data.data || response.data) : response;
      const message = response.message || 'Data retrieved successfully';
      
      console.log('Processed API response:', { success, data, message });
      
      if (success) {
        return data;
      } else {
        return rejectWithValue(message || 'Failed to fetch dashboard data');
      }
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      
      // Handle different types of errors
      if (error?.status === 401 || error?.response?.status === 401) {
        return rejectWithValue('Authentication failed. Please login again.');
      } else if (error?.status === 404 || error?.response?.status === 404) {
        return rejectWithValue('Shop profile not found. Please contact support.');
      } else if (error?.status >= 500 || error?.response?.status >= 500) {
        return rejectWithValue('Server error. Please try again later.');
      } else if (error?.message) {
        return rejectWithValue(error.message);
      } else if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (!error?.response && !error?.status) {
        return rejectWithValue('Network connection failed. Please check your internet connection.');
      } else {
        return rejectWithValue('Failed to load dashboard data. Please try again.');
      }
    }
  }
);

export const toggleShopStatus = createAsyncThunk(
  'shop/toggleShopStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { shop: ShopState };
      const newStatus = !state.shop.isActive;
      
      const response = await shopAPI.toggleShopStatus(newStatus);
      console.log('toggle status response:', response);
      
      // Handle both scenarios: direct API response or axios response object
      const success = response.success !== undefined ? response.success : (response.status === 200 || response.statusText === 'OK');
      const data = response.data ? (response.data.data || response.data) : response;
      const message = response.message || 'Status updated successfully';
      
      if (success) {
        return data;
      } else {
        return rejectWithValue(message || 'Failed to update shop status');
      }
    } catch (error: any) {
      console.error('Toggle status error:', error);
      
      // Handle specific errors
      if (error?.status === 401 || error?.response?.status === 401) {
        return rejectWithValue('Authentication failed. Please login again.');
      } else if (error?.status === 403 || error?.response?.status === 403) {
        return rejectWithValue('You are not authorized to perform this action.');
      } else if (error?.status === 422 || error?.response?.status === 422) {
        const message = error?.message || error?.response?.data?.message || 'Your shop must be approved before you can change its status.';
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
        return rejectWithValue('Failed to update shop status. Please try again.');
      }
    }
  }
);

// Add inventory thunks
export const fetchInventory = createAsyncThunk(
  'shop/fetchInventory',
  async (params: { 
    search?: string; 
    category?: string; 
    page?: number; 
    limit?: number; 
  } = {}, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getInventory(params);
      console.log('Full inventory response:', response);
      
      // Extract the actual API response from axios response
      const apiData = response.data || response;
      console.log('Inventory API data:', apiData);
      
      if (apiData.success) {
        console.log('Inventory success! Returning:', apiData.data);
        return apiData.data;
      } else {
        console.log('Inventory API returned success=false');
        return rejectWithValue(apiData.message || 'Failed to fetch inventory');
      }
    } catch (error: any) {
      console.error('Inventory fetch error:', error);
      
      if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (!error?.response) {
        return rejectWithValue('Network connection failed. Please check your internet connection.');
      } else {
        return rejectWithValue('Failed to load inventory. Please try again.');
      }
    }
  }
);

export const addProduct = createAsyncThunk(
  'shop/addProduct',
  async (productData: {
    name: string;
    brand: string;
    category: string;
    description?: string;
    price: number;
    mrp?: number;
    stock: number;
    alcoholPercentage?: number;
    volume?: number;
    images?: string[];
    isActive?: boolean;
    lowStockThreshold?: number;
  }, { rejectWithValue }) => {
    try {
      console.log('Dispatching addProduct with data:', productData);
      
      const response = await shopAPI.addProduct(productData);
      console.log('Add product response:', response);
      
      const apiData = response.data || response;
      
      if (apiData.success) {
        return apiData.data;
      } else {
        console.log('API returned success=false:', apiData);
        return rejectWithValue(apiData.message || 'Failed to add product');
      }
    } catch (error: any) {
      console.error('Add product error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      
      if (error?.response?.status === 422) {
        // Validation error - return the full error object for better handling
        return rejectWithValue(error.response.data);
      } else if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (error?.message) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('Failed to add product. Please try again.');
      }
    }
  }
);

export const getInventoryProduct = createAsyncThunk(
  'shop/getInventoryProduct',
  async (productId: string | number, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getInventoryProduct(productId);
      const apiData = response.data || response;
      
      if (apiData.success) {
        return apiData.data;
      } else {
        return rejectWithValue(apiData.message || 'Failed to get product');
      }
    } catch (error: any) {
      console.error('Get product error:', error);
      return rejectWithValue(error?.response?.data?.message || 'Failed to get product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'shop/updateProduct',
  async ({ productId, productData }: {
    productId: string | number;
    productData: {
      name?: string;
      brand?: string;
      category?: string;
      description?: string;
      price?: number;
      stock?: number;
      alcoholPercentage?: number;
      volume?: number;
      images?: string[];
      isActive?: boolean;
      lowStockThreshold?: number;
      notes?: string;
    };
  }, { rejectWithValue }) => {
    try {
      console.log('Updating product:', productId, productData);
      
      const response = await shopAPI.updateProduct(productId, productData);
      const apiData = response.data || response;
      
      if (apiData.success) {
        return { productId, ...apiData.data };
      } else {
        console.log('API returned success=false:', apiData);
        return rejectWithValue(apiData.message || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('Update product error:', error);
      
      if (error?.response?.status === 422) {
        return rejectWithValue(error.response.data);
      } else if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue('Failed to update product. Please try again.');
      }
    }
  }
);
 export const updateProductAvailability = createAsyncThunk(
  'shop/updateProductAvailability',
  async ({ productId, isAvailable }: { 
    productId: string; 
    isAvailable: boolean; 
  }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.updateProductAvailability(productId, isAvailable);
      const apiData = response.data || response;
      
      if (apiData.success) {
        return { productId, isAvailable, message: apiData.data.message };
      } else {
        return rejectWithValue(apiData.message || 'Failed to update product availability');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product availability');
    }
  }
);

export const updateProductStock = createAsyncThunk(
  'shop/updateProductStock',
  async ({ productId, stock }: { 
    productId: string; 
    stock: number; 
  }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.updateProductStock(productId, stock);
      const apiData = response.data || response;
      
      if (apiData.success) {
        return { productId, stock, message: apiData.data.message };
      } else {
        return rejectWithValue(apiData.message || 'Failed to update product stock');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product stock');
    }
  }
);

export const updateProductPrice = createAsyncThunk(
  'shop/updateProductPrice',
  async ({ productId, price }: { 
    productId: string; 
    price: number; 
  }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.updateProductPrice(productId, price);
      const apiData = response.data || response;
      
      if (apiData.success) {
        return { productId, price, message: apiData.data.message };
      } else {
        return rejectWithValue(apiData.message || 'Failed to update product price');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product price');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'shop/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await shopAPI.deleteProduct(productId);
      const apiData = response.data || response;
      
      if (apiData.success) {
        return { productId };
      } else {
        return rejectWithValue(apiData.message || 'Failed to delete product');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
); 
export const fetchPendingOrders = createAsyncThunk('shop/fetchPendingOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getPendingOrders();
      console.log('Full pending orders response:', response);
      
      // Extract the actual API response from axios response
      const apiData = response.data || response;
      console.log('Pending orders API data:', apiData);
      
      if (apiData.success) {
        console.log('Pending orders success! Returning:', apiData.data?.orders || apiData.data || []);
        return apiData.data?.orders || apiData.data || [];
      } else {
        console.log('Pending orders API returned success=false');
        return rejectWithValue(apiData.message || 'Failed to fetch pending orders');
      }
    } catch (error: any) {
      console.error('Pending orders fetch error:', error);
      
      if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (!error?.response) {
        return rejectWithValue('Network connection failed. Please check your internet connection.');
      } else {
        return rejectWithValue('Failed to load pending orders. Please try again.');
      }
    }
  }
);

export const fetchBankDetails = createAsyncThunk(
  'shop/fetchBankDetails',
  async(_, { rejectWithValue })=>{
    console.log("Fetching Shop Bank Details");
    try {
      const response = await shopAPI.fetchBankDetails();
      // console.log('====================================');
      // console.log(JSON.stringify(response,null,2));
      // console.log('====================================');
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error:any) {
      console.error("something went wrong while fetching bank details", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message)
    }
    
  }
);


export const UpdateBankDetails = createAsyncThunk(
  'delivery/updateBankDetails',
  async({data}:{data:any},{rejectWithValue})=>{
    try {
      const response = await shopAPI.updateBankDetails(data);
      // console.log('====================================');
      // console.log(JSON.stringify(response,null,2));
      // console.log('====================================');
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error:any) {
      console.error("something went wrong while updating bank details", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }

  }
);

export const fetchEarningsData = createAsyncThunk(
  'shop/fetchEarningsData',
  async (period:string, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getEarningsData(period);
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error: any) {
      console.error("something went wrong while fetching earnings data", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSettlementsData = createAsyncThunk(
  'shop/fetchSettlementsData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getSettlements();
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      console.log('==================fetchSettlementData==================');
      console.log(JSON.stringify(response.data,null,2));
      console.log('====================================');
      return response.data;
    } catch (error: any) {
      console.error("something went wrong while fetching settlements", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const downloadSettments = createAsyncThunk(
  'shop/downloadSettlements',
  async (_, { rejectWithValue }) => {
    try {
      const hasPermission = await requestStoragePermission();

      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download files');
        return rejectWithValue('Storage permission denied');
      }

      const fileName = `settlement_${Date.now()}.xlsx`;
      
      // Download to cache first (always works)
      const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      console.log('Downloading file to cache:', cachePath);

      // Get download configuration from apiClient
      const downloadConfig = await apiClient.getDownloadConfig('/shop/settlements/download/data');

      console.log('Download URL:', downloadConfig.url);

      const result = await RNFS.downloadFile({
        fromUrl: downloadConfig.url,
        toFile: cachePath,
        headers: downloadConfig.headers,
        background: true,
        discretionary: true,
        progressDivider: 1,
        begin: (res) => {
          console.log('Download started:', res);
        },
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Progress: ${progress.toFixed(2)}%`);
        },
      }).promise;
      
      console.log('==================Download Result==================');
      console.log(JSON.stringify(result, null, 2));
      console.log('====================================');

      if (result.statusCode === 200) {
        const fileExists = await RNFS.exists(cachePath);
        
        if (fileExists) {
          const fileStats = await RNFS.stat(cachePath);
          console.log('File stats:', fileStats);

          // Verify file has content
          if (fileStats.size === 0) {
            Alert.alert('Error', 'Downloaded file is empty');
            await RNFS.unlink(cachePath);
            return rejectWithValue('Downloaded file is empty');
          }

          let savedToDownloads = false;
          
          // Try to copy to external Downloads folder
          if (Platform.OS === 'android') {
            try {
              // Try external storage directory
              const externalDir = RNFS.ExternalDirectoryPath; // This is app-specific and doesn't need permission
              const externalPath = `${externalDir}/${fileName}`;
              
              await RNFS.copyFile(cachePath, externalPath);
              await RNFS.scanFile(externalPath); // Make it visible
              
              console.log('File copied to external storage:', externalPath);
              savedToDownloads = true;
            } catch (copyError) {
              console.log('Could not copy to external storage:', copyError);
            }
          }
          
          // Show alert with options
          Alert.alert(
            'Download Complete',
            savedToDownloads 
              ? `File saved successfully: ${fileName}\n\nYou can also save it to your Downloads folder.`
              : `File downloaded: ${fileName}\n\nWould you like to save it to Downloads?`,
            [
              { text: 'Later', style: 'cancel' },
              { 
                text: 'Save to Downloads', 
                onPress: async () => {
                  try {
                    // Use Share to let user save to Downloads
                    await Share.open({
                      url: `file://${cachePath}`,
                      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      title: 'Save to Downloads',
                      subject: fileName,
                      filename: fileName,
                      saveToFiles: true, // iOS option
                    });
                  } catch (shareError) {
                    console.log('Share cancelled or failed:', shareError);
                  }
                },
                style: 'default'
              },
              { 
                text: 'Open', 
                onPress: () => openFile(cachePath),
                style: 'default'
              }
            ]
          );

          return {
            success: true,
            filePath: cachePath,
            fileName: fileName,
            fileSize: fileStats.size,
            savedToDownloads,
          };
        } else {
          Alert.alert('Error', 'File download completed but file not found');
          return rejectWithValue('File not found after download');
        }
      } else {
        Alert.alert('Error', `Download failed with status: ${result.statusCode}`);
        return rejectWithValue(`Download failed with status: ${result.statusCode}`);
      }
    }
    catch (error: any) {

      console.error("==================Download Error==================");
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      }
      
      if (error.code) {
        console.error('Error Code:', error.code);
      }
      console.error("==================================================");

      let errorMessage = 'Failed to download file. Please try again.';
      
      // Specific error messages
      if (error.message?.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Download timeout. Please try again.';
      } else if (error.message?.includes('EUNSPECIFIED') || error.message?.includes('ENOENT')) {
        errorMessage = 'Download failed. Please check your permissions and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'File not found on server.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      Alert.alert('Download Error', errorMessage);
      return rejectWithValue(error.response?.data || error.message || errorMessage);
    }
  }
);

export const fetchShopReports = createAsyncThunk(
  'shop/fetchShopReports',
  async (params: { period: 'week' | 'month' | 'year' }, { rejectWithValue }) => {
    try {
      // Dummy implementation - replace with actual API call
      console.log("Fetching shop reports for period:", params.period);
      const response = await shopAPI.getShopReports(params.period);

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch shop reports');
    }
  }
);

export const fetchShopNotificationSettings = createAsyncThunk(
  'shop/fetchShopNotificationSettings',
  async (_, { rejectWithValue }) => {
    try {
      // Dummy implementation - replace with actual API call
      const response = await shopAPI.getShopSettings();

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      console.log("Fetching shop notification settings");
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch shop settings');
    }
  }
);

export const updateShopNotificationSettings = createAsyncThunk(
  'shop/updateShopNotificationSettings',
  async (localSettings: any, { rejectWithValue }) => {
    try {
      console.log("Updating shop notification settings:", localSettings);
      const response = await shopAPI.updateShopSettings({
        auto_accept_orders: localSettings.autoAcceptOrders,
        enable_notifications: localSettings.notificationsEnabled,
        sound_notifications: localSettings.soundEnabled,
        vibration_notifications: localSettings.vibrationEnabled,
        order_notifications: localSettings.orderNotifications,
        payment_notifications: localSettings.paymentNotifications
      });
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update shop settings');
    }
  }
);

// Slice
const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    
    updateOrderInList: (state, action: PayloadAction<{ orderId: string; newStatus: string }>) => {
      const { orderId, newStatus } = action.payload;
      state.pendingOrders = state.pendingOrders.filter(order => order.id !== orderId);
      
      // Update counts based on new status
      if (newStatus === 'accepted' || newStatus === 'delivered') {
        state.completedOrders += 1;
        state.totalOrders += 1;
      }
    },
    
    // For real-time updates (WebSocket or SSE)
    addNewOrder: (state, action: PayloadAction<ShopDashboardData['pendingOrders'][0]>) => {
      state.pendingOrders.unshift(action.payload);
      state.totalOrders += 1;
    },
    
    // Reset state (useful for logout)
    resetShopState: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch Dashboard Data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<ShopDashboardData>) => {
        state.loading = false;
        state.refreshing = false;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
        
        console.log('Dashboard data payload:', JSON.stringify(action.payload, null, 2));
        
        // Update all dashboard data with safe fallbacks
        state.isActive = action.payload.isActive ?? false;
        state.shopStatus = action.payload.shopStatus ?? 'pending';
        state.todayRevenue = Number(action.payload.todayRevenue) || 0;
        state.totalOrders = Number(action.payload.totalOrders) || 0;
        state.pendingOrders = action.payload.pendingOrders || [];
        state.completedOrders = Number(action.payload.completedOrders) || 0;

        state.autoAcceptOrders = action.payload.autoAcceptOrders || false;
        state.settines = action.payload.notificationPreference || null;
        
        // Handle rating conversion (API returns string, we need number)
        state.rating = typeof action.payload.rating === 'string' 
          ? parseFloat(action.payload.rating) || 0 
          : Number(action.payload.rating) || 0;
          
        state.performance = Number(action.payload.performance) || 0;
        state.stats = action.payload.stats || {
          ordersToday: 0,
          avgOrderValue: 0,
          topSellingProduct: 'No sales yet',
        };
        state.shop = action.payload.shop || null;
        state.canToggleStatus = action.payload.canToggleStatus ?? false;
        state.statusMessage = action.payload.statusMessage || '';
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string;
        console.error('Dashboard fetch rejected:', action.payload);
      });

    // Toggle Shop Status
    builder
      .addCase(toggleShopStatus.pending, (state) => {
        state.toggleStatusLoading = true;
        state.error = null;
      })
      .addCase(toggleShopStatus.fulfilled, (state, action: PayloadAction<ToggleStatusResponse>) => {
        state.toggleStatusLoading = false;
        state.error = null;
        
        console.log('Toggle status payload:', action.payload);
        
        // Update status based on response
        state.isActive = action.payload.is_active ?? false;
        state.canToggleStatus = action.payload.can_accept_orders ?? true;
        
        // Update shop object if it exists
        if (state.shop) {
          state.shop.is_accepting_orders = action.payload.is_active ?? false;
        }
        
        // Update status message based on current state
        if (state.shopStatus === 'approved') {
          state.statusMessage = state.isActive 
            ? 'Shop is open and accepting orders' 
            : 'Shop is closed - Toggle to start accepting orders';
        }
      })
      .addCase(toggleShopStatus.rejected, (state, action) => {
        state.toggleStatusLoading = false;
        state.error = action.payload as string;
        console.error('Toggle status rejected:', action.payload);
      });

    // Bank Details 
    builder
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
    
      .addCase(UpdateBankDetails.pending, (state)=>{
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateBankDetails.fulfilled, (state, action) =>{
        console.log('====================================');
        console.log(JSON.stringify(action.payload, null, 2));
        console.log('====================================');
        state.bankDetails = action.payload.data;
      })
      .addCase(UpdateBankDetails.rejected, (state,action) =>{
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile data';
      })
    // Fetch Pending Orders
    builder
      .addCase(fetchPendingOrders.pending, (state) => {
        // Don't show loading for this as it's usually called with dashboard
        if (!state.loading) {
          state.error = null;
        }
      })
      .addCase(fetchPendingOrders.fulfilled, (state, action) => {
        console.log('Pending orders payload:', action.payload);
        state.pendingOrders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPendingOrders.rejected, (state, action) => {
        // Only set error if not already loading dashboard
        if (!state.loading) {
          state.error = action.payload as string;
        }
        console.error('Pending orders rejected:', action.payload);
      });

    // Inventory Management
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.inventoryLoading = true;
        state.inventoryError = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = null;
        state.inventory = action.payload.inventory || [];
        console.log('Inventory loaded:', action.payload);
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = action.payload as string;
        console.error('Inventory fetch rejected:', action.payload);
      });

    // Add Product
    builder
      .addCase(addProduct.pending, (state) => {
        state.inventoryLoading = true;
        state.inventoryError = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = null;
        // Optionally add the new product to the inventory array
        console.log('Product added:', action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = action.payload as string;
        console.error('Add product rejected:', action.payload);
      });

    // Get Single Product
    builder
      .addCase(getInventoryProduct.pending, (state) => {
        state.inventoryLoading = true;
        state.inventoryError = null;
      })
      .addCase(getInventoryProduct.fulfilled, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = null;
        state.currentProduct = action.payload;
        console.log('Product retrieved:', action.payload);
      })
      .addCase(getInventoryProduct.rejected, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = action.payload as string;
        console.error('Get product rejected:', action.payload);
      });

    // Update Product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.inventoryLoading = true;
        state.inventoryError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = null;
        
        // Update the product in the inventory list
        const { productId } = action.payload;
        const index = state.inventory.findIndex(item => item.id === productId);
        if (index !== -1) {
          // Refresh the inventory to get updated data
          // The actual product data will be updated when inventory is refetched
        }
        console.log('Product updated:', action.payload);
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = action.payload as string;
        console.error('Update product rejected:', action.payload);
      });
    builder
      .addCase(updateProductAvailability.fulfilled, (state, action) => {
        const { productId, isAvailable } = action.payload;
        const item = state.inventory.find(item => item.id === productId);
        if (item) {
          item.is_available = isAvailable;
        }
        console.log('Product availability updated:', action.payload);
      })
      .addCase(updateProductAvailability.rejected, (state, action) => {
        state.inventoryError = action.payload as string;
        console.error('Update availability rejected:', action.payload);
      });

    // Update Product Stock
    builder
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const { productId, stock } = action.payload;
        const item = state.inventory.find(item => item.id === productId);
        if (item) {
          item.stock = stock;
        }
        console.log('Product stock updated:', action.payload);
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.inventoryError = action.payload as string;
        console.error('Update stock rejected:', action.payload);
      });

    // Update Product Price
    builder
      .addCase(updateProductPrice.fulfilled, (state, action) => {
        const { productId, price } = action.payload;
        const item = state.inventory.find(item => item.id === productId);
        if (item) {
          item.selling_price = price;
        }
        console.log('Product price updated:', action.payload);
      })
      .addCase(updateProductPrice.rejected, (state, action) => {
        state.inventoryError = action.payload as string;
        console.error('Update price rejected:', action.payload);
      });

    // Delete Product
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const { productId } = action.payload;
        state.inventory = state.inventory.filter(item => item.id !== productId);
        console.log('Product deleted:', action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.inventoryError = action.payload as string;
        console.error('Delete product rejected:', action.payload);
      });
    
    builder
      .addCase(fetchEarningsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarningsData.fulfilled, (state, action) => {
        state.loading = false;
        // state.earningsData = action.payload;
        // console.log('Earnings data fetched:', JSON.stringify(action.payload,null,2));
        state.totalEarnings = action.payload.data.total_earnings || 0;
        state.thisMonthEarnings = action.payload.data.this_month_earnings || 0;
        state.pendingSettlement = action.payload.data.pending_settlement || 0;
        state.earningsData = action.payload.data.chart_data || null;
      })
      .addCase(fetchEarningsData.rejected, (state, action) => {
        state.loading = false;
        console.error('fetch earnings data rejected:', action.payload);
      });

    builder
      .addCase(fetchShopNotificationSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopNotificationSettings.fulfilled, (state, action) => {
        state.loading = false;
        // console.log('Shop notification settings fetched:', JSON.stringify(action.payload, null, 2));
        state.autoAcceptOrders = action.payload.data.auto_accept_orders || false;
        state.notificationPreference = action.payload.data.notification_preferences || null;
      })
      .addCase(fetchShopNotificationSettings.rejected, (state, action) => {
        state.loading = false;
        console.error('Fetch shop settings rejected:', action.payload);
      });

    builder
      .addCase(updateShopNotificationSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShopNotificationSettings.fulfilled, (state, action) => {
        state.loading = false;
        // console.log('Shop notification settings updated:', JSON.stringify(action.payload, null, 2));
        state.autoAcceptOrders = action.payload.data.auto_accept_orders || false;
        state.notificationPreference = action.payload.data.notification_preferences || null;
      })
      .addCase(updateShopNotificationSettings.rejected, (state, action) => {
        state.loading = false;
        console.error('Update shop settings rejected:', action.payload);
      });
    
    builder
      .addCase(fetchShopReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopReports.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Shop reports fetched:', JSON.stringify(action.payload, null, 2));
        state.reports = {
          totalOrders: action.payload.data.total_orders || 0,
          totalRevenue: action.payload.data.total_revenue || 0,
          averageOrderValue: action.payload.data.average_order_value || 0,
          customerRatings: action.payload.data.customer_ratings || 0,
          salesData: action.payload.data.sales_data || null,
          topProducts: action.payload.data.top_selling_products || null,
        };
      })
      .addCase(fetchShopReports.rejected, (state, action) => {
        state.loading = false;
        console.error('Fetch shop reports rejected:', action.payload);
      });
    
    builder
    .addCase(fetchSettlementsData.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchSettlementsData.fulfilled, (state, action) => {
      console.log('====================================');
      console.log(JSON.stringify(action.payload,null,2));
      console.log('====================================');

      state.settlements = action.payload.data;
      
    })
    .addCase(fetchSettlementsData.rejected, (state, action) => {
        state.loading = false;
        console.error('Fetch shop reports rejected:', action.payload);
    })
    
  },
});

// Export actions
export const {
  clearError,
  setRefreshing,
  updateOrderInList,
  addNewOrder,
  resetShopState,
} = shopSlice.actions;

// Selectors
export const selectShopData = (state: { shop: ShopState }) => state.shop;
export const selectIsLoading = (state: { shop: ShopState }) => state.shop.loading;
export const selectError = (state: { shop: ShopState }) => state.shop.error;
export const selectShopStatus = (state: { shop: ShopState }) => state.shop.shopStatus;
export const selectCanToggleStatus = (state: { shop: ShopState }) => state.shop.canToggleStatus;
export const selectPendingOrdersCount = (state: { shop: ShopState }) => state.shop.pendingOrders.length;
export const selectToggleStatusLoading = (state: { shop: ShopState }) => state.shop.toggleStatusLoading;

// Thunk selectors (for conditional dispatching)
export const selectShouldRefreshDashboard = (state: { shop: ShopState }) => {
  const { lastUpdated } = state.shop;
  if (!lastUpdated) return true;
  
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(lastUpdated) < fiveMinutesAgo;
};

export default shopSlice.reducer;