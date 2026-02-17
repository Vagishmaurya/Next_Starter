import { apiClient } from './client';

export type Package = {
  id: string;
  name: string;
  package_type: string;
  owner: {
    login: string;
    id: number;
    avatar_url?: string;
    type?: string;
  };
  version_count: number;
  visibility: 'public' | 'private';
  url: string;
  created_at: string;
  updated_at: string;
  description?: string;
  html_url: string;
  repository?: {
    id: number;
    name: string;
    full_name: string;
  };
};

export type PackagesResponse = {
  data: {
    packages: Package[];
    total_count?: number;
  };
  message?: string;
};

class PackagesService {
  /**
   * Get all packages for the authenticated user
   */
  async fetchAllPackages(packageType: string = 'npm'): Promise<PackagesResponse> {
    try {
      const response = await apiClient.get('/packages/user', {
        params: {
          package_type: packageType,
        },
      });
      return {
        data: {
          packages: response.data?.data?.packages || [],
          total_count: response.data?.data?.package_count || 0,
        },
        message: response.data?.message || 'Packages fetched successfully',
      };
    } catch (error: any) {
      console.error('Failed to fetch packages:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch packages');
    }
  }

  /**
   * Get organization's container packages
   * @param organization - The organization name
   * @param packageType - Optional package type filter (default: 'container')
   */
  async fetchOrganizationPackages(
    organization: string,
    packageType: string = 'container'
  ): Promise<PackagesResponse> {
    try {
      const response = await apiClient.get(`/packages/org/${organization}`, {
        params: {
          package_type: packageType,
        },
      });
      return {
        data: {
          packages: response.data?.data?.packages || [],
          total_count: response.data?.data?.package_count || 0,
        },
        message: response.data?.message || 'Organization packages fetched successfully',
      };
    } catch (error: any) {
      console.error('Failed to fetch organization packages:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch organization packages');
    }
  }

  /**
   * Get packages for a specific repository
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param packageType - Optional package type filter
   */
  async fetchRepositoryPackages(
    owner: string,
    repo: string,
    packageType?: string
  ): Promise<PackagesResponse> {
    try {
      const params = packageType ? { package_type: packageType } : {};
      const response = await apiClient.get(`/repositories/${owner}/${repo}/packages`, { params });
      return {
        data: {
          packages: response.data || [],
          total_count: response.data?.length || 0,
        },
        message: 'Repository packages fetched successfully',
      };
    } catch (error: any) {
      console.error('Failed to fetch repository packages:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch repository packages');
    }
  }
}

export const packagesService = new PackagesService();
