/**
 * OAuth/SSO Hook
 * Provides convenient access to OAuth authentication methods
 * Handles OAuth provider linking and unlinking
 */

'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { oauthService } from '@/lib/api/oauth.service';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { OAuthProvider } from '@/lib/api/types';

/**
 * useOAuth Hook
 * Manages OAuth/SSO authentication and provider linking
 * 
 * @returns Object containing OAuth methods and state
 * 
 * @example
 * const { initiateOAuth, linkProvider, unlinkProvider } = useOAuth();
 * 
 * const handleGoogleLogin = async () => {
 *   await initiateOAuth('google');
 * };
 */
export const useOAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<OAuthProvider[]>([]);

  const { login } = useAuthStore();

  /**
   * Initiates OAuth authentication flow for a provider
   * Redirects user to OAuth provider login page
   * @param provider - OAuth provider (google, github, microsoft)
   */
  const initiateOAuth = useCallback(
    async (provider: OAuthProvider) => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`[useOAuth] Initiating OAuth for ${provider}`);
        const { redirectUrl } = await oauthService.getOAuthRedirectUrl(provider);
        
        // Store state for verification after callback
        sessionStorage.setItem(`oauth_provider_${provider}`, provider);
        
        // Redirect to OAuth provider
        window.location.href = redirectUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : `Failed to login with ${provider}`;
        console.error(`[useOAuth] OAuth initiation failed:`, message);
        setError(message);
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Handles OAuth callback after user authenticates with provider
   * Called when user is redirected back from OAuth provider
   * @param code - Authorization code from provider
   * @param provider - OAuth provider
   */
  const handleOAuthCallback = useCallback(
    async (code: string, provider: OAuthProvider) => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`[useOAuth] Handling OAuth callback for ${provider}`);
        const response = await oauthService.handleOAuthCallback({
          code,
          provider,
          redirectUri: window.location.origin + '/auth/callback',
        });

        // Update auth state
        await login(response.user.email, ''); // Password not needed for OAuth
        
        console.log(`[useOAuth] OAuth authentication successful`);
        router.push('/dashboard');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'OAuth callback failed';
        console.error(`[useOAuth] OAuth callback error:`, message);
        setError(message);
        setIsLoading(false);
      }
    },
    [login, router]
  );

  /**
   * Links OAuth provider to existing account
   * Allows users to add OAuth authentication to existing accounts
   * @param provider - OAuth provider to link
   * @param code - Authorization code from provider
   */
  const linkProvider = useCallback(
    async (provider: OAuthProvider, code: string) => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`[useOAuth] Linking provider ${provider}`);
        const response = await oauthService.linkOAuthProvider(provider, code);
        
        setConnectedProviders(response.user.oauthProviders || []);
        console.log(`[useOAuth] Provider linked successfully`);
      } catch (err) {
        const message = err instanceof Error ? err.message : `Failed to link ${provider}`;
        console.error(`[useOAuth] Link provider error:`, message);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Unlinks OAuth provider from account
   * Removes OAuth authentication method
   * @param provider - OAuth provider to unlink
   */
  const unlinkProvider = useCallback(
    async (provider: OAuthProvider) => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`[useOAuth] Unlinking provider ${provider}`);
        const response = await oauthService.unlinkOAuthProvider(provider);
        
        setConnectedProviders(response.user.oauthProviders || []);
        console.log(`[useOAuth] Provider unlinked successfully`);
      } catch (err) {
        const message = err instanceof Error ? err.message : `Failed to unlink ${provider}`;
        console.error(`[useOAuth] Unlink provider error:`, message);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetches list of connected OAuth providers for current user
   */
  const fetchConnectedProviders = useCallback(async () => {
    try {
      console.log(`[useOAuth] Fetching connected providers`);
      const providers = await oauthService.getConnectedProviders();
      setConnectedProviders(providers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch providers';
      console.error(`[useOAuth] Fetch providers error:`, message);
      setError(message);
    }
  }, []);

  /**
   * Checks if provider is connected
   * @param provider - Provider to check
   * @returns true if provider is connected
   */
  const isProviderConnected = useCallback(
    (provider: OAuthProvider): boolean => {
      return connectedProviders.includes(provider);
    },
    [connectedProviders]
  );

  return {
    isLoading,
    error,
    connectedProviders,
    initiateOAuth,
    handleOAuthCallback,
    linkProvider,
    unlinkProvider,
    fetchConnectedProviders,
    isProviderConnected,
  };
};
