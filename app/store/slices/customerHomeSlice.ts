// src/store/slices/homeSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customerAPI } from '@/services/api/customerAPI'; 
import { Category } from '../../../components/customer/CategoryGrid';
// Define state shape
interface Store {
  id: number;
  name: string;
  rating: string;
  deliveryTime: string; 
  location: string; 
  logo: boolean;
  productImage: string | null;
  is_active?: boolean;
}
interface HomeState {
  categories:Category[];
  addresses:any[];
  shops:Store[];
  brands:any;
  carousel:{ id:string, image:{uri:string}, title:string, subtitle:string}[] | null;
  defaultAddress:{type:'Set' , addressLine1:'Your Location'};
  loading: boolean;
  error: string | null;
  data: any | null;
  newArrivals:any;
}

// Initial state
const initialState: HomeState = {
    categories:[],
    addresses :[],
    shops: [],
    carousel:null,
    defaultAddress:{ type:'Set' , addressLine1:"Your Location"},
    loading: false,
    error: null,
    data: null,
    newArrivals:null,
};

// Async thunk for fetching homepage info
export const getHomePageInfo = createAsyncThunk(
  'home/getHomePageInfo',
  async (_, { rejectWithValue }) => {
    try {
      const addressResponse = await getAddress();

      if (!addressResponse || typeof addressResponse === 'string') {
        return rejectWithValue(addressResponse || 'Unable to fetch address');
      }

      const homeDataResponse = await getHomeData();

      if (!homeDataResponse || typeof homeDataResponse === 'string') {
        return rejectWithValue(homeDataResponse || 'Unable to fetch home data');
      }
      return { addresses: addressResponse, shops: homeDataResponse };

    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error.message || 'Something went wrong'
      );
    }
  }
);


export const setDefaultAddress = createAsyncThunk(
  'home/setDefaultAddress',
  async(id:string,{ rejectWithValue }) =>{
      try {
          const response:{success, message, data}  = await customerAPI.setDefaultAddress(id);
          const {success,data} = response.data;
          if (!success) {
            return rejectWithValue("Failed to changes dafault address");
          }
          return 
      } catch (error) {

      }
  }
)


export const verifyAge = createAsyncThunk(
  'home/verifyAge',
  async(_,{rejectWithValue}) => {
    
  }
);

const getAddress = async() =>{
    const response:{success,message,data} = await customerAPI.getAddresses();
    const { success, message, data} = response.data;
    if (success) {
        let returnData = { 
            defaultAddress : data.find((item:any) => item.isDefault === 1),
            addresses : data
        };
        return returnData;
    }
    return message || "unable to fetch address";
}

const getHomeData = async() =>{

  const response:{success:boolean,message:string,data:any} = await customerAPI.getHomeData();
  // console.log('====================================');
  // console.log('Home Data Response:', JSON.stringify(response.data.data, null, 2));
  // console.log('====================================');

  if (response.data.success) {
      return response.data.data;
  }
  
  return response.data.message || "unable to fetch home data";
};
// Slice
const CustomerHomeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    resetHome: (state) => {
      state.loading = false;
      state.error = null;
      state.data = null;
    },
    resetDefaultAddress:(state)=>{
      state.defaultAddress = {type:'Set' , addressLine1:'Your Location'};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHomePageInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHomePageInfo.fulfilled, (state, action: PayloadAction<any>) => {
        // console.log('============== shops ======================');
        // console.log(JSON.stringify(action.payload,null,2));
        // console.log('====================================');
        const {defaultAddress, addresses} = action.payload.addresses;
        const {categories, stores, brands, carousel, newarrivals} = action.payload.shops;
        if (addresses) {
          // console.log('====================================');
          // console.log("address");
          // console.log('====================================');
          state.addresses = addresses;
        }
        if (defaultAddress) {
          // console.log('====================================');
          // console.log("default address");
          // console.log('====================================');
          state.defaultAddress = defaultAddress;
        }else{
          state.defaultAddress = {type:'Set' , addressLine1:'Your Location'};;
        }
        state.categories = categories;
        state.brands = brands;
        state.carousel = carousel;
        state.newArrivals = newarrivals.data;
        state.loading = false;
        // state.data = action.payload;
      })
      .addCase(getHomePageInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { resetHome, resetDefaultAddress } = CustomerHomeSlice.actions;

// Selector
export const selectHome = (state: RootState) => state.home;

// Export reducer
export default CustomerHomeSlice.reducer;
