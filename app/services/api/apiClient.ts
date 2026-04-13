import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { executeLogout } from '../../config/logout';
class ApiClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = __DEV__ 
      ? 'http://192.168.1.4:8000/api/v1' // Development
      : 'https://beergo.in/beergo-backup/public/api/v1'; // Production 
    // this.baseURL = 'https://beergo.in/beergo-backup/public/api/v1'; // Production

    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add user type header if available
        const userType = await AsyncStorage.getItem('userType');
        if (userType) {
          config.headers['X-User-Type'] = userType;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${token} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error('API Error:', error.response?.data || error.message);

        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.handleTokenExpiration();
        } else if (error.response?.status === 403) {
          Alert.alert('Access Denied', 'You do not have permission to perform this action.');
        } else if (error.response?.status >= 500) {
          Alert.alert('Server Error', 'Something went wrong. Please try again later.');
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleTokenExpiration(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await this.instance.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { token, refresh_token } = response.data.data;
        await AsyncStorage.multiSet([
          ['authToken', token],
          ['refreshToken', refresh_token],
        ]);
      } else {
        await this.logout();
      }
    } catch (error) {
      await this.logout();
    }
  }

  private async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user', 'userType']);
    Alert.alert('Session Expired', 'Please login again to continue.');
    executeLogout();
    // Navigation will be handled by the auth state change
  }

  // HTTP Methods
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }

  // File Upload
  public uploadFile<T = any>(url: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<AxiosResponse<T>> {
    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  /**
   * Get the full URL for an endpoint
   * @param endpoint - The API endpoint (e.g., '/shop/settlements/download/data')
   * @returns Full URL string
   */
  public getUrl(endpoint: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  /**
   * Get the base URL
   * @returns Base URL string
   */
  public getBaseUrl(): string {
    return this.baseURL;
  }

  /**
   * Get authorization headers for external requests (like file downloads)
   * @returns Object with authorization headers
   */
  public async getAuthHeaders(): Promise<{ Authorization?: string; 'X-User-Type'?: string }> {
    const headers: { Authorization?: string; 'X-User-Type'?: string } = {};
    
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const userType = await AsyncStorage.getItem('userType');
    if (userType) {
      headers['X-User-Type'] = userType;
    }

    return headers;
  }

    /**
   * Get download config for RNFS
   * Returns the full URL and headers needed for RNFS.downloadFile
   */
  public async getDownloadConfig(endpoint: string): Promise<{
    url: string;
    headers: { Authorization?: string; 'X-User-Type'?: string; Accept: string };
  }> {
    const url = this.getUrl(endpoint);
    const authHeaders = await this.getAuthHeaders();

    return {
      url,
      headers: {
        ...authHeaders,
        Accept: '*/*',
      },
    };
  }

}

const apiClient = new ApiClient();
export default apiClient;