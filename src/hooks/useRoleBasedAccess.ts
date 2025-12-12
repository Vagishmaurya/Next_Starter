/**
 * Role-Based Access Control Hook
 * Provides utilities for checking user permissions and roles
 * Useful for conditional rendering and access control
 */

'use client';

import { useCallback, useMemo } from 'react';
import { UserRole } from '@/lib/api/types';
import { useUserStore } from '@/lib/stores/useUserStore';

/**
 * Role permission mapping
 * Defines which roles have access to which features
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'view_analytics',
    'manage_users',
    'manage_roles',
    'delete_content',
    'access_admin_panel',
  ],
  [UserRole.MODERATOR]: ['moderate_content', 'view_reports', 'manage_users'],
  [UserRole.USER]: ['view_profile', 'edit_profile', 'upload_content'],
  [UserRole.GUEST]: ['view_public_content'],
};

/**
 * useRoleBasedAccess Hook
 * Provides methods for checking user roles and permissions
 *
 * @returns Object containing permission checking methods
 *
 * @example
 * const { canAccess, canAccessPage, hasAllPermissions } = useRoleBasedAccess();
 *
 * if (canAccess('manage_users')) {
 *   // Render user management component
 * }
 */
export const useRoleBasedAccess = () => {
  const user = useUserStore((state) => state.user);

  /**
   * Checks if user has a specific permission
   * @param permission - Permission to check
   * @returns true if user has permission
   */
  const canAccess = useCallback(
    (permission: string): boolean => {
      if (!user) {
        return false;
      }
      const userPermissions = ROLE_PERMISSIONS[user.role] || [];
      return userPermissions.includes(permission);
    },
    [user]
  );

  /**
   * Checks if user can access multiple permissions (all required)
   * @param permissions - Array of permissions to check
   * @returns true if user has all permissions
   */
  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every((permission) => canAccess(permission));
    },
    [canAccess]
  );

  /**
   * Checks if user can access any of the permissions (at least one)
   * @param permissions - Array of permissions to check
   * @returns true if user has at least one permission
   */
  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some((permission) => canAccess(permission));
    },
    [canAccess]
  );

  /**
   * Checks if user is an admin
   * @returns true if user role is admin
   */
  const isAdmin = useMemo(() => {
    return user?.role === UserRole.ADMIN;
  }, [user]);

  /**
   * Checks if user is a moderator
   * @returns true if user role is moderator
   */
  const isModerator = useMemo(() => {
    return user?.role === UserRole.MODERATOR;
  }, [user]);

  /**
   * Gets all permissions for current user
   * @returns Array of user's permissions
   */
  const getUserPermissions = useCallback(() => {
    if (!user) {
      return [];
    }
    return ROLE_PERMISSIONS[user.role] || [];
  }, [user]);

  return {
    canAccess,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isModerator,
    getUserPermissions,
    currentUserRole: user?.role,
  };
};
