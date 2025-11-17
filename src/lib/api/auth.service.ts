/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Manages user login, registration, logout, and token refresh
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { AuthResponse, User } from './types';
import { setStoredTokens, clearTokens } from './token-manager';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

/**
 * Authentication Service Object
 * Provides methods for authentication operations
 */
export const authService = {
  /**
   * Login user with email and password
   * Stores tokens in localStorage upon successful login
   * 
   * @param payload - Login credentials (email and password)
   * @returns User data and tokens
   * @throws Error if login fails
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Logging in user:', payload.email);
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        payload
      );

      if (response.data.tokens) {
        const { accessToken, refreshToken } = response.data.tokens;
        setStoredTokens(accessToken, refreshToken);
        console.log('[AuthService] Login successful');
      }

      return response.data;
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  },

  /**
   * Register new user with email, password, and name
   * Stores tokens in localStorage upon successful registration
   * 
   * @param payload - Registration data (email, password, name)
   * @returns User data and tokens
   * @throws Error if registration fails
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Registering new user:', payload.email);
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        payload
      );

      if (response.data.tokens) {
        const { accessToken, refreshToken } = response.data.tokens;
        setStoredTokens(accessToken, refreshToken);
        console.log('[AuthService] Registration successful');
      }

      return response.data;
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  },

  /**
   * Fetch current authenticated user profile
   * Requires valid access token in request
   * 
   * @returns Current user data
   * @throws Error if request fails or user is not authenticated
   */
  async getCurrentUser(): Promise<User> {
    try {
      console.log('[AuthService] Fetching current user profile');
      const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
      console.log('[AuthService] User profile fetched successfully');
      return response.data;
    } catch (error) {
      console.error('[AuthService] Failed to fetch user profile:', error);
      throw error;
    }
  },

  /**
   * Logout current user
   * Clears tokens from localStorage and notifies backend
   * 
   * @returns void
   * @throws Error if logout request fails
   */
  async logout(): Promise<void> {
    try {
      console.log('[AuthService] Logging out user');
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      clearTokens();
      console.log('[AuthService] Logout successful');
    } catch (error) {
      console.error('[AuthService] Logout failed:', error);
      // Clear tokens even if logout request fails
      clearTokens();
      throw error;
    }
  },

  /**
   * Refresh authentication token using refresh token
   * Called automatically by interceptor when access token expires
   * 
   * @returns New tokens and user data
   * @throws Error if refresh fails
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Refreshing authentication token');
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REFRESH
      );

      if (response.data.tokens) {
        const { accessToken, refreshToken } = response.data.tokens;
        setStoredTokens(accessToken, refreshToken);
        console.log('[AuthService] Token refreshed successfully');
      }

      return response.data;
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error);
      clearTokens();
      throw error;
    }
  },
};
