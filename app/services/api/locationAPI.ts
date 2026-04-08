import apiClient from './apiClient';
import { ApiResponse } from './types';

export const locationAPI = {
  // Serviceability
  checkServiceability: (latitude: number, longitude: number, pincode?: string): Promise<ApiResponse<{
    is_serviceable: boolean;
    service_area?: any;
    delivery_charge: number;
    minimum_order_amount: number;
    estimated_delivery_time: number;
  }>> =>
    apiClient.post('/location/check-serviceability', { latitude, longitude, pincode }),

  // Geocoding
  geocodeAddress: (address: string): Promise<ApiResponse<{
    latitude: number;
    longitude: number;
    formatted_address: string;
    place_id: string;
    address_components: any;
  }>> =>
    apiClient.post('/location/geocode', { address }),

  reverseGeocode: (latitude: number, longitude: number): Promise<ApiResponse<{
    formatted_address: string;
    place_id: string;
    address_components: any;
  }>> =>
    apiClient.post('/location/reverse-geocode', { latitude, longitude }),

  // Distance & Routing
  calculateDistance: (origin_lat: number, origin_lng: number, destination_lat: number, destination_lng: number, mode?: string): Promise<ApiResponse<{
    distance_km: number;
    distance_text: string;
    duration_minutes: number;
    duration_text: string;
  }>> =>
    apiClient.post('/location/calculate-distance', { origin_lat, origin_lng, destination_lat, destination_lng, mode }),

  // Service Areas
  getServiceAreas: (): Promise<ApiResponse<{ areas: any[] }>> =>
    apiClient.get('/location/service-areas'),
};

