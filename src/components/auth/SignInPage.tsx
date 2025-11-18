"use client"

import { Github } from 'lucide-react';
import { Button } from '@/components/ui/styled/Button';

export default function SignInPage() {
  const handleGithubSignIn = async () => {
    try {
      // Add your GitHub OAuth logic here
      console.log('GitHub sign in clicked');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-foreground/60">Sign in to your account to continue</p>
        </div>
        <Button
          onClick={handleGithubSignIn}
          className="w-full flex items-center justify-center gap-2"
          variant="outline"
        >
          <Github className="h-5 w-5" />
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}
