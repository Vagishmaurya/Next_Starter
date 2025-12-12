/**
 * Organizations ViewModel
 * Follows MVVM (Model-View-ViewModel) Pattern
 *
 * Responsibilities:
 * - Manages organizations state and data fetching
 * - Handles loading, error, and success states
 * - Delegates API calls to service layer
 * - Provides reusable state across components
 *
 * Flow:
 * 1. Component calls fetchOrganizations()
 * 2. ViewModel sets loading state
 * 3. ViewModel calls organizationsService.fetchUserOrganizations()
 * 4. Service makes API request to /api/auth/organizations
 * 5. ViewModel updates state with fetched organizations
 */

'use client';

import type { Organization } from '@/lib/api/organizations.service';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { organizationsService } from '@/lib/api/organizations.service';

/**
 * ViewModel State Interface
 */
type OrganizationsViewModelState = {
  // State properties
  organizations: Organization[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  fetchOrganizations: () => Promise<Organization[]>;
  clearError: () => void;
  resetState: () => void;
};

/**
 * Organizations ViewModel
 * Zustand store for managing organizations state
 *
 * @example
 * const { fetchOrganizations, organizations, isLoading, error } = useOrganizationsViewModel();
 *
 * useEffect(() => {
 *   fetchOrganizations();
 * }, []);
 */
export const useOrganizationsViewModel = create<OrganizationsViewModelState>()(
  devtools(set => ({
    // Initial state
    organizations: [],
    isLoading: false,
    error: null,
    isInitialized: false,

    /**
     * Fetches user organizations from API
     *
     * State Management:
     * 1. Sets isLoading = true, error = null
     * 2. Calls service layer method
     * 3. Updates organizations state with fetched data
     * 4. Sets isInitialized = true
     * 5. If error occurs, updates error state
     * 6. Sets isLoading = false
     *
     * @returns Array of organizations
     * @throws Throws error which is caught and stored in state
     */
    fetchOrganizations: async () => {
      set({ isLoading: true, error: null });
      try {
        console.log('[OrganizationsViewModel] Fetching organizations');

        const orgs = await organizationsService.fetchUserOrganizations();

        console.log('[OrganizationsViewModel] Organizations fetched successfully:', orgs);
        set({
          organizations: orgs,
          isInitialized: true,
          error: null,
        });

        return orgs;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch organizations';
        console.error('[OrganizationsViewModel] Error:', errorMessage);
        set({
          error: errorMessage,
          organizations: [],
        });
        throw err;
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Clears error state
     */
    clearError: () => {
      set({ error: null });
    },

    /**
     * Resets all state to initial values
     */
    resetState: () => {
      set({
        organizations: [],
        isLoading: false,
        error: null,
        isInitialized: false,
      });
    },
  })),
);
