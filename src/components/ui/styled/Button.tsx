/**
 * Button Component with Styled Components
 * Primary interactive element with multiple variants
 * @module components/ui/styled/Button
 */

import styled from 'styled-components';

/**
 * Props for Button component
 */
interface ButtonProps {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is loading */
  isLoading?: boolean;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: () => void;
}

/**
 * Styled button base element
 */
const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
  
  /* Size variants */
  ${({ size = 'md' }) => {
    const sizes = {
      sm: `
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        height: 2rem;
      `,
      md: `
        padding: 0.5rem 1rem;
        font-size: 1rem;
        height: 2.5rem;
      `,
      lg: `
        padding: 0.75rem 1.5rem;
        font-size: 1.125rem;
        height: 3rem;
      `,
    };
    return sizes[size];
  }}

  /* Variant styles */
  ${({ variant = 'primary', theme }) => {
    const variants = {
      primary: `
        background-color: ${theme.primary};
        color: ${theme.primaryForeground};
        &:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `,
      secondary: `
        background-color: ${theme.secondary};
        color: ${theme.secondaryForeground};
        &:hover:not(:disabled) {
          background-color: ${theme.border};
        }
      `,
      destructive: `
        background-color: ${theme.destructive};
        color: ${theme.destructiveForeground};
        &:hover:not(:disabled) {
          opacity: 0.9;
        }
      `,
      outline: `
        background-color: transparent;
        color: ${theme.primary};
        border: 2px solid ${theme.primary};
        &:hover:not(:disabled) {
          background-color: ${theme.primary}10;
        }
      `,
      ghost: `
        background-color: transparent;
        color: ${theme.primary};
        &:hover:not(:disabled) {
          background-color: ${theme.muted};
        }
      `,
    };
    return variants[variant];
  }}

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Focus state */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.ring};
    outline-offset: 2px;
  }
`;

/**
 * Button Component
 * @param {ButtonProps} props - Button properties
 * @returns {JSX.Element} Rendered button
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  children,
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span>Loading...</span>}
      {!isLoading && children}
    </StyledButton>
  );
};
