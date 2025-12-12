/**
 * OAuth Callback Page
 * Route: /auth/callback
 *
 * Handles the OAuth redirect from Go backend after successful GitHub authentication
 *
 * Backend Flow:
 * 1. User completes GitHub authentication on backend
 * 2. Backend exchanges authorization code for GitHub access token
 * 3. Backend fetches user data from GitHub API
 * 4. Backend generates JWT token (no DB save)
 * 5. Backend redirects to frontend /auth/callback with JWT in query param
 *
 * Frontend Flow:
 * 1. This page receives the JWT token
 * 2. Extracts and stores JWT in localStorage
 * 3. Updates user state (Zustand store)
 * 4. Redirects to dashboard
 * 5. All subsequent API calls include JWT in Authorization header
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setStoredTokens } from '@/lib/api/token-manager';
import { useUserStore } from '@/lib/stores/useUserStore';

/**
 * CallbackPage Component
 *
 * Responsibilities:
 * 1. Extract JWT token from URL query parameters
 * 2. Extract user data from URL query parameters
 * 3. Store JWT tokens in localStorage
 * 4. Update Zustand user store with user data
 * 5. Redirect to dashboard
 *
 * Error Handling:
 * - Missing token: Show error and link back to sign-in
 * - Invalid token: Show error message
 * - API errors: Display specific error details
 */
export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setUser = useUserStore((state: any) => state.setUser);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('[CallbackPage] Processing OAuth callback');
        setIsProcessing(true);
        setError(null);

        /**
         * Backend redirects to /auth/callback with following query params:
         * - token: JWT access token (required)
         * - refreshToken: JWT refresh token (optional)
         * - user: JSON encoded user data (optional)
         * - error: Error code if auth failed
         * - error_description: Error message if auth failed
         *
         * Example URL:
         * /auth/callback?token=eyJhbGciOiJIUzI1NiIs...&user={"id":"123","email":"user@example.com"}
         */

        // Extract query parameters
        const jwtToken = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle authorization errors from backend
        if (error) {
          const message = errorDescription || 'Authentication failed on backend';
          console.error('[CallbackPage] Backend error:', { error, error_description: errorDescription });
          setError(message);
          setIsProcessing(false);
          return;
        }

        // Validate JWT token presence
        if (!jwtToken) {
          console.error('[CallbackPage] No JWT token received from backend');
          setError('No authentication token received. Please try again.');
          setIsProcessing(false);
          return;
        }

        console.log(`[CallbackPage] JWT token received (length: ${jwtToken.length})`);

        /**
         * Store JWT Tokens
         * - accessToken: Used for Authorization header in API requests
         * - refreshToken: Used to obtain new access token when expired
         */
        const finalRefreshToken = refreshToken || jwtToken; // Use same token if no refresh token provided
        setStoredTokens(jwtToken, finalRefreshToken);
        console.log('[CallbackPage] Tokens stored in localStorage');

        /**
         * Parse and Store User Data
         * Backend sends user data as JSON string in query parameter
         * Example: user={"id":"123","email":"user@github.com","name":"John Doe"}
         */
        if (userParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            console.log('[CallbackPage] User data parsed:', userData);

            // Update Zustand user store
            setUser(userData);
            console.log('[CallbackPage] User data updated in store');
          } catch (parseError) {
            console.warn('[CallbackPage] Failed to parse user data from query param:', parseError);
            // Continue anyway - user data will be fetched on next request
          }
        } else {
          console.log('[CallbackPage] No user data in query params - will be fetched on demand');
        }

        // Success - redirect to dashboard
        console.log('[CallbackPage] Authentication successful, redirecting to dashboard');

        // Small delay to ensure state updates are processed
        setTimeout(() => {
          router.push('/dashboard');
        }, 300);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        console.error('[CallbackPage] Processing error:', message);
        setError(message);
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [router, searchParams, setUser]);

  /**
   * Processing State - Loading spinner
   */
  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <h1 className="text-2xl font-bold">Completing authentication</h1>
          <p className="mt-2 text-sm text-foreground/60">Setting up your account...</p>
        </div>
      </div>
    );
  }

  /**
   * Error State - Show error message with retry link
   */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-destructive">Authentication Failed</h1>
          <p className="mt-3 text-sm text-foreground/70">{error}</p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => router.push('/sign-in')}
              className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to Sign In
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Visit GitHub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
