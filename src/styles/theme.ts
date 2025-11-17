/**
 * Global Theme Configuration for Styled Components
 * Defines all design tokens for light and dark modes
 * @module styles/theme
 */

/** Light mode theme colors */
export const lightTheme = {
  // Base colors
  background: '#ffffff',
  foreground: '#000000',
  card: '#ffffff',
  cardForeground: '#000000',
  
  // Primary colors
  primary: '#3b82f6',
  primaryForeground: '#ffffff',
  
  // Secondary colors
  secondary: '#f3f4f6',
  secondaryForeground: '#1f2937',
  
  // Neutral colors
  muted: '#f3f4f6',
  mutedForeground: '#6b7280',
  accent: '#f3f4f6',
  accentForeground: '#1f2937',
  
  // Status colors
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Border and input
  border: '#e5e7eb',
  input: '#e5e7eb',
  ring: '#3b82f6',
  
  // Sidebar
  sidebar: '#f9fafb',
  sidebarForeground: '#111827',
  sidebarPrimary: '#3b82f6',
  sidebarPrimaryForeground: '#ffffff',
  sidebarAccent: '#f3f4f6',
  sidebarAccentForeground: '#1f2937',
  sidebarBorder: '#e5e7eb',
};

/** Dark mode theme colors */
export const darkTheme = {
  // Base colors
  background: '#0f172a',
  foreground: '#f8fafc',
  card: '#1e293b',
  cardForeground: '#f8fafc',
  
  // Primary colors
  primary: '#60a5fa',
  primaryForeground: '#0f172a',
  
  // Secondary colors
  secondary: '#334155',
  secondaryForeground: '#f8fafc',
  
  // Neutral colors
  muted: '#334155',
  mutedForeground: '#94a3b8',
  accent: '#334155',
  accentForeground: '#f8fafc',
  
  // Status colors
  destructive: '#f87171',
  destructiveForeground: '#1e293b',
  success: '#34d399',
  warning: '#fbbf24',
  info: '#60a5fa',
  
  // Border and input
  border: '#334155',
  input: '#334155',
  ring: '#60a5fa',
  
  // Sidebar
  sidebar: '#1e293b',
  sidebarForeground: '#f8fafc',
  sidebarPrimary: '#60a5fa',
  sidebarPrimaryForeground: '#0f172a',
  sidebarAccent: '#334155',
  sidebarAccentForeground: '#f8fafc',
  sidebarBorder: '#334155',
};

/** Theme type definition */
export type Theme = typeof lightTheme;

/** Border radius values */
export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.625rem',
  xl: '0.875rem',
  '2xl': '1rem',
};

/** Font family definitions */
export const fontFamily = {
  sans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'Geist Mono', 'Courier New', monospace",
};

/** Font sizes */
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
};

/** Line heights */
export const lineHeight = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.625',
};

/** Spacing scale */
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

/** Transition durations */
export const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

/** Z-index values */
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
