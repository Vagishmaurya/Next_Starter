/**
 * Admin Dashboard Content Component
 * Displays admin-specific information and controls
 * Uses role-based access for feature visibility
 */

'use client';

import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/api/types';
import { RoleManager } from '@/components/rbac/RoleManager';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { Card, CardTitle, CardContent } from '@/components/ui/styled/Card';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.mutedForeground};
`;

const InfoValue = styled.span`
  font-weight: 500;
`;

const AdminSection = styled(Card)`
  background-color: ${({ theme }) => `${theme.info}10`};
  border: 1px solid ${({ theme }) => `${theme.info}40`};
`;

const AdminTitle = styled(CardTitle)`
  color: ${({ theme }) => theme.info};
`;

const AdminList = styled.ul`
  list-style: disc;
  list-style-position: inside;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  li {
    color: ${({ theme }) => theme.mutedForeground};
  }
`;

const ModeratorSection = styled(Card)`
  background-color: ${({ theme }) => `${theme.accent}10`};
  border: 1px solid ${({ theme }) => `${theme.accent}40`};
`;

const ModeratorTitle = styled(CardTitle)`
  color: ${({ theme }) => theme.accent};
`;

const ErrorSection = styled(Card)`
  background-color: ${({ theme }) => `${theme.destructive}10`};
  border: 1px solid ${({ theme }) => `${theme.destructive}40`};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.destructive};
  margin: 0;
`;

/**
 * AdminDashboardContent Component
 * 
 * Features:
 * - User information display
 * - Role and permissions overview
 * - Admin-only sections for ADMIN role users
 * - RBAC demonstration
 */
export const AdminDashboardContent = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentUserRole, getPermissionsForRole } = useRoleBasedAccess();

  if (!isAuthenticated || !user) {
    return (
      <ErrorSection>
        <ErrorText>
          Please sign in to access the dashboard.
        </ErrorText>
      </ErrorSection>
    );
  }

  return (
    <DashboardContainer>
      {/* User Info Card */}
      <Card>
        <CardTitle>User Information</CardTitle>
        <CardContent>
          <InfoGrid>
            <InfoRow>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{user.email}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>User ID:</InfoLabel>
              <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {user.id}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Current Role:</InfoLabel>
              <InfoValue>{currentUserRole}</InfoValue>
            </InfoRow>
          </InfoGrid>
        </CardContent>
      </Card>

      {/* Permissions Overview */}
      <Card>
        <CardTitle>Permissions</CardTitle>
        <CardContent>
          <RoleManager />
        </CardContent>
      </Card>

      {/* Admin Only Section */}
      <ProtectedRoute
        requiredRoles={[UserRole.ADMIN]}
        fallback={
          <Card style={{ 
            backgroundColor: `var(--warning-light)`,
            borderColor: `var(--warning)`
          }}>
            <p style={{ margin: 0 }}>
              Admin section - Only ADMIN role users can access this.
            </p>
          </Card>
        }
      >
        <AdminSection>
          <AdminTitle>Admin Controls</AdminTitle>
          <CardContent>
            <p>You have admin access! Manage your application here.</p>
            <AdminList>
              <li>User management</li>
              <li>System settings</li>
              <li>Analytics and reports</li>
              <li>Role and permission management</li>
            </AdminList>
          </CardContent>
        </AdminSection>
      </ProtectedRoute>

      {/* Moderator Only Section */}
      <ProtectedRoute
        requiredRoles={[UserRole.MODERATOR]}
        fallback={null}
      >
        <ModeratorSection>
          <ModeratorTitle>Moderator Tools</ModeratorTitle>
          <CardContent>
            <p>Content moderation and user management tools available.</p>
          </CardContent>
        </ModeratorSection>
      </ProtectedRoute>
    </DashboardContainer>
  );
};
