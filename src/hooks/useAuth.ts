/**
 * Authentication Hook
 * Provides convenient access to authentication state and actions
 * Wraps useAuthStore and useUserStore for simplified API
 */

'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useUserStore } from '@/lib/stores/useUserStore';

/**
 * useAuth Hook
 * Provides authentication state and methods for login, logout, register, and permission checking
 *
 * @returns Object containing authentication state and methods
 *
 * @example
 * const { user, isAuthenticated, login, logout, hasPermission } = useAuth();
 *
 * if (hasPermission([UserRole.ADMIN])) {
 *   // Render admin-only content
 * }
 */
export const useAuth = () => {
  // Get auth state and actions
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const getCurrentUser = useAuthStore((state) => state.getCurrentUser);
  const clearError = useAuthStore((state) => state.clearError);

  // Get user state
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasRole = useUserStore((state) => state.hasRole);
  const hasPermission = useUserStore((state) => state.hasPermission);

  /**
   * Safely logout user
   * Handles logout API call and clears local state
   */
  const logoutSafely = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout]);

  return {
    // User state
    user,
    isAuthenticated,
    isLoading,
    error,

    // Auth actions
    login,
    register,
    logout: logoutSafely,
    getCurrentUser,
    clearError,

    // Permission checking
    hasRole,
    hasPermission,
  };
};
