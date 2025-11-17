/**
 * User Dashboard Content Component
 * Displays user-specific information and features
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * UserDashboardContent Component
 * Basic dashboard content for regular users
 */
export const UserDashboardContent = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Welcome</h2>
        <p className="text-foreground/80">
          Hello {user.email}! You are logged in successfully.
        </p>
      </Card>
    </div>
  );
};
