/**
 * Card Component with Styled Components
 * Container for grouped content
 * @module components/ui/styled/Card
 */

import styled from 'styled-components';

/**
 * Props for Card component
 */
type CardProps = {
  /** Padding inside card */
  padding?: string;
  /** Border style */
  border?: boolean;
};

/**
 * Styled card container
 */
export const Card = styled.div<CardProps>`
  background-color: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.cardForeground};
  border-radius: 0.5rem;
  padding: ${({ padding = '1.5rem' }) => padding};
  ${({ border = true, theme }) => (border ? `border: 1px solid ${theme.border};` : '')}
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

/**
 * Styled card title
 */
export const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

/**
 * Styled card description
 */
export const CardDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mutedForeground};
  margin: 0.25rem 0 0 0;
`;

/**
 * Styled card content
 */
export const CardContent = styled.div`
  margin-top: 1rem;
`;
