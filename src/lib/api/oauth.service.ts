/**
 * OAuth/SSO Authentication Service
 * Handles OAuth provider integration and single sign-on operations
 * Supports Google, GitHub, and custom OAuth providers
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { AuthResponse, OAuthProvider } from './types';
import { setStoredTokens } from './token-manager';

interface OAuthCallbackPayload {
  code: string;
  provider: OAuthProvider;
  redirectUri: string;
}

interface OAuthRedirectResponse {
  redirectUrl: string;
  state: string;
  codeChallenge: string;
}

/**
 * OAuth/SSO Service
 * Provides methods for OAuth authentication flows
 */
export const oauthService = {
  /**
   * Get OAuth redirect URL for user to authenticate with provider
   * @param provider - OAuth provider (google, github, etc)
   * @returns OAuth redirect URL and state for security
   * @throws Error if request fails
   */
  async getOAuthRedirectUrl(provider: OAuthProvider): Promise<OAuthRedirectResponse> {
    try {
      console.log(`[OAuthService] Getting redirect URL for ${provider}`);
      const response = await apiClient.get<OAuthRedirectResponse>(
        `${API_ENDPOINTS.AUTH.OAUTH_REDIRECT}?provider=${provider}`
      );
      console.log(`[OAuthService] Redirect URL obtained for ${provider}`);
      return response.data;
    } catch (error) {
      console.error(`[OAuthService] Failed to get redirect URL for ${provider}:`, error);
      throw error;
    }
  },

  /**
   * Handle OAuth callback after user authenticates with provider
   * Exchanges authorization code for access token
   * @param payload - OAuth callback data (code, provider, redirectUri)
   * @returns User data and tokens
   * @throws Error if callback handling fails
   */
  async handleOAuthCallback(payload: OAuthCallbackPayload): Promise<AuthResponse> {
    try {
      console.log(`[OAuthService] Handling OAuth callback for ${payload.provider}`);
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.OAUTH_CALLBACK,
        payload
      );

      if (response.data.tokens) {
        const { accessToken, refreshToken } = response.data.tokens;
        setStoredTokens(accessToken, refreshToken);
        console.log(`[OAuthService] OAuth authentication successful for ${payload.provider}`);
      }

      return response.data;
    } catch (error) {
      console.error(`[OAuthService] OAuth callback failed:`, error);
      throw error;
    }
  },

  /**
   * Link existing account with OAuth provider
   * Allows users to add OAuth authentication to existing accounts
   * @param provider - OAuth provider to link
   * @param code - Authorization code from provider
   * @returns Updated user data
   * @throws Error if linking fails
   */
  async linkOAuthProvider(provider: OAuthProvider, code: string): Promise<AuthResponse> {
    try {
      console.log(`[OAuthService] Linking OAuth provider ${provider}`);
      const response = await apiClient.post<AuthResponse>(
        `${API_ENDPOINTS.AUTH.OAUTH_LINK}`,
        { provider, code }
      );
      console.log(`[OAuthService] OAuth provider linked successfully`);
      return response.data;
    } catch (error) {
      console.error(`[OAuthService] Failed to link OAuth provider:`, error);
      throw error;
    }
  },

  /**
   * Unlink OAuth provider from account
   * Removes OAuth authentication method from user account
   * @param provider - OAuth provider to unlink
   * @returns Updated user data
   * @throws Error if unlinking fails
   */
  async unlinkOAuthProvider(provider: OAuthProvider): Promise<AuthResponse> {
    try {
      console.log(`[OAuthService] Unlinking OAuth provider ${provider}`);
      const response = await apiClient.post<AuthResponse>(
        `${API_ENDPOINTS.AUTH.OAUTH_UNLINK}`,
        { provider }
      );
      console.log(`[OAuthService] OAuth provider unlinked successfully`);
      return response.data;
    } catch (error) {
      console.error(`[OAuthService] Failed to unlink OAuth provider:`, error);
      throw error;
    }
  },

  /**
   * Get list of connected OAuth providers for current user
   * @returns Array of connected OAuth providers
   * @throws Error if request fails
   */
  async getConnectedProviders(): Promise<OAuthProvider[]> {
    try {
      console.log(`[OAuthService] Fetching connected OAuth providers`);
      const response = await apiClient.get<{ providers: OAuthProvider[] }>(
        API_ENDPOINTS.AUTH.OAUTH_PROVIDERS
      );
      console.log(`[OAuthService] Connected providers fetched:`, response.data.providers);
      return response.data.providers;
    } catch (error) {
      console.error(`[OAuthService] Failed to fetch connected providers:`, error);
      throw error;
    }
  },
};
