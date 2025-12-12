/**
 * Authentication State Management Store (Zustand)
 * Manages authentication flow and token state
 * Handles login, registration, and logout operations
 */

import type { AuthResponse } from '@/lib/api/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authService } from '@/lib/api/auth.service';
import { useUserStore } from './useUserStore';

/**
 * Authentication store state interface
 */
type AuthState = {
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  oauthLogin: (email: string) => Promise<void>;
};

/**
 * Zustand store for authentication operations
 * Coordinates with user store for state management
 */
export const useAuthStore = create<AuthState>()(
  devtools(set => ({
    isLoading: false,
    error: null,

    /**
     * Login user with email and password
     * @param email - User email
     * @param password - User password
     * @throws Error if login fails
     */
    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        console.log('[AuthStore] Starting login process');
        const response: AuthResponse = await authService.login({ email, password });

        // Update user store with login response
        useUserStore.getState().setUser(response.user);

        console.log('[AuthStore] Login successful');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        console.error('[AuthStore] Login error:', message);
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Register new user
     * @param email - User email
     * @param password - User password
     * @param name - User full name
     * @throws Error if registration fails
     */
    register: async (email, password, name) => {
      set({ isLoading: true, error: null });
      try {
        console.log('[AuthStore] Starting registration process');
        const response: AuthResponse = await authService.register({ email, password, name });

        // Update user store with registration response
        useUserStore.getState().setUser(response.user);

        console.log('[AuthStore] Registration successful');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        console.error('[AuthStore] Registration error:', message);
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Logout current user
     */
    logout: async () => {
      set({ isLoading: true, error: null });
      try {
        console.log('[AuthStore] Starting logout process');
        await authService.logout();

        // Clear user from store
        useUserStore.getState().clearUser();

        console.log('[AuthStore] Logout successful');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Logout failed';
        console.error('[AuthStore] Logout error:', message);
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Fetch and update current user from server
     */
    getCurrentUser: async () => {
      set({ isLoading: true, error: null });
      try {
        console.log('[AuthStore] Fetching current user');
        const user = await authService.getCurrentUser();

        // Update user store
        useUserStore.getState().setUser(user);

        console.log('[AuthStore] Current user fetched');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch user';
        console.error('[AuthStore] Get current user error:', message);
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Clears error messages
     */
    clearError: () => {
      set({ error: null });
    },

    /**
     * Added OAuth login method
     * Login via OAuth provider (called after OAuth callback)
     */
    oauthLogin: async (email: string) => {
      set({ isLoading: true, error: null });
      try {
        console.log('[AuthStore] Authenticating via OAuth:', email);
        const user = await authService.getCurrentUser();

        // Update user store with OAuth response
        useUserStore.getState().setUser(user);

        console.log('[AuthStore] OAuth authentication successful');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'OAuth authentication failed';
        console.error('[AuthStore] OAuth authentication error:', message);
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
  })),
);
