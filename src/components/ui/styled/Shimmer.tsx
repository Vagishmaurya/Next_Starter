/**
 * Shimmer Loading Animation Component
 * Creates smooth loading skeleton with shimmer effect
 * @module components/ui/styled/Shimmer
 */

import styled, { keyframes } from 'styled-components';

/**
 * Keyframe animation for shimmer effect
 * Creates smooth gradient movement across component
 */
const shimmerAnimation = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

/**
 * Props for Shimmer component
 */
type ShimmerProps = {
  /** Width of shimmer element */
  width?: string | number;
  /** Height of shimmer element */
  height?: string | number;
  /** Border radius of shimmer */
  borderRadius?: string;
  /** Margin around shimmer */
  margin?: string;
};

/**
 * Styled shimmer skeleton element
 */
export const Shimmer = styled.div<ShimmerProps>`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.muted} 0%,
    ${({ theme }) => theme.mutedForeground}20 50%,
    ${({ theme }) => theme.muted} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmerAnimation} 2s infinite;
  
  width: ${({ width = '100%' }) =>
    typeof width === 'number' ? `${width}px` : width};
  height: ${({ height = '20px' }) =>
    typeof height === 'number' ? `${height}px` : height};
  border-radius: ${({ borderRadius = '0.5rem' }) => borderRadius};
  margin: ${({ margin = '0' }) => margin};
`;

/**
 * Skeleton Loading Component
 * Displays multiple shimmer elements as loading placeholder
 */
type SkeletonProps = {
  /** Number of lines to display */
  lines?: number;
  /** Show avatar skeleton */
  showAvatar?: boolean;
};

/**
 * Styled container for skeleton lines
 */
const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

/**
 * Styled container for avatar and content
 */
const AvatarContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

/**
 * Styled avatar skeleton
 */
const AvatarSkeleton = styled(Shimmer)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
`;

/**
 * Skeleton Component
 * Renders placeholder loading state
 * @param {SkeletonProps} props - Component props
 * @returns {JSX.Element} Skeleton loader
 */
export const Skeleton = ({
  lines = 3,
  showAvatar = false,
}: SkeletonProps): JSX.Element => {
  return (
    <SkeletonContainer>
      {showAvatar && (
        <AvatarContainer>
          <AvatarSkeleton />
          <div style={{ flex: 1 }}>
            <Shimmer height={20} margin="0 0 0.5rem 0" />
            <Shimmer height={16} width="80%" />
          </div>
        </AvatarContainer>
      )}
      {Array.from({ length: lines }).map((_, index) => (
        <Shimmer
          key={index}
          height={16}
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </SkeletonContainer>
  );
};
