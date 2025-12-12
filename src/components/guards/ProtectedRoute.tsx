/**
 * Protected Route Component
 * Renders children only if user has required permissions
 * Useful for role-based access control in routes
 */

'use client';

import type { ReactNode } from 'react';
import type { UserRole } from '@/lib/api/types';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

type ProtectedRouteProps = {
  /** Component to render if user is authorized */
  children: ReactNode;
  /** Required roles for access */
  requiredRoles?: UserRole[];
  /** Required permissions for access */
  requiredPermissions?: string[];
  /** Fallback component if user is not authorized */
  fallback?: ReactNode;
  /** If true, requires all permissions; if false, requires any one */
  requireAll?: boolean;
};

/**
 * ProtectedRoute Component
 * Conditionally renders content based on user role and permissions
 *
 * @example
 * <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({
  children,
  requiredRoles,
  requiredPermissions,
  fallback = null,
  requireAll = true,
}: ProtectedRouteProps) => {
  const { hasAnyPermission, hasAllPermissions, currentUserRole } = useRoleBasedAccess();

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(currentUserRole as UserRole);
    if (!hasRequiredRole) {
      console.warn('[ProtectedRoute] User does not have required role');
      return fallback;
    }
  }

  // Check permission-based access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      console.warn('[ProtectedRoute] User does not have required permissions');
      return fallback;
    }
  }

  return children;
};
