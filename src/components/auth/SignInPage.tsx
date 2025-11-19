"use client"

import Image from 'next/image';
import { Github, Zap, GitBranch, Rocket } from 'lucide-react';
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Animated background elements with tech theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 dark:bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/20 dark:bg-cyan-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-purple-600/20 dark:bg-purple-500/10 blur-3xl" />
      </div>

      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(55,65,81,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(55,65,81,0.03)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,rgba(100,116,139,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.05)_1px,transparent_1px)]" />

      {/* Content container */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="space-y-8">
          {/* Header section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center mb-4">
              <Image
                src="/calance_logo.png"
                alt="Calance Logo"
                width={64}
                height={64}
                priority
                className="h-16 w-16 rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                Calance DevOps
              </h1>
              <p className="text-lg text-cyan-400 font-semibold">CI/CD Workflow Manager</p>
            </div>
            <p className="text-base text-slate-300">
              Deploy with confidence. Manage workflows seamlessly.
            </p>
          </div>

          {/* Features highlight */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-center hover:bg-white/10 transition-colors">
              <Rocket className="h-5 w-5 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Deploy</p>
            </div>
            <div className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-center hover:bg-white/10 transition-colors">
              <GitBranch className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Workflows</p>
            </div>
            <div className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-center hover:bg-white/10 transition-colors">
              <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Automate</p>
            </div>
          </div>

          {/* Card container */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 p-8 space-y-6">
            {/* Error Message Display */}
            {error && (
              <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="font-semibold text-sm text-red-900 dark:text-red-400">Authentication Error</p>
                <p className="text-sm text-red-700 dark:text-red-500">{error}</p>
              </div>
            )}

            {/* GitHub Sign-In Button */}
            <button
              onClick={handleGithubSignIn}
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center gap-3 text-base font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-0"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Github className="h-5 w-5" />
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>

            {/* Footer text */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}