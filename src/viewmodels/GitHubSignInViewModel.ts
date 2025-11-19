/**
 * GitHub Sign-In ViewModel
 * Follows MVVM (Model-View-ViewModel) Pattern
 * 
 * Responsibilities:
 * - Manages GitHub OAuth sign-in state
 * - Handles loading, error, and success states
 * - Delegates OAuth flow to service layer
 * - Provides reusable state across components
 * 
 * Flow:
 * 1. Component calls initiateGithubSignIn()
 * 2. ViewModel sets loading state
 * 3. ViewModel calls oauthService.initiateGithubOAuth()
 * 4. Service redirects to backend /api/auth/github
 * 5. Backend handles GitHub OAuth protocol
 * 6. Backend redirects to /auth/callback with JWT token
 * 7. Frontend stores JWT and updates user state
 */

'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { oauthService } from '@/lib/api/oauth.service';

/**
 * ViewModel State Interface
 */
interface GitHubSignInViewModelState {
  // State properties
  isLoading: boolean;
  error: string | null;
  isInitiating: boolean;

  // Actions
  initiateGithubSignIn: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

/**
 * GitHub Sign-In ViewModel
 * Zustand store for managing GitHub OAuth state
 * 
 * @example
 * const { initiateGithubSignIn, isLoading, error, clearError } = useGitHubSignInViewModel();
 * 
 * const handleClick = async () => {
 *   clearError();
 *   await initiateGithubSignIn();
 * };
 */
export const useGitHubSignInViewModel = create<GitHubSignInViewModelState>()(
  devtools((set) => ({
    // Initial state
    isLoading: false,
    error: null,
    isInitiating: false,

    /**
     * Initiates GitHub OAuth sign-in flow
     * 
     * State Management:
     * 1. Sets isLoading = true, error = null, isInitiating = true
     * 2. Calls service layer method
     * 3. If error occurs, updates error state
     * 4. Sets isLoading = false
     * 
     * Note: User will be redirected by backend, so try/catch will handle
     * any errors that occur before redirection
     * 
     * @throws Throws error which is caught and stored in state
     */
    initiateGithubSignIn: async () => {
      set({ isLoading: true, error: null, isInitiating: true });
      try {
        console.log('[GitHubSignInViewModel] Starting GitHub OAuth flow');

        // Delegate to service layer
        // Service calls GET /api/auth/github on backend
        await oauthService.initiateGithubOAuth();

        // Note: Following code typically won't execute due to window.location.href redirect
        // But we keep it for consistency in error scenarios
        console.log('[GitHubSignInViewModel] GitHub OAuth initiated successfully');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to initiate GitHub sign-in';

        console.error('[GitHubSignInViewModel] Error:', errorMessage);
        set({ error: errorMessage, isLoading: false, isInitiating: false });
      }
    },

    /**
     * Clears error message from state
     */
    clearError: () => {
      console.log('[GitHubSignInViewModel] Clearing error');
      set({ error: null });
    },

    /**
     * Resets ViewModel to initial state
     */
    resetState: () => {
      console.log('[GitHubSignInViewModel] Resetting state');
      set({
        isLoading: false,
        error: null,
        isInitiating: false,
      });
    },
  }))
);
