# Next.js Starter Boilerplate

A modern, production-ready Next.js starter boilerplate with authentication, OAuth/SSO, role-based access control (RBAC), MVVM architecture, styled-components, and comprehensive security features.

## 🎯 Features

### Core Framework
- **Next.js 16** with App Router and TypeScript
- **React 19** with modern hooks and server components
- **Vite** integration for development

### 🔐 Authentication & Security
- Email/password authentication
- OAuth/SSO (Google, GitHub, Microsoft)
- JWT token management with automatic refresh
- Secure token storage in localStorage
- Role-Based Access Control (RBAC)
  - 4 User Roles: Admin, Moderator, User, Guest
  - Permission-based route protection
  - ProtectedRoute component for conditional rendering

### 🏗️ Architecture & State Management
- **MVVM Architecture Pattern** - Clean separation of concerns
- **Zustand** for global state management with DevTools integration
- Multiple dedicated stores (Auth, User, App)
- Persistent state management
- Custom hooks for business logic

### 🎨 UI Components (50+)
- Form Components: Input, Textarea, Checkbox, Radio, Select, Label, Toggle, Slider, etc.
- Layout Components: Card, Sidebar, Drawer, Accordion, Collapsible, Resizable, etc.
- Navigation: Breadcrumb, Menu, Pagination, Dropdown, Context Menu, etc.
- Data Display: Table, Avatar, Badge, Progress, Skeleton, Empty State, etc.
- Notifications: Toast, Sonner, Alert, Dialog, etc.
- Advanced: Calendar, Command, Chart, Carousel, Tabs, etc.

### 💅 Styling & Theming
- Styled-components for scoped CSS-in-JS
- Tailwind CSS with PostCSS
- Dark/Light mode with system preference detection
- Theme persistence to localStorage
- SSR-safe theme hydration
- Responsive design

### 📡 API Integration
- Axios client with request/response interceptors
- Automatic token attachment to requests
- Automatic 401 error handling with redirect
- Token refresh on 401 responses
- Request queueing during token refresh

### 🌍 Internationalization (i18n)
- next-intl integration
- Multi-language support (English, French)
- Dynamic locale switching
- Route-based locale handling

### 📝 Form Management & Validation
- React Hook Form for efficient forms
- Zod schema validation
- Valibot as alternative validation
- Complete error handling

### 🧪 Testing Infrastructure
- **Vitest** for unit testing (Node.js environment)
- **Vitest** for UI testing (Browser with Playwright)
- **Playwright** for E2E testing
- Test coverage reporting with v8
- Visual testing with Chromatic

### 🛠️ Developer Experience
- ESLint with accessibility, React, Next.js, and Tailwind rules
- Prettier code formatting
- Husky pre-commit hooks
- Commitlint for conventional commits
- Path aliases for clean imports
- TypeScript strict mode

### 🎛️ Additional Features
- Logging with LogTape
- Error tracking with Sentry
- Analytics with PostHog
- Bundle analyzer
- Unused dependency detection with Knip
- SEO support (robots.ts, sitemap.ts)

## 📂 Project Structure

```
src/
├── app/                                    # Next.js App Router
│   ├── global-error.tsx                   # Global error boundary
│   ├── layout.tsx                         # Root layout
│   ├── robots.ts                          # SEO robots
│   ├── sitemap.ts                         # SEO sitemap
│   └── [locale]/
│       ├── (marketing)/                   # Public pages
│       │   ├── layout.tsx
│       │   └── page.tsx                   # Home page
│       ├── (auth)/
│       │   ├── (center)/
│       │   │   ├── sign-in/              # Sign in page
│       │   │   │   ├── page.tsx
│       │   │   │   └── layout.tsx
│       │   │   └── sign-up/              # Sign up page
│       │   │       ├── page.tsx
│       │   │       └── layout.tsx
│       │   ├── dashboard/                 # Protected dashboard
│       │   │   ├── page.tsx
│       │   │   └── layout.tsx
│       │   └── layout.tsx
│       └── layout.tsx
│
├── components/
│   ├── ui/                                # 50+ shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sidebar.tsx
│   │   ├── table.tsx
│   │   ├── skeleton.tsx
│   │   ├── carousel.tsx
│   │   ├── calendar.tsx
│   │   ├── chart.tsx
│   │   └── [40+ more components]
│   ├── auth/                              # Authentication components
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── OAuthButtons.tsx
│   ├── dashboard/                         # Dashboard components
│   │   ├── AdminDashboardContent.tsx
│   │   └── UserDashboardContent.tsx
│   ├── rbac/                              # RBAC components
│   │   └── RoleManager.tsx
│   ├── guards/                            # Route guards
│   │   └── ProtectedRoute.tsx
│   ├── providers/                         # Context providers
│   ├── analytics/                         # Analytics components
│   ├── counter/                           # Counter example (MVVM)
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── LocaleSwitcher.tsx
│
├── lib/
│   ├── api/                               # API client and services
│   │   ├── client.ts                      # Axios instance
│   │   ├── interceptor-setup.ts           # Request/response interceptors
│   │   ├── token-manager.ts               # Token handling
│   │   ├── auth.service.ts                # Authentication service
│   │   ├── oauth.service.ts               # OAuth/SSO service
│   │   ├── types.ts                       # API types
│   │   └── endpoints.ts                   # API endpoints
│   ├── stores/                            # Zustand stores (ViewModels)
│   │   ├── useAuthStore.ts                # Auth ViewModel
│   │   ├── useUserStore.ts                # User ViewModel
│   │   ├── useAppStore.ts                 # App ViewModel
│   │   └── index.ts                       # Store exports
│   ├── styled-components-provider.tsx     # Theme wrapper
│   └── utils.ts                           # Utility functions
│
├── hooks/                                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useOAuth.ts
│   ├── useApi.ts
│   ├── useRoleBasedAccess.ts
│   └── useTheme.ts
│
├── styles/                                # Styling
│   ├── theme.ts                           # Styled-components theme
│   ├── global-styles.ts                   # Global styles
│   └── globals.css                        # CSS variables
│
├── viewmodels/                            # MVVM ViewModels
│   ├── HomeViewModel.ts
│   ├── CounterViewModel.ts
│   └── [Additional ViewModels]
│
├── types/                                 # TypeScript types
├── utils/                                 # Utility functions
└── locales/                               # i18n translations
    ├── en.json
    └── fr.json

components/                                # Root UI components (shadcn/ui)
├── theme-provider.tsx
└── ui/                                    # All UI component exports

public/                                    # Static assets

tests/
├── e2e/                                   # E2E tests
└── integration/                           # Integration tests

Configuration Files:
├── next.config.mjs                        # Next.js configuration
├── tsconfig.json                          # TypeScript configuration
├── tailwind.config.js                     # Tailwind CSS config
├── postcss.config.mjs                     # PostCSS config
├── vitest.config.mts                      # Vitest configuration
├── playwright.config.ts                   # Playwright E2E config
├── eslint.config.mjs                      # ESLint rules
├── components.json                        # shadcn/ui config
├── checkly.config.ts                      # Checkly monitoring
├── commitlint.config.ts                   # Commit linting
├── lint-staged.config.mjs                 # Pre-commit hooks
└── knip.config.ts                         # Unused code detection
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: OAuth/SSO Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 Pages & Routes

### Public Pages
- **`/`** - Home page with welcome message and CTA buttons
- **`/en`** - English version home
- **`/fr`** - French version home

### Authentication Pages
- **`/[locale]/sign-in`** - User sign-in with email/password or OAuth
- **`/[locale]/sign-up`** - User registration with email/password or OAuth

### Protected Pages
- **`/[locale]/dashboard`** - Admin dashboard (requires authentication)
  - Admin-only features for users with ADMIN role
  - Moderator tools for MODERATOR role users
  - User information and permissions display

---

## 🏗️ MVVM Architecture Pattern

This boilerplate follows the **Model-View-ViewModel** architecture pattern for clean code organization:

### Architecture Components

**Views** (React Components)
- Located in `src/components/`
- Focused on UI rendering and user interaction
- Connected to ViewModels via custom hooks
- Dummy components provided as reference

**ViewModels** (Zustand Stores)
- Located in `src/lib/stores/` and `src/viewmodels/`
- Contains business logic and state management
- `useAuthStore.ts` - Authentication ViewModel
- `useUserStore.ts` - User profile ViewModel
- `useAppStore.ts` - Global app ViewModel

**Models** (API Services & Data Layer)
- Located in `src/lib/api/`
- `auth.service.ts` - Authentication logic
- `oauth.service.ts` - OAuth/SSO logic
- `token-manager.ts` - Token handling
- `client.ts` - Axios configuration

### MVVM Data Flow

```
User Interaction (View)
         ↓
Custom Hook (useAuth, useRoleBasedAccess)
         ↓
ViewModel (Zustand Store)
         ↓
Model (API Service)
         ↓
Backend API
         ↓
Response → ViewModel Update → View Re-render
```

### Example: Counter Component (MVVM)

**ViewModel** (`src/viewmodels/CounterViewModel.ts`)
```typescript
// Business logic separated from UI
```

**View** (`src/components/counter/`)
```typescript
// Pure UI component connected to ViewModel
```

---

## 🔐 Authentication & Authorization

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

## 🎨 Styling & Components

### Styled Components Integration

All components use styled-components for scoped, theme-aware styling:

```tsx
import styled from 'styled-components';

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
`;
```

### Theme Switching

Switch between dark and light modes:

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

export const Header = () => {
  return <ThemeToggle />;
};
```

### Using UI Components

Access 50+ pre-built components from the component library:

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';

export const MyComponent = () => {
  return (
    <Card>
      <Button>Click me</Button>
      <Table />
    </Card>
  );
};
```

### Loading & Skeleton States

Use Skeleton component for loading placeholders:

```tsx
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingState = () => {
  return <Skeleton className="w-full h-12" />;
};
```

## 📊 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run check:types     # Check TypeScript types
npm run clean           # Clean build artifacts

# Testing
npm run test            # Run unit tests
npm run test:watch      # Watch mode for tests
npm run test:e2e        # Run e2e tests with Playwright

# Other
npm run prepare         # Setup Husky hooks
```

## 🧪 Testing

### Unit Testing with Vitest
```bash
npm run test
```

### UI Testing with Playwright
```bash
npm run test          # Includes browser testing
```

### E2E Testing with Playwright
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test -- --coverage
```

## 📚 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` | Microsoft OAuth client ID | No |
| `NODE_ENV` | Environment (development, production, test) | No |

## 🔌 API Integration Example

```tsx
import { apiClient } from '@/lib/api/client';

// GET request
const { data } = await apiClient.get('/users/profile');

// POST request with authentication
const { data } = await apiClient.post('/users', {
  email: 'user@example.com',
  name: 'John Doe',
});

// Response includes automatic token refresh if needed
```

## 🌐 Internationalization

### Switch Language

```tsx
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

export const Header = () => {
  return <LocaleSwitcher />;
};
```

### Use Translations

```tsx
import { useTranslations } from 'next-intl';

export const Component = () => {
  const t = useTranslations('ComponentName');
  
  return <h1>{t('title')}</h1>;
};
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes following the MVVM pattern
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For issues, questions, or suggestions, please refer to:
- `PROJECT_SUMMARY.md` - Comprehensive feature overview
- `AUTH_IMPLEMENTATION.md` - Authentication details
- `DARK_MODE_GUIDE.md` - Theming system
- `STYLED_COMPONENTS_SETUP.md` - Styling architecture
