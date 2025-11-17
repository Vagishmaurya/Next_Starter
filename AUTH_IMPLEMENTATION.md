# Authentication Implementation Guide

## Overview

This application implements a comprehensive authentication and authorization system with the following features:

- **JWT Token Management**: Access tokens and refresh tokens with automatic refresh logic
- **Automatic Token Refresh**: Interceptors handle token refresh on 401 responses
- **Role-Based Access Control (RBAC)**: User roles (ADMIN, MODERATOR, USER, GUEST) with permission checking
- **Protected Routes**: Components to restrict access based on user roles and permissions
- **Persistent Authentication**: User and token state persisted using localStorage and Zustand

## Architecture

### Core Components

#### 1. Token Manager (`src/lib/api/token-manager.ts`)
Handles all token storage and retrieval operations:
- `getAccessToken()` - Retrieves access token from localStorage
- `getRefreshToken()` - Retrieves refresh token from localStorage
- `setStoredTokens(accessToken, refreshToken)` - Stores both tokens
- `clearTokens()` - Clears all tokens (used on logout)
- `decodeToken(token)` - Decodes JWT without verification
- `isTokenExpired(token)` - Checks if token is about to expire

#### 2. Interceptor Setup (`src/lib/api/interceptor-setup.ts`)
Manages axios request and response interceptors:

**Request Interceptor:**
- Attaches access token to every request
- Checks token expiration status
- Skips token attachment for refresh endpoint

**Response Interceptor:**
- Automatically refreshes token on 401 response
- Queues requests while token is refreshing
- Handles 403 (forbidden) responses
- Redirects to login on final authentication failure

#### 3. API Client (`src/lib/api/client.ts`)
Creates and configures axios instance with interceptors:
- Base URL configuration from environment variables
- Interceptors setup
- Credentials support for cookie-based auth

#### 4. Auth Service (`src/lib/api/auth.service.ts`)
Provides authentication API methods:
- `login(email, password)` - User login
- `register(email, password, name)` - User registration
- `getCurrentUser()` - Fetch current user profile
- `logout()` - User logout
- `refreshToken()` - Refresh access token

#### 5. User Store (`src/lib/stores/useUserStore.ts`)
Zustand store for user state management:
- User profile data
- Authentication status
- Role-based access checking methods:
  - `hasRole(role)` - Check specific role
  - `hasPermission(requiredRoles)` - Check permission

#### 6. Auth Store (`src/lib/stores/useAuthStore.ts`)
Zustand store for authentication operations:
- Login/register/logout actions
- Loading and error states
- Coordinates with user store

### Hooks

#### useAuth (`src/lib/hooks/useAuth.ts`)
Main authentication hook combining user and auth stores:
\`\`\`tsx
const { user, isAuthenticated, login, register, logout, hasRole, hasPermission } = useAuth();
\`\`\`

#### useRoleBasedAccess (`src/lib/hooks/useRoleBasedAccess.ts`)
Detailed permission checking:
\`\`\`tsx
const { canAccess, hasAllPermissions, hasAnyPermission, isAdmin, isModerator } = useRoleBasedAccess();
\`\`\`

### Components

#### ProtectedRoute (`src/components/guards/ProtectedRoute.tsx`)
Conditionally renders content based on roles/permissions:
\`\`\`tsx
<ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
  <AdminPanel />
</ProtectedRoute>
\`\`\`

## Token Flow

### Login Flow
\`\`\`
1. User submits login form
2. Auth service calls login endpoint
3. Backend returns access token, refresh token, and user data
4. Tokens stored in localStorage
5. User data stored in Zustand store
6. User redirected to dashboard
\`\`\`

### Request with Token
\`\`\`
1. Request interceptor checks for valid token
2. Token attached to Authorization header
3. Request sent to backend
4. Response interceptor receives response
\`\`\`

### Token Refresh Flow
\`\`\`
1. API returns 401 Unauthorized
2. Response interceptor detects 401
3. Refresh token used to request new access token
4. New tokens stored
5. Original request retried with new token
6. Concurrent requests queued and retried after refresh
\`\`\`

### Logout Flow
\`\`\`
1. User clicks logout
2. Auth service calls logout endpoint
3. Tokens cleared from localStorage
4. User data cleared from store
5. User redirected to login page
\`\`\`

## Role-Based Access Control

### Roles
- **ADMIN**: Full access to all features
- **MODERATOR**: Moderation and reporting features
- **USER**: Basic user features
- **GUEST**: Public content only

### Permission Mapping
Defined in `src/hooks/useRoleBasedAccess.ts`:

\`\`\`typescript
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'view_analytics',
    'manage_users',
    'manage_roles',
    'delete_content',
    'access_admin_panel',
  ],
  [UserRole.MODERATOR]: [
    'moderate_content',
    'view_reports',
    'manage_users',
  ],
  [UserRole.USER]: [
    'view_profile',
    'edit_profile',
    'upload_content',
  ],
  [UserRole.GUEST]: [
    'view_public_content',
  ],
};
\`\`\`

### Usage Examples

#### Check Single Permission
\`\`\`tsx
if (canAccess('manage_users')) {
  // Show user management UI
}
\`\`\`

#### Check Multiple Permissions (All Required)
\`\`\`tsx
if (hasAllPermissions(['view_analytics', 'manage_users'])) {
  // Show admin analytics
}
\`\`\`

#### Check Multiple Permissions (Any Required)
\`\`\`tsx
if (hasAnyPermission(['manage_users', 'moderate_content'])) {
  // Show moderation UI
}
\`\`\`

#### Protect Route Component
\`\`\`tsx
<ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
  <AdminDashboard />
</ProtectedRoute>
\`\`\`

## Environment Variables

Required environment variables:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001/api
\`\`\`

Optional analytics:

\`\`\`
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
\`\`\`

## Backend API Requirements

Your backend API should implement these endpoints:

### POST /auth/login
Request:
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

Response:
\`\`\`json
{
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600
  },
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
\`\`\`

### POST /auth/register
Request:
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
\`\`\`

Response: Same as login

### GET /auth/me
Response:
\`\`\`json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user"
}
\`\`\`

### POST /auth/refresh
Request:
\`\`\`json
{
  "refreshToken": "refresh_token"
}
\`\`\`

Response:
\`\`\`json
{
  "tokens": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
\`\`\`

### POST /auth/logout
Response: 200 OK

## Error Handling

The interceptor handles various error scenarios:

- **401 Unauthorized**: Attempts token refresh
- **403 Forbidden**: User lacks required permissions
- **Other Errors**: Passed through to component error handlers

All errors are caught and logged with `[Interceptor]` prefix for debugging.

## Dark Mode / Light Mode

Theme management uses `next-themes`:

1. Add ThemeProvider to root layout
2. Use ThemeToggle component in navbar
3. Theme preference persisted in localStorage
4. CSS variables updated automatically

Theme colors defined in `app/globals.css`:
- Light mode (`:root`)
- Dark mode (`.dark`)

## Debugging

Enable debug logs by checking browser console:

- `[TokenManager]` - Token operations
- `[Interceptor]` - Request/response interceptor events
- `[AuthService]` - Authentication service calls
- `[AuthStore]` - Auth store state changes
- `[UserStore]` - User store state changes

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage (consider security implications)
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure backend CORS to accept frontend domain
4. **Token Expiration**: Set appropriate token expiration times
5. **Refresh Token Rotation**: Implement refresh token rotation in backend
6. **XSS Protection**: Sanitize all user inputs
7. **CSRF Protection**: Implement CSRF tokens if needed

## Troubleshooting

### Token Not Persisting
- Check localStorage is enabled in browser
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check browser console for errors

### Refresh Token Not Working
- Verify backend implements /auth/refresh endpoint
- Check refresh token is returned from login
- Verify token format matches JWT standard

### Role-Based Access Not Working
- Ensure user role is returned from backend
- Verify role matches UserRole enum values
- Check permission mapping includes required permission

### Theme Not Switching
- Ensure ThemeProvider wraps app
- Check theme CSS variables in globals.css
- Verify next-themes package is installed
