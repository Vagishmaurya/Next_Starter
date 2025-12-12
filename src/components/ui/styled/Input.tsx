/**
 * Input Component with Styled Components
 * Text input field with validation support
 * @module components/ui/styled/Input
 */

import styled from 'styled-components';

/**
 * Props for Input component
 */
type InputProps = {
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether input has error */
  error?: boolean;
};

/**
 * Styled input element
 */
export const Input = styled.input<InputProps>`
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  border: 1px solid ${({ theme }) => theme.input};
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.primary}20`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.muted};
  }

  ${({ error, theme }) =>
    error
      ? `
    border-color: ${theme.destructive};
    &:focus {
      box-shadow: 0 0 0 3px ${`${theme.destructive}20`};
    }
  `
      : ''}
`;

/**
 * Styled label element
 */
export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.foreground};
`;

/**
 * Styled error message
 */
export const ErrorMessage = styled.span`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.destructive};
`;
