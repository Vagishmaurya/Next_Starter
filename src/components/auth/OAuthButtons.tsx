/**
 * OAuth Authentication Buttons Component
 * Displays provider buttons for single sign-on authentication
 * Supports Google, GitHub, and Microsoft OAuth providers
 */

'use client';

import { useOAuth } from '@/hooks/useOAuth';
import { Button } from '@/components/ui/styled/Button';
import { Github, Globe } from 'lucide-react';
import { OAuthProvider } from '@/lib/api/types';
import styled from 'styled-components';

/**
 * OAuth provider configurations with icons
 */
const OAUTH_PROVIDERS: Array<{
  id: OAuthProvider;
  label: string;
  icon: typeof Github;
}> = [
  { id: 'google', label: 'Google', icon: Globe },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'microsoft', label: 'Microsoft', icon: Globe },
];

interface OAuthButtonsProps {
  /** Title displayed above buttons */
  title?: string;
}

const OAuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DividerContainer = styled.div`
  position: relative;
`;

const DividerLine = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.border};
  }
`;

const DividerText = styled.span`
  position: relative;
  display: flex;
  justify-content: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  background-color: ${({ theme }) => theme.background};
  padding: 0 0.5rem;
  color: ${({ theme }) => theme.mutedForeground};
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

const IconButton = styled(Button)`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * OAuthButtons Component
 * Renders OAuth provider buttons for SSO authentication
 * 
 * @example
 * <OAuthButtons title="Sign in with" />
 */
export const OAuthButtons = ({ title = 'Or continue with' }: OAuthButtonsProps) => {
  const { initiateOAuth, isLoading } = useOAuth();

  /**
   * Handles OAuth provider button click
   */
  const handleProviderClick = (provider: OAuthProvider) => {
    initiateOAuth(provider);
  };

  return (
    <OAuthContainer>
      {title && (
        <DividerContainer>
          <DividerLine />
          <DividerText>{title}</DividerText>
        </DividerContainer>
      )}

      <ButtonGrid>
        {OAUTH_PROVIDERS.map(({ id, label, icon: Icon }) => (
          <IconButton
            key={id}
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => handleProviderClick(id)}
            title={label}
          >
            <Icon size={16} />
          </IconButton>
        ))}
      </ButtonGrid>
    </OAuthContainer>
  );
};
