/**
 * Styled Components Provider Setup
 * Initializes styled-components with theme configuration
 * @module lib/styled-components-provider
 */

import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { useTheme } from 'next-themes';
import { GlobalStyle } from '@/styles/global-styles';
import { lightTheme, darkTheme } from '@/styles/theme';

/**
 * Props for ThemeWrapper component
 */
interface ThemeWrapperProps {
  children: ReactNode;
}

/**
 * ThemeWrapper Component
 * Wraps application with styled-components ThemeProvider
 * Synchronizes theme with next-themes
 * 
 * @param {ThemeWrapperProps} props - Component props
 * @returns {JSX.Element} ThemeProvider wrapper
 */
export const ThemeWrapper = ({ children }: ThemeWrapperProps): JSX.Element => {
  const { theme: currentTheme } = useTheme();
  const theme = currentTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle theme={theme} />
      {children}
    </ThemeProvider>
  );
};
