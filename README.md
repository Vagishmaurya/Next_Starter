# Next.js Starter Boilerplate

A modern, production-ready Next.js starter boilerplate with authentication, OAuth/SSO, role-based access control (RBAC), MVVM architecture, styled-components, and comprehensive security features.

## Features

- **Next.js 16** with App Router and TypeScript
- **React 19** with modern hooks and server components
- **Authentication**
  - Email/password authentication
  - OAuth/SSO (Google, GitHub, Microsoft)
  - Token refresh with Axios interceptors
  - Secure token storage
- **Role-Based Access Control (RBAC)**
  - Admin, Moderator, User, and Guest roles
  - Permission-based route protection
  - ProtectedRoute component for conditional rendering
- **State Management**
  - Zustand for global state
  - MVVM architecture pattern
  - Custom hooks for business logic
- **API Integration**
  - Axios client with request/response interceptors
  - Automatic token attachment to requests
  - Token refresh on 401 responses
  - Request queueing during token refresh
- **Styling & Theming**
  - Styled-components with scoped CSS
  - Dark/Light mode with next-themes
  - Shimmer UI for loading states
  - Custom theme configuration
  - Responsive design
- **Developer Experience**
  - React Hook Form + Zod for form validation
  - i18n with next-intl
  - ESLint and Prettier for code quality
  - Husky pre-commit hooks
  - Vitest for unit testing
  - Playwright for e2e testing

## Project Structure

\`\`\`
src/
├── app/                          # Next.js app directory
│   ├── [locale]/
│   │   ├── (marketing)/          # Public pages
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx          # Home page
│   │   ├── (auth)/
│   │   │   ├── (center)/
│   │   │   │   ├── sign-in/      # Sign in page
│   │   │   │   └── sign-up/      # Sign up page
│   │   │   ├── dashboard/        # Admin dashboard
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   └── layout.tsx
├── components/                   # React components
│   ├── ui/styled/               # Styled-components UI
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Shimmer.tsx
│   │   └── LoadingSpinner.tsx
│   ├── auth/                     # Auth components
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── OAuthButtons.tsx
│   │   └── OAuthProviderManager.tsx
│   ├── dashboard/               # Dashboard components
│   │   ├── AdminDashboardContent.tsx
│   │   └── UserDashboardContent.tsx
│   ├── rbac/                    # RBAC components
│   │   └── RoleManager.tsx
│   ├── guards/                  # Route guards
│   │   └── ProtectedRoute.tsx
│   └── providers/               # Context providers
├── lib/
│   ├── api/                     # API client and services
│   │   ├── client.ts            # Axios instance
│   │   ├── interceptor-setup.ts # Request/response interceptors
│   │   ├── token-manager.ts     # Token handling
│   │   ├── auth.service.ts      # Authentication service
│   │   ├── oauth.service.ts     # OAuth/SSO service
│   │   ├── types.ts             # API types
│   │   └── endpoints.ts         # API endpoints
│   ├── stores/                  # Zustand stores
│   │   ├── useAuthStore.ts      # Auth state
│   │   ├── useUserStore.ts      # User state
│   │   └── useAppStore.ts       # App state
│   └── styled-components-provider.ts # Theme wrapper
├── styles/                      # Styled-components themes
│   ├── theme.ts                 # Theme tokens
│   └── global-styles.ts         # Global styles
├── hooks/                       # Custom hooks
│   ├── useAuth.ts
│   ├── useOAuth.ts
│   ├── useRoleBasedAccess.ts
│   └── useApi.ts
├── templates/                   # Page templates
│   └── BaseTemplate.tsx
├── viewmodels/                  # MVVM ViewModels
├── utils/                       # Utility functions
└── locales/                     # i18n translations
\`\`\`

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
# or
pnpm install
\`\`\`

### 2. Set Up Environment Variables

Create a `.env.local` file in the root:

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: OAuth/SSO Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

### Public Pages
- **`/`** - Home page with welcome message and CTA buttons

### Authentication Pages
- **`/sign-in`** - User sign-in with email/password or OAuth
- **`/sign-up`** - User registration with email/password or OAuth

### Protected Pages
- **`/dashboard`** - Admin dashboard (requires authentication)
  - Admin-only features for users with ADMIN role
  - Moderator tools for MODERATOR role users
  - User information and permissions display

## Authentication Flow

### Email/Password Authentication

\`\`\`tsx
import { authService } from '@/lib/api/auth.service';
import { useAuth } from '@/hooks/useAuth';

export const LoginExample = () => {
  const { login, user } = useAuth();
  
  const handleLogin = async () => {
    await login('user@example.com', 'password');
  };

  return <button onClick={handleLogin}>Login</button>;
};
\`\`\`

### OAuth/SSO Authentication

\`\`\`tsx
import { useOAuth } from '@/hooks/useOAuth';

export const OAuthExample = () => {
  const { initiateOAuthFlow } = useOAuth();
  
  const handleGoogleLogin = async () => {
    await initiateOAuthFlow('google');
  };

  return <button onClick={handleGoogleLogin}>Login with Google</button>;
};
\`\`\`

## Role-Based Access Control

### Check User Role

\`\`\`tsx
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { UserRole } from '@/lib/api/types';

export const RBACExample = () => {
  const { currentUserRole, hasRole } = useRoleBasedAccess();
  
  if (hasRole(UserRole.ADMIN)) {
    return <AdminPanel />;
  }
  
  return <UserPanel />;
};
\`\`\`

### Protect Routes with ProtectedRoute Component

\`\`\`tsx
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { UserRole } from '@/lib/api/types';

export const AdminOnly = () => {
  return (
    <ProtectedRoute
      requiredRoles={[UserRole.ADMIN]}
      fallback={<div>Access Denied</div>}
    >
      <AdminPanel />
    </ProtectedRoute>
  );
};
\`\`\`

## Token Management

The project includes automatic token refresh using interceptors:

- Access tokens are automatically attached to API requests
- When a 401 response is received, the refresh token is used to obtain a new access token
- Requests are queued while token refresh is in progress
- If token refresh fails, the user is automatically logged out

## Styling with Styled-Components

All components use styled-components for scoped, theme-aware styling:

\`\`\`tsx
import styled from 'styled-components';

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
`;
\`\`\`

## Theming

Switch between dark and light modes:

\`\`\`tsx
import { ThemeToggle } from '@/components/theme-toggle';

export const Header = () => {
  return <ThemeToggle />;
};
\`\`\`

## Loading States

Use Shimmer and Skeleton components for loading placeholders:

\`\`\`tsx
import { Skeleton } from '@/components/ui/styled/Shimmer';

export const Loading = () => {
  return <Skeleton lines={3} showAvatar />;
};
\`\`\`

## Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run test         # Run unit tests with Vitest
npm run test:watch   # Watch mode for tests
npm run test:e2e     # Run e2e tests with Playwright
\`\`\`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` | Microsoft OAuth client ID | No |
| `NODE_ENV` | Environment (development, production, test) | No |

## API Integration Example

\`\`\`tsx
import { apiClient } from '@/lib/api/client';

// GET request
const { data } = await apiClient.get('/users/profile');

// POST request with authentication
const { data } = await apiClient.post('/users', {
  email: 'user@example.com',
  name: 'John Doe',
});

// Response includes automatic token refresh if needed
\`\`\`

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request
