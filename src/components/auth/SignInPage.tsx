"use client"

import { Github } from 'lucide-react';
import { Button } from '@/components/ui/styled/Button';
import { useGitHubSignInViewModel } from '@/viewmodels/GitHubSignInViewModel';

/**
 * SignInPage Component
 * 
 * View Layer in MVVM Pattern
 * Displays GitHub sign-in UI
 * Delegates state management to ViewModel
 * 
 * Flow:
 * 1. User clicks "Continue with GitHub" button
 * 2. Component calls ViewModel.initiateGithubSignIn()
 * 3. ViewModel calls service.initiateGithubOAuth()
 * 4. Service redirects to backend /api/auth/github
 * 5. Backend handles GitHub OAuth protocol
 * 6. User authenticates on GitHub
 * 7. Backend redirects to /auth/callback with JWT
 * 8. Frontend stores JWT and redirects to dashboard
 */
export default function SignInPage() {
  const { initiateGithubSignIn, isLoading, error, clearError } = useGitHubSignInViewModel();

  const handleGithubSignIn = async () => {
    clearError();
    try {
      console.log('[SignInPage] GitHub sign-in button clicked');
      // Delegate to ViewModel
      // ViewModel calls service which redirects to backend
      await initiateGithubSignIn();
      // Note: User will be redirected to GitHub OAuth page
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with GitHub';
      console.error('[SignInPage] Error:', errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-foreground/60">Sign in to your account to continue</p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Authentication Error</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* GitHub Sign-In Button */}
        <Button
          onClick={handleGithubSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2"
          variant="outline"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing in...
            </>
          ) : (
            <>
              <Github className="h-5 w-5" />
              Continue with GitHub
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
