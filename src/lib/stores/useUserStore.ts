/**
 * User State Management Store (Zustand)
 * Manages user authentication state and user profile data
 * Persists user role information for role-based access control
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserRole } from '@/lib/api/types';

/**
 * User interface matching backend structure
 */
type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

/**
 * User store state interface
 */
type UserState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
};

/**
 * Zustand store for user state management
 * Persists user data to localStorage for session persistence
 */
export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,

        /**
         * Sets user data and updates authentication state
         * @param user - User object or null to clear user
         */
        setUser: (user) => {
          set({
            user,
            isAuthenticated: user !== null,
          });
          console.log('[UserStore] User updated:', user?.id);
        },

        /**
         * Clears user data and resets authentication state
         */
        clearUser: () => {
          set({
            user: null,
            isAuthenticated: false,
          });
          console.log('[UserStore] User cleared');
        },

        /**
         * Sets loading state for async operations
         * @param loading - Loading state
         */
        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        /**
         * Checks if current user has a specific role
         * @param role - Single role or array of roles to check
         * @returns true if user has at least one of the specified roles
         */
        hasRole: (role) => {
          const { user } = get();
          if (!user) {
            return false;
          }

          if (Array.isArray(role)) {
            return role.includes(user.role);
          }
          return user.role === role;
        },

        /**
         * Checks if user has required permissions based on roles
         * Useful for feature flags and access control
         * @param requiredRoles - Array of roles that grant permission
         * @returns true if user has at least one required role
         */
        hasPermission: (requiredRoles) => {
          const { user } = get();
          if (!user) {
            return false;
          }

          // Admin can access everything
          if (user.role === UserRole.ADMIN) {
            return true;
          }

          return requiredRoles.includes(user.role);
        },
      }),
      {
        name: 'user-store',
      },
    ),
  ),
);
