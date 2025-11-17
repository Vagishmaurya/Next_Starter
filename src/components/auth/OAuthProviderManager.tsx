/**
 * OAuth Provider Manager Component
 * Allows users to link and unlink OAuth providers to their account
 * Displays connected providers and manages authentication methods
 */

'use client';

import { useEffect } from 'react';
import { useOAuth } from '@/hooks/useOAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Github, Globe, AlertCircle } from 'lucide-react';
import { OAuthProvider } from '@/lib/api/types';

/**
 * Provider icon mapping
 */
const PROVIDER_ICONS: Record<OAuthProvider, typeof Github> = {
  google: Globe,
  github: Github,
  microsoft: Globe,
};

/**
 * Provider display names
 */
const PROVIDER_NAMES: Record<OAuthProvider, string> = {
  google: 'Google',
  github: 'GitHub',
  microsoft: 'Microsoft',
};

/**
 * Available providers for connection
 */
const AVAILABLE_PROVIDERS: OAuthProvider[] = ['google', 'github', 'microsoft'];

/**
 * OAuthProviderManager Component
 * Displays and manages connected OAuth providers
 * 
 * @example
 * <OAuthProviderManager />
 */
export const OAuthProviderManager = () => {
  const {
    connectedProviders,
    isLoading,
    error,
    fetchConnectedProviders,
    linkProvider,
    unlinkProvider,
    isProviderConnected,
  } = useOAuth();

  // Fetch connected providers on mount
  useEffect(() => {
    fetchConnectedProviders();
  }, [fetchConnectedProviders]);

  /**
   * Handles linking a new OAuth provider
   */
  const handleLinkProvider = async (provider: OAuthProvider) => {
    try {
      // In a real implementation, you would redirect to OAuth provider first
      // and get the authorization code back
      const code = ''; // This would come from the OAuth callback
      await linkProvider(provider, code);
    } catch (err) {
      console.error('Failed to link provider:', err);
    }
  };

  /**
   * Handles unlinking an OAuth provider
   */
  const handleUnlinkProvider = async (provider: OAuthProvider) => {
    if (connectedProviders.length <= 1) {
      console.error('Cannot unlink the last authentication method');
      return;
    }
    await unlinkProvider(provider);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Connected Authentication Methods</h3>
        <p className="text-sm text-muted-foreground">
          Manage your OAuth provider connections
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        {AVAILABLE_PROVIDERS.map((provider) => {
          const Icon = PROVIDER_ICONS[provider];
          const isConnected = isProviderConnected(provider);

          return (
            <div
              key={provider}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{PROVIDER_NAMES[provider]}</p>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isConnected && (
                  <Badge variant="secondary">Connected</Badge>
                )}
                <Button
                  variant={isConnected ? 'destructive' : 'default'}
                  size="sm"
                  disabled={isLoading}
                  onClick={() =>
                    isConnected
                      ? handleUnlinkProvider(provider)
                      : handleLinkProvider(provider)
                  }
                >
                  {isLoading ? 'Loading...' : isConnected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {connectedProviders.length <= 1 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          Note: You must keep at least one authentication method connected to your account.
        </div>
      )}
    </div>
  );
};
