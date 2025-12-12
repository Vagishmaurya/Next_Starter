/**
 * Loading Spinner Component with Styled Components
 * Displays animated spinner for loading states
 * @module components/ui/styled/LoadingSpinner
 */

import styled, { keyframes } from 'styled-components';

/**
 * Keyframe animation for spinner rotation
 */
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Props for LoadingSpinner component
 */
type LoadingSpinnerProps = {
  /** Size of spinner in pixels */
  size?: number;
  /** Color of spinner */
  color?: string;
};

/**
 * Styled spinner container
 */
const SpinnerContainer = styled.div<LoadingSpinnerProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size = 24 }) => size}px;
  height: ${({ size = 24 }) => size}px;
`;

/**
 * Styled spinner circle
 */
const SpinnerCircle = styled.div<LoadingSpinnerProps>`
  width: 100%;
  height: 100%;
  border: 3px solid ${({ theme }) => theme.muted};
  border-top-color: ${({ color, theme }) => color || theme.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

/**
 * LoadingSpinner Component
 * @param {LoadingSpinnerProps} props - Component props
 * @returns {JSX.Element} Rendered spinner
 */
export const LoadingSpinner = ({ size = 24, color }: LoadingSpinnerProps): JSX.Element => {
  return (
    <SpinnerContainer size={size}>
      <SpinnerCircle size={size} color={color} />
    </SpinnerContainer>
  );
};
