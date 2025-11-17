/**
 * API Client Configuration
 * Initializes Axios instance with base URL and interceptors
 */

import axios from 'axios';
import { setupInterceptors } from './interceptor-setup';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Create Axios instance with default configuration
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Initialize interceptors
setupInterceptors(apiClient);

export default apiClient;
