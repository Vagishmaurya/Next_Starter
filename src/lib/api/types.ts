/**
 * Authentication and Authorization Types
 * Defines all type interfaces for API requests and responses
 */

/**
 * User roles for role-based access control
 */
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
}

/**
 * Supported OAuth providers for single sign-on
 */
export type OAuthProvider = 'google' | 'github' | 'microsoft';

/**
 * OAuth provider configuration
 */
export type OAuthProviderConfig = {
  id: OAuthProvider;
  name: string;
  icon: string;
  enabled: boolean;
};

/**
 * Authentication token payload structure
 */
export type TokenPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

/**
 * User data structure with role information
 */
export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  oauthProviders?: OAuthProvider[];
  avatar?: string;
};

/**
 * Authentication response from API
 */
export type AuthResponse = {
  tokens: TokenPayload;
  user: User;
};

/**
 * API error response structure
 */
export type ApiError = {
  message: string;
  code: string;
  statusCode: number;
};

/**
 * Refresh token request payload
 */
export type RefreshTokenPayload = {
  refreshToken: string;
};
