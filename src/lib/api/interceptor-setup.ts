/**
 * Axios Interceptor Setup
 * Handles request/response interceptors with token refresh logic
 * Implements automatic retry on 401 with token refresh
 */

import { AxiosInstance, AxiosError } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setStoredTokens,
  clearTokens,
  isTokenExpired,
} from './token-manager';

/** Flag to prevent multiple concurrent token refresh requests */
let isRefreshing = false;

/** Queue of requests waiting for token refresh */
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Subscribes to token refresh completion
 * @param callback - Function to call when token is refreshed
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * Notifies all subscribers that token has been refreshed
 * @param token - New access token
 */
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Attempts to refresh the access token using refresh token
 * @param apiClient - Axios instance to use for refresh request
 * @returns New access token or null if refresh fails
 */
const refreshAccessToken = async (apiClient: AxiosInstance): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.warn('[Interceptor] No refresh token available');
    return null;
  }

  try {
    console.log('[Interceptor] Attempting to refresh token');
    
    const response = await apiClient.post(
      '/auth/refresh',
      { refreshToken },
      { skipInterceptor: true } as any
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.tokens;
    setStoredTokens(newAccessToken, newRefreshToken);
    
    console.log('[Interceptor] Token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    console.error('[Interceptor] Token refresh failed:', error);
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
    return null;
  }
};

/**
 * Sets up request interceptor to attach access token to headers
 * @param apiClient - Axios instance to attach interceptor to
 */
export const setupRequestInterceptor = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use(
    (config) => {
      // Skip token attachment for refresh endpoint
      if (config.url?.includes('/auth/refresh')) {
        return config;
      }

      const accessToken = getAccessToken();
      
      if (accessToken) {
        // Check if token is about to expire
        if (isTokenExpired(accessToken)) {
          console.log('[Interceptor] Access token expired, will attempt refresh');
        }
        
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => {
      console.error('[Interceptor] Request error:', error);
      return Promise.reject(error);
    }
  );
};

/**
 * Sets up response interceptor to handle 401 errors with token refresh
 * @param apiClient - Axios instance to attach interceptor to
 */
export const setupResponseInterceptor = (apiClient: AxiosInstance) => {
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Handle 401 Unauthorized response
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Prevent infinite loop
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const newAccessToken = await refreshAccessToken(apiClient);
            
            if (newAccessToken) {
              isRefreshing = false;
              onRefreshed(newAccessToken);

              // Retry all queued requests with new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            isRefreshing = false;
            console.error('[Interceptor] Refresh token error:', refreshError);
            return Promise.reject(refreshError);
          }
        }

        // Queue request while token is being refreshed
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      // Handle 403 Forbidden (insufficient permissions)
      if (error.response?.status === 403) {
        console.warn('[Interceptor] Access forbidden - insufficient permissions');
      }

      // Handle 401 Unauthorized after all retries exhausted
      if (error.response?.status === 401) {
        console.error('[Interceptor] Authentication failed after refresh');
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Initializes all interceptors for the API client
 * @param apiClient - Axios instance to initialize interceptors for
 */
export const setupInterceptors = (apiClient: AxiosInstance) => {
  console.log('[Interceptor] Setting up API interceptors');
  setupRequestInterceptor(apiClient);
  setupResponseInterceptor(apiClient);
};
