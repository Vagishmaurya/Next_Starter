/**
 * Token Manager
 * Handles storage and retrieval of authentication tokens
 * Supports both localStorage and in-memory storage
 */

const TOKEN_STORAGE_KEY = 'authTokens';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Safely retrieves tokens from localStorage
 * @returns Parsed tokens or null if not found
 */
export const getStoredTokens = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const tokens = localStorage.getItem(TOKEN_STORAGE_KEY);
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    console.error('[TokenManager] Error retrieving tokens:', error);
    return null;
  }
};

/**
 * Safely stores tokens in localStorage
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 */
export const setStoredTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken }));
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('[TokenManager] Error storing tokens:', error);
  }
};

/**
 * Retrieves the access token from storage
 * @returns Access token or null if not found
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const tokens = localStorage.getItem(TOKEN_STORAGE_KEY);
    return tokens ? JSON.parse(tokens).accessToken : null;
  } catch (error) {
    console.error('[TokenManager] Error retrieving access token:', error);
    return null;
  }
};

/**
 * Retrieves the refresh token from storage
 * @returns Refresh token or null if not found
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenManager] Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Clears all stored tokens
 */
export const clearTokens = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenManager] Error clearing tokens:', error);
  }
};

/**
 * Decodes JWT token to get payload (without verification)
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid
 */
export const decodeToken = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('[TokenManager] Error decoding token:', error);
    return null;
  }
};

/**
 * Checks if token is expired
 * @param token - JWT token to check
 * @returns true if expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // Check if token expires in less than 1 minute
  const expiryTime = decoded.exp * 1000;
  return Date.now() >= expiryTime - 60000;
};
