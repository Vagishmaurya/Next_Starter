/**
 * App State Management Store (Zustand)
 * Manages global application state
 * Note: Theme is now managed by next-themes for better SSR support
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * App store state interface
 */
type AppState = {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
};

/**
 * Zustand store for app state management
 * Provides loading state management for async operations
 */
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        isLoading: false,

        /**
         * Sets loading state for async operations
         * @param loading - Loading state
         */
        setLoading: (loading) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'app-store',
      }
    )
  )
);
