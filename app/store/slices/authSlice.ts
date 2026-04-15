import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api/authAPI'; // Commented out for dummy mode

interface User {
  id: string;
  email: string;
  phone: string;
  userType: 'customer' | 'shop_owner' | 'delivery_partner' | 'admin';
  firstName: string;
  lastName: string;
  isVerified: boolean;
  profile: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userType: string | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  userType: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  isInitialized: false,
};

// DUMMY: Mock user data for testing
const createDummyUser = (userType: string): User => ({
  id: 'dummy-user-123',
  email: 'test@example.com',
  phone: '+919876543210',
  userType: userType as any,
  firstName: 'Test',
  lastName: 'User',
  isVerified: true,
  profile: {
    avatar: null,
    address: null,
  }
});

  const createUserObject = (userData: any): User => ({
    id: userData.id,
    firstName: userData.first_name || userData.firstName,
    lastName:userData.last_name || userData.lastName,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    dateOfBirth:userData.date_of_birth || userData.dateOfBirth,
    isVerified: Boolean(userData.phone_verified_at) || userData.isVerified,
    status: userData.status,
    ageVerificationStatus:userData.age_verification_status || userData.ageVerificationStatus,
    ageVerified: false,
    addresses: userData.addresses || [],
    deviceTokens: userData.device_tokens || '',
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'en',
      currency: 'INR',
    }
  });

// Dummy checkAuthStatus for testing
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Checking authentication status (DUMMY MODE)...');
      
      const [token, user, userType, refreshToken] = await AsyncStorage.multiGet([
        'authToken',
        'user',
        'userType',
        'refreshToken'
      ]);

      const authToken = token[1];
      const userData = user[1];
      const userTypeValue = userType[1];
      const refreshTokenValue = refreshToken[1];

      console.log('📱 Stored auth data:', {
        hasToken: !!authToken,
        hasUser: !!userData,
        hasUserType: !!userTypeValue,
      });

      // If no authentication data found, return unauthenticated state
      if (!authToken || !userData) {
        console.log('❌ No authentication data found - user not logged in');
        return {
          isAuthenticated: false,
          token: null,
          user: null,
          userType: null,
          refreshToken: null,
          isValid: false
        };
      }

      // Parse user data
      let parsedUser;
      try {
        parsedUser = JSON.parse(userData);
      } catch (parseError) {
        console.error('❌ Failed to parse user data:', parseError);
        // Clear corrupted data
        await AsyncStorage.multiRemove(['authToken', 'user', 'userType', 'refreshToken']);
        return rejectWithValue('Invalid user data stored');
      }

      // TODO: Uncomment when API is ready
      try {
        console.log('🔐 Verifying token with backend...');
        const response = await authAPI.verifyToken(authToken);
        if (response.data.data.is_valid) {
          console.log('✅ Token is valid - user authenticated');
          const user = createUserObject(response.data.data.user);
          return {
            isAuthenticated: true,
            token: authToken,
            user: user,
            userType: response.data.data.user.userType || userTypeValue,
            refreshToken: refreshTokenValue,
            isValid: true
          };
        } else {
          console.log('❌ Token is invalid - clearing stored data');
          await AsyncStorage.multiRemove(['authToken', 'user', 'userType', 'refreshToken']);
          return {
            isAuthenticated: false,
            token: null,
            user: null,
            userType: null,
            refreshToken: null,
            isValid: false
          };
        }
      } catch (verificationError) {
        console.log('⚠️ Token verification failed, but keeping local session:', verificationError);
        // If verification fails (network issues), still allow local session
        return {
          isAuthenticated: true,
          token: authToken,
          user: parsedUser,
          userType: parsedUser.userType || userTypeValue,
          refreshToken: refreshTokenValue,
          isValid: true
        };
      }
    } catch (error) {
      console.error('💥 Auth check error:', error);
      return {
        isAuthenticated: false,
        token: null,
        user: null,
        userType: null,
        refreshToken: null,
        isValid: false
      };
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async({token}:{token:string}) =>{
    console.log('🔐 Attempting login With Google');

    const response = authAPI.loginWithGoogle({token});

  }
);

// Dummy login for testing
export const login = createAsyncThunk(
  'auth/login',
  async ({ 
    email, 
    password, 
    userType 
  }: { 
    email: string; 
    password: string; 
    userType: string;
  }) => {
    console.log('🔐 Attempting login (DUMMY MODE) for:', email, 'as:', userType);
    
    // DUMMY: Simulate login success
    const dummyUser = createDummyUser(userType);
    const dummyToken = 'dummy-token-12345';
    const dummyRefreshToken = 'dummy-refresh-token-67890';
    
    const dummyResponse = {
      token: dummyToken,
      refresh_token: dummyRefreshToken,
      user: {
        ...dummyUser,
        user_type: userType,
      }
    };
    
    // Store auth data
    await AsyncStorage.multiSet([
      ['authToken', dummyResponse.token],
      ['refreshToken', dummyResponse.refresh_token],
      ['user', JSON.stringify(dummyResponse.user)],
      ['userType', dummyResponse.user.user_type],
    ]);
    
    console.log('✅ Login successful (DUMMY MODE) for:', dummyResponse.user.email);
    return dummyResponse;

    /* TODO: Uncomment when API is ready
    const response = await authAPI.login({ 
      email, 
      password, 
      user_type: userType 
    });
    
    // Store auth data
    await AsyncStorage.multiSet([
      ['authToken', response.data.token],
      ['refreshToken', response.data.refresh_token],
      ['user', JSON.stringify(response.data.user)],
      ['userType', response.data.user.user_type],
    ]);
    
    console.log('✅ Login successful for:', response.data.user.email);
    return response.data;
    */
  }
);

// Dummy register for testing
export const register = createAsyncThunk(
  'auth/register',
  async ({
    firstName,
    lastName,
    email,
    phone,
    password,
    userType,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    userType: string;
  }) => {
    console.log('📝 Attempting registration (DUMMY MODE) for:', email);
    
    // DUMMY: Simulate registration success
    const dummyUser = {
      ...createDummyUser(userType),
      firstName,
      lastName,
      email,
      phone,
    };
    
    const dummyResponse = {
      user: dummyUser,
      message: 'Registration successful'
    };
    
    console.log('✅ Registration successful (DUMMY MODE) for:', email);
    return dummyResponse;

    /* TODO: Uncomment when API is ready
    const response = await authAPI.register({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
      password_confirmation: password,
      user_type: userType,
    });
    
    return response.data;
    */
  }
);

// Dummy updateUserType for testing
export const updateUserType = createAsyncThunk(
  'auth/updateUserType',
  async (userType: string) => {
    console.log('🔄 Updating user type (DUMMY MODE) to:', userType);
    
    // DUMMY: Simulate successful user type update
    const updatedUser = createDummyUser(userType);
    
    // Update stored user data
    const currentUser = await AsyncStorage.getItem('user');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      userData.userType = userType;
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['userType', userType],
      ]);
    } else {
      // If no current user, create dummy user
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(updatedUser)],
        ['userType', userType],
        ['authToken', 'dummy-token-12345'],
        ['refreshToken', 'dummy-refresh-token-67890'],
      ]);
    }
    
    const dummyResponse = {
      user: {
        ...updatedUser,
        user_type: userType,
      }
    };
    
    console.log('✅ User type updated (DUMMY MODE) to:', userType);
    return dummyResponse;

    /* TODO: Uncomment when API is ready
    const response = await authAPI.updateUserType(userType);
    
    // Update stored user data
    const currentUser = await AsyncStorage.getItem('user');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      userData.userType = userType;
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['userType', userType],
      ]);
    }
    
    return response.data;
    */
  }
);

// Logout (this can work without API)
export const logoutAction = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      // TODO: Uncomment when API is ready
      await authAPI.logout();
      console.log('🚪 Logout API call skipped (DUMMY MODE)');
    } catch (error) {
      console.log('⚠️ Logout API call failed, but continuing with local logout');
    }
    
    // Clear local storage
    await AsyncStorage.multiRemove([
      'authToken',
      'refreshToken',
      'user',
      'userType',
    ]);
    
    console.log('🚪 User logged out successfully');
    return {};
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;

      // console.log('================= inside slice loginSuccess ===================');
      // console.log('Login Success:', JSON.stringify(action.payload.user, null, 2)); 
      // console.log('====================================');
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.userType = null;
      state.refreshToken = null;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setUserType: (state, action: PayloadAction<string>) => {
      state.userType = action.payload;
      console.log('📋 User type set in state:', action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      console.log('================= inside slice setUser ===================');
      console.log('Login Success:', JSON.stringify(action.payload, null, 2)); 
      console.log('====================================');
      state.user = createUserObject(action.payload);
    },
    resetAuthState: (state) => {
      Object.assign(state, initialState);
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    // DUMMY: Force authentication for testing
    setDummyAuth: (state, action: PayloadAction<{ userType: string }>) => {
      const dummyUser = createDummyUser(action.payload.userType);
      state.isAuthenticated = true;
      state.user = dummyUser;
      state.userType = action.payload.userType;
      state.token = 'dummy-token-12345';
      state.refreshToken = 'dummy-refresh-token-67890';
      state.isInitialized = true;
      console.log('🎭 Dummy auth set for testing:', action.payload.userType);
    },
  },
  extraReducers: (builder) => {
    builder
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.isInitialized = false;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        
        if (action.payload.isAuthenticated) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.userType = action.payload.userType;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.userType = null;
          state.token = null;
          state.refreshToken = null;
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.userType = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string || 'Authentication check failed';
      })

      //login with google
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        console.log('============== Login With Google Response ======================');
        console.log(action.payload);
        console.log('====================================');
        // state.loading = false;
        // state.isAuthenticated = true;
        // state.user = action.payload.user;
        // state.userType = action.payload.user.user_type;
        // state.token = action.payload.token;
        // state.refreshToken = action.payload.refresh_token;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })

      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userType = action.payload.user.user_type;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // Registration successful, but user might need verification
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      
      // Update user type
      .addCase(updateUserType.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserType.fulfilled, (state, action) => {
        state.loading = false;
        state.userType = action.payload.user.user_type;
        if (state.user) {
          state.user.userType = action.payload.user.user_type;
        }
        // Set authenticated to true after successful user type selection
        state.isAuthenticated = true;
      })
      .addCase(updateUserType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user type';
      })
      
      // Logout
      .addCase(logoutAction.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.userType = null;
        state.token = null;
        state.refreshToken = null;
        state.isInitialized = true;
        state.error = null;
      });
  },
});

export const { 
  loginStart,
  loginSuccess, 
  loginFailure,
  logout,
  updateUser,
  setUserType, 
  clearError, 
  setUser, 
  resetAuthState,
  setAuthenticated,
  setDummyAuth // DUMMY: For testing
} = authSlice.actions;

export default authSlice.reducer; 