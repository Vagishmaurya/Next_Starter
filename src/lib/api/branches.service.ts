/**
 * Branches Service
 * Handles all branch and commit-related API calls
 * Uses apiClient for automatic JWT token handling
 */

import { apiClient } from './client';

export type Commit = {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    comment_count: number;
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
  } | null;
  committer: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
  } | null;
  parents: any[];
};

export type Branch = {
  name: string;
  protected: boolean;
  commit: {
    sha: string;
    url: string;
  };
};

/**
 * API Response interface for branches endpoint
 */
type BranchesApiResponse = {
  status: string;
  message: string;
  data: {
    owner: string;
    repository: string;
    branches: Branch[];
    branch_count: number;
  };
};

/**
 * API Response interface for commits endpoint
 */
type CommitsApiResponse = {
  status: string;
  message: string;
  data: {
    owner: string;
    repository: string;
    branch: string;
    commits: Commit[];
    commit_count: number;
    page: number;
    per_page: number;
  };
};

/**
 * Branches Service Object
 * Provides methods for branch and commit operations
 */
export const branchesService = {
  /**
   * Fetch all branches for a repository
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Branches response data
   * @throws Error if fetch fails
   */
  async fetchBranches(owner: string, repo: string): Promise<BranchesApiResponse> {
    try {
      const response = await apiClient.get<BranchesApiResponse>(
        `/auth/repositories/${owner}/${repo}/branches`
      );

      return response.data;
    } catch (error) {
      console.error('[BranchesService] Error fetching branches:', error);
      throw error;
    }
  },

  /**
   * Fetch commits for a specific branch
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param branch - Branch name
   * @param page - Page number for pagination
   * @param perPage - Items per page
   * @returns Commits response data
   * @throws Error if fetch fails
   */
  async fetchCommits(
    owner: string,
    repo: string,
    branch: string,
    page: number = 1,
    perPage: number = 30
  ): Promise<CommitsApiResponse> {
    try {
      const response = await apiClient.get<CommitsApiResponse>(
        `/auth/repositories/${owner}/${repo}/branches/${branch}/commits`,
        {
          params: {
            page,
            per_page: perPage,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[BranchesService] Error fetching commits:', error);
      throw error;
    }
  },

  /**
   * Create a tag for a specific commit
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param commitSha - Commit SHA to tag
   * @param tagData - Tag creation data
   * @returns Tag creation response
   * @throws Error if tag creation fails
   */
  async createTag(
    owner: string,
    repo: string,
    commitSha: string,
    tagData: {
      tag_name: string;
      tag_message: string;
      tag_type: string;
    }
  ): Promise<any> {
    try {
      const response = await apiClient.post(`/repositories/tags`, {
        owner,
        repo,
        commit_sha: commitSha,
        tag_name: tagData.tag_name,
        tag_message: tagData.tag_message,
      });

      return response.data;
    } catch (error) {
      console.error('[BranchesService] Error creating tag:', error);
      throw error;
    }
  },
};
