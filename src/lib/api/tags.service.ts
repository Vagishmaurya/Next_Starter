/**
 * Tags Service
 * Handles all tag-related API calls
 * Uses apiClient for automatic JWT token handling
 */

import { apiClient } from './client';

export type Tag = {
  name: string;
  zipball_url: string;
  tarball_url: string;
  commit: {
    sha: string;
    url: string;
  };
  node_id: string;
};

/**
 * API Response interface for tags endpoint
 */
type TagsApiResponse = {
  status: string;
  message: string;
  data: {
    owner: string;
    repository: string;
    tags: Tag[];
    tag_count: number;
  };
};

/**
 * Tags Service Object
 * Provides methods for tag operations
 */
export const tagsService = {
  /**
   * Fetch all tags for a repository
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Tags response data
   * @throws Error if fetch fails
   */
  async fetchTags(owner: string, repo: string): Promise<TagsApiResponse> {
    try {
      const response = await apiClient.get<TagsApiResponse>(`/repositories/${owner}/${repo}/tags`);

      return response.data;
    } catch (error) {
      console.error('[TagsService] Error fetching tags:', error);
      throw error;
    }
  },
};
