# Styled Components Setup Guide

This project uses **styled-components** for styling alongside **next-themes** for dark/light mode support.

## Architecture Overview

### Theme System

- **Light Theme**: Defined in `src/styles/theme.ts` - Light mode colors and tokens
- **Dark Theme**: Defined in `src/styles/theme.ts` - Dark mode colors and tokens
- **Global Styles**: Defined in `src/styles/global-styles.ts` - Applied globally via GlobalStyle component

### Theme Provider Setup

\`\`\`typescript
// src/lib/styled-components-provider.ts

- ThemeWrapper component wraps application with styled-components ThemeProvider
- Synchronizes theme with next-themes for persistence
  \`\`\`

### Root Layout

\`\`\`typescript
// src/app/layout.tsx

- Wraps application with both NextThemesProvider and styled-components ThemeWrapper
- Ensures proper theme initialization on load
  \`\`\`

## Using Styled Components

### Creating a Styled Component

\`\`\`typescript
import styled from 'styled-components';

const StyledButton = styled.button`
background-color: ${({ theme }) => theme.primary};
color: ${({ theme }) => theme.primaryForeground};
padding: 0.5rem 1rem;
border-radius: 0.5rem;
cursor: pointer;

&:hover {
opacity: 0.9;
}
`;
\`\`\`

### Accessing Theme

All styled components have access to the theme object via the `theme` prop:
\`\`\`typescript
${({ theme }) => theme.primary}
${({ theme }) => theme.mutedForeground}
${({ theme }) => theme.borderRadius}
\`\`\`

### Components with Styled Components

- `Button` - Primary interactive element with variants
- `Input`, `Label`, `ErrorMessage` - Form components
- `Card`, `CardTitle`, `CardContent` - Content containers
- `Shimmer`, `Skeleton` - Loading states
- `LoadingSpinner` - Animated loader

## Theme Switching

Dark/light mode switching is handled by next-themes:

- `ThemeToggle` component provides UI for theme switching
- Theme persists to localStorage
- System preference is respected on first visit

## Adding New Colors

To add new theme colors:

1. Add to both `lightTheme` and `darkTheme` in `src/styles/theme.ts`
2. Use in styled components: `${({ theme }) => theme.newColor}`
3. Export types if needed for TypeScript support

## Responsive Design

Use styled-components media queries:
\`\`\`typescript
const ResponsiveContainer = styled.div`
padding: 2rem;

@media (max-width: 640px) {
padding: 1rem;
}
`;
\`\`\`

## Performance Considerations

- Styled components are scoped to individual components
- CSS is generated on-demand and cached
- Theme changes update all components automatically
- No unused CSS bloat as in Tailwind

## Shimmer UI for Loading States

Use the Shimmer and Skeleton components for loading placeholders:
\`\`\`typescript
import { Skeleton } from '@/components/ui/styled/Shimmer';

<Skeleton lines={3} showAvatar />
\`\`\`

This creates animated placeholder skeletons with smooth shimmer effect.

## Migration from Tailwind

All Tailwind classes have been replaced with styled-components. Benefits:

- Fully scoped CSS prevents conflicts
- Dynamic theming built-in
- Better TypeScript support
- No utility class overhead
- Easier to understand styling intent
