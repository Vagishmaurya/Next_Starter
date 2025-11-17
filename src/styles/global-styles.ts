/**
 * Global Styled Components CSS
 * Base styles and global layout configurations
 * @module styles/global-styles
 */

import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

/**
 * Global styles applied to entire application
 * Includes base typography, resets, and theme-aware styles
 */
export const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.fontFamily?.sans || 'system-ui, -apple-system, sans-serif'};
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.foreground};
    line-height: 1.5;
    transition: background-color 0.3s ease, color 0.3s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.25;
  }

  h1 {
    font-size: 2.25rem;
  }

  h2 {
    font-size: 1.875rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  code {
    font-family: ${({ theme }) => theme.fontFamily?.mono || 'monospace'};
  }
`;
