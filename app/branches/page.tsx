import { Suspense } from 'react';
import BranchesPage from '@/components/branches/BranchesPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <BranchesPage />
    </Suspense>
  );
}
