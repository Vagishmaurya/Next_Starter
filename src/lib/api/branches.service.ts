/**
 * Branches Service
 * Handles all branch and commit-related API calls
 * Uses apiClient for automatic JWT token handling
 */

import axios from 'axios';
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

export type PullRequest = {
  number: number;
  title: string;
  state: string;
  url: string;
  branch: string;
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
 * API Response interface for PRs endpoint
 */
type PRsApiResponse = {
  status: number;
  message: string;
  data: {
    count: number;
    owner: string;
    prs: PullRequest[];
    repository: string;
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
  async fetchBranches(
    owner: string,
    repo: string,
    signal?: AbortSignal
  ): Promise<BranchesApiResponse> {
    try {
      const response = await apiClient.get<BranchesApiResponse>(
        `/auth/repositories/${owner}/${repo}/branches`,
        { signal }
      );

      return response.data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('[BranchesService] Error fetching branches:', error);
      }
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
    perPage: number = 30,
    signal?: AbortSignal
  ): Promise<CommitsApiResponse> {
    try {
      const response = await apiClient.get<CommitsApiResponse>(
        `/repositories/${owner}/${repo}/commits`,
        {
          params: {
            branch,
            page,
            per_page: perPage,
          },
          signal,
        }
      );

      return response.data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('[BranchesService] Error fetching commits:', error);
      }
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
   * @param tagData.tag_name - The name of the tag
   * @param tagData.tag_message - The message for the tag
   * @param tagData.tag_type - The type of the tag
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

  /**
   * Fetch PRs for a specific repository
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns PRs response data
   * @throws Error if fetch fails
   */
  async fetchPRs(owner: string, repo: string, signal?: AbortSignal): Promise<PRsApiResponse> {
    try {
      const response = await apiClient.get<PRsApiResponse>(`/workflows/${owner}/${repo}/prs`, {
        signal,
      });

      return response.data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('[BranchesService] Error fetching PRs:', error);
      }
      throw error;
    }
  },
};
