import { AxiosError } from 'axios';
import { Alert } from 'react-native';
import { ApiError } from './types';

export class APIError extends Error {
  public status: number;
  public data: ApiError;

  constructor(error: AxiosError<ApiError>) {
    super(error.response?.data?.message || error.message);
    this.status = error.response?.status || 500;
    this.data = error.response?.data || {
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

export const handleAPIError = (error: any): APIError => {
  if (error.response) {
    // Server responded with error status
    return new APIError(error);
  } else if (error.request) {
    // Request was made but no response received
    return new APIError({
      message: 'Network error. Please check your internet connection.',
      response: {
        status: 0,
        data: {
          success: false,
          message: 'Network error. Please check your internet connection.',
          timestamp: new Date().toISOString(),
        },
      },
    } as any);
  } else {
    // Something else happened
    return new APIError({
      message: error.message || 'An unexpected error occurred',
      response: {
        status: 500,
        data: {
          success: false,
          message: error.message || 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        },
      },
    } as any);
  }
};

export const showAPIError = (error: APIError): void => {
  Alert.alert(
    'Error',
    error.data.message || 'Something went wrong. Please try again.',
    [{ text: 'OK' }]
  );
};