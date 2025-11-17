/**
 * Role Manager Component
 * Displays current user role and manages role-based access information
 * Shows available permissions for current role
 */

'use client';

import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import { UserRole } from '@/lib/api/types';

/**
 * Role descriptions
 */
const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Full access to all features and administration tools',
  [UserRole.MODERATOR]: 'Can moderate content and manage users',
  [UserRole.USER]: 'Regular user with standard permissions',
  [UserRole.GUEST]: 'Limited access to public content only',
};

/**
 * Role priority colors
 */
const ROLE_COLORS: Record<UserRole, 'destructive' | 'secondary' | 'default' | 'outline'> = {
  [UserRole.ADMIN]: 'destructive',
  [UserRole.MODERATOR]: 'secondary',
  [UserRole.USER]: 'default',
  [UserRole.GUEST]: 'outline',
};

/**
 * RoleManager Component
 * Displays role information and available permissions
 * 
 * @example
 * <RoleManager />
 */
export const RoleManager = () => {
  const {
    currentUserRole,
    getUserPermissions,
    isAdmin,
    isModerator,
  } = useRoleBasedAccess();

  if (!currentUserRole) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          No role information available
        </p>
      </Card>
    );
  }

  const permissions = getUserPermissions();
  const roleColor = ROLE_COLORS[currentUserRole];

  return (
    <Card className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Your Role</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={roleColor} className="capitalize">
            {currentUserRole}
          </Badge>
          {isAdmin && <Badge variant="destructive">Administrator</Badge>}
          {isModerator && <Badge variant="secondary">Moderator</Badge>}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {ROLE_DESCRIPTIONS[currentUserRole]}
        </p>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Your Permissions</h4>
        {permissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {permissions.map((permission) => (
              <div
                key={permission}
                className="flex items-center gap-2 rounded-md bg-muted p-2.5 text-sm"
              >
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="capitalize">{permission.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No permissions available for this role
          </p>
        )}
      </div>
    </Card>
  );
};
