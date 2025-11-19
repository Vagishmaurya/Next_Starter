/**
 * Organizations Service
 * Handles all organization-related API calls
 * Manages fetching user organizations and their data
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface Organization {
  id: number;
  login: string;
  avatar_url: string;
  description?: string;
  name?: string;
  type?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
}

/**
 * API Response interface for organizations endpoint
 */
interface OrganizationsApiResponse {
  success: boolean;
  message: string;
  data: {
    organization_count: number;
    organizations: Organization[];
    user: string;
  };
}

/**
 * Organizations Service Object
 * Provides methods for organization operations
 */
export const organizationsService = {
  /**
   * Fetch all organizations for the authenticated user
   * 
   * @returns Array of organizations
   * @throws Error if fetch fails
   */
  async fetchUserOrganizations(): Promise<Organization[]> {
    try {
      console.log('[OrganizationsService] Fetching user organizations');
      const response = await apiClient.get<OrganizationsApiResponse>(
        API_ENDPOINTS.AUTH.ORGANIZATIONS
      );

      console.log('[OrganizationsService] API Response:', response.data);
      
      // Extract organizations array from response wrapper
      const organizations = response.data.data?.organizations || [];
      
      console.log('[OrganizationsService] Organizations fetched successfully:', organizations.length, 'organizations');
      return organizations;
    } catch (error) {
      console.error('[OrganizationsService] Error fetching organizations:', error);
      throw error;
    }
  },

  /**
   * Fetch organization details by name
   * 
   * @param orgName - Organization login/name
   * @returns Organization data
   * @throws Error if fetch fails
   */
  async fetchOrganization(orgName: string): Promise<Organization> {
    try {
      console.log('[OrganizationsService] Fetching organization:', orgName);
      const response = await apiClient.get<Organization>(
        `/api/auth/organizations/${orgName}`
      );

      console.log('[OrganizationsService] Organization fetched successfully');
      return response.data;
    } catch (error) {
      console.error('[OrganizationsService] Error fetching organization:', error);
      throw error;
    }
  },
};
