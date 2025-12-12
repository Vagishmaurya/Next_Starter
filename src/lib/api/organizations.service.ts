/**
 * Organizations Service
 * Handles all organization-related API calls
 * Manages fetching user organizations and their data
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export type Organization = {
  id: number;
  login: string;
  avatar_url: string;
  description?: string;
  name?: string;
  type?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
};

export type Repository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  url: string;
  html_url: string;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
};

/**
 * API Response interface for organizations endpoint
 */
type OrganizationsApiResponse = {
  success: boolean;
  message: string;
  data: {
    organization_count: number;
    organizations: Organization[];
    user: string;
  };
};

/**
 * API Response interface for repositories endpoint
 */
type RepositoriesApiResponse = {
  success: boolean;
  message: string;
  data: {
    repositories_count: number;
    repositories: Repository[];
  };
};

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
        API_ENDPOINTS.AUTH.ORGANIZATIONS,
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
        `/api/auth/organizations/${orgName}`,
      );

      console.log('[OrganizationsService] Organization fetched successfully');
      return response.data;
    } catch (error) {
      console.error('[OrganizationsService] Error fetching organization:', error);
      throw error;
    }
  },

  /**
   * Fetch repositories for a specific organization
   *
   * @param orgName - Organization login/name
   * @returns Array of repositories
   * @throws Error if fetch fails
   */
  async fetchOrganizationRepositories(orgName: string): Promise<Repository[]> {
    try {
      console.log('[OrganizationsService] Fetching repositories for organization:', orgName);
      const response = await apiClient.get<RepositoriesApiResponse>(
        `/auth/organizations/${orgName}/repositories`,
      );

      console.log('[OrganizationsService] API Response:', response.data);

      // Extract repositories array from response wrapper
      const repositories = response.data.data?.repositories || [];

      console.log('[OrganizationsService] Repositories fetched successfully:', repositories.length, 'repositories');
      return repositories;
    } catch (error) {
      console.error('[OrganizationsService] Error fetching repositories:', error);
      throw error;
    }
  },
};
