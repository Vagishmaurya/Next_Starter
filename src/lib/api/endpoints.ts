/**
 * API Endpoints Configuration
 * Centralized management of all API endpoint URLs
 * Update these based on your backend API structure
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    OAUTH_REDIRECT: '/auth/oauth/redirect',
    OAUTH_CALLBACK: '/auth/oauth/callback',
    OAUTH_LINK: '/auth/oauth/link',
    OAUTH_UNLINK: '/auth/oauth/unlink',
    OAUTH_PROVIDERS: '/auth/oauth/providers',
  },

  // User endpoints with role-based access
  USERS: {
    GET_ALL: '/users',
    GET_ONE: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPDATE_ROLE: (id: string) => `/users/${id}/role`,
  },

  // Admin endpoints (requires admin role)
  ADMIN: {
    GET_USERS: '/admin/users',
    GET_USER: (id: string) => `/admin/users/${id}`,
    DELETE_USER: (id: string) => `/admin/users/${id}`,
    UPDATE_USER_ROLE: (id: string) => `/admin/users/${id}/role`,
    GET_ANALYTICS: '/admin/analytics',
  },
} as const;
