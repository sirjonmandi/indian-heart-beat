import apiClient from './apiClient';
import { ApiResponse } from './types';

export const uploadAPI = {
  // Single File Upload
  uploadFile: (file: FormData, type: string): Promise<ApiResponse<{ url: string; file_id: string }>> =>
    apiClient.uploadFile(`/upload/${type}`, file),

  // Multiple Files Upload
  uploadMultipleFiles: (files: FormData, type: string): Promise<ApiResponse<{ urls: string[]; file_ids: string[] }>> =>
    apiClient.uploadFile(`/upload/${type}/multiple`, files),

  // Image Upload with Compression
  uploadImage: (file: FormData, options?: { quality?: number; width?: number; height?: number }): Promise<ApiResponse<{
    url: string;
    thumbnail_url: string;
    file_id: string;
  }>> =>
    apiClient.uploadFile('/upload/image', file, undefined),

  // Document Upload (for verification)
  uploadDocument: (file: FormData, document_type: string): Promise<ApiResponse<{
    url: string;
    file_id: string;
    verification_status: string;
  }>> =>
    apiClient.uploadFile('/upload/document', file),

  // Delete File
  deleteFile: (file_id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/upload/${file_id}`),
};
