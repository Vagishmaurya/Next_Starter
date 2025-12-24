/**
 * GitHub Actions Service
 * Handles all GitHub Actions workflow-related API calls
 * Uses apiClient for automatic JWT token handling
 */

import { apiClient } from './client';

/**
 * Workflow Actor (user who triggered the workflow)
 */
export type WorkflowActor = {
  login: string;
  id: number;
  avatar_url: string;
};

/**
 * Workflow Run
 */
export type WorkflowRun = {
  id: number;
  name: string;
  display_title: string;
  status: 'queued' | 'in_progress' | 'completed' | 'waiting';
  conclusion:
    | 'success'
    | 'failure'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null;
  head_branch: string;
  head_sha: string;
  run_number: number;
  event: string;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  html_url: string;
  actor: WorkflowActor;
  workflow_id: number;
  path: string;
};

/**
 * Workflow Job Step
 */
export type WorkflowStep = {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion:
    | 'success'
    | 'failure'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null;
  number: number;
  started_at: string;
  completed_at: string;
};

/**
 * Workflow Job
 */
export type WorkflowJob = {
  id: number;
  run_id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion:
    | 'success'
    | 'failure'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null;
  started_at: string;
  completed_at: string;
  steps: WorkflowStep[];
};

/**
 * API Response interface for workflow runs list endpoint
 */
type WorkflowRunsApiResponse = {
  success: boolean;
  message: string;
  data: {
    owner: string;
    repository: string;
    runs: WorkflowRun[];
    run_count: number;
  };
};

/**
 * API Response interface for workflow run detail endpoint
 */
type WorkflowRunDetailApiResponse = {
  success: boolean;
  message: string;
  data: {
    owner: string;
    repository: string;
    run: WorkflowRun;
    jobs: WorkflowJob[];
    job_count: number;
  };
};

/**
 * GitHub Actions Service Object
 * Provides methods for workflow operations
 */
export const actionsService = {
  /**
   * Fetch workflow runs for a repository
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param perPage - Number of results per page (max: 100)
   * @returns Workflow runs response data
   * @throws Error if fetch fails
   */
  async fetchWorkflowRuns(
    owner: string,
    repo: string,
    perPage: number = 30
  ): Promise<WorkflowRunsApiResponse> {
    try {
      const response = await apiClient.get<WorkflowRunsApiResponse>(
        `/repositories/${owner}/${repo}/actions/runs`,
        {
          params: {
            per_page: perPage,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[ActionsService] Error fetching workflow runs:', error);
      throw error;
    }
  },

  /**
   * Fetch detailed information about a specific workflow run
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param runId - Workflow run ID
   * @returns Workflow run detail response data
   * @throws Error if fetch fails
   */
  async fetchWorkflowRunDetail(
    owner: string,
    repo: string,
    runId: number
  ): Promise<WorkflowRunDetailApiResponse> {
    try {
      const response = await apiClient.get<WorkflowRunDetailApiResponse>(
        `/repositories/${owner}/${repo}/actions/runs/${runId}`
      );

      return response.data;
    } catch (error) {
      console.error('[ActionsService] Error fetching workflow run detail:', error);
      throw error;
    }
  },

  /**
   * Get status color for workflow based on status and conclusion
   *
   * @param status - Workflow status
   * @param conclusion - Workflow conclusion (null if not completed)
   * @returns Color code for the status
   */
  getWorkflowStatusColor(status: string, conclusion: string | null): string {
    // Yellow - In Progress/Pending
    if (status === 'queued' || status === 'in_progress' || status === 'waiting') {
      return '#FFA500'; // Yellow/Orange
    }

    // Green - Success
    if (status === 'completed') {
      if (conclusion === 'success' || conclusion === 'skipped') {
        return '#28A745'; // Green
      }
      // Red - Failure/Cancelled/Error
      return '#DC3545'; // Red
    }

    return '#6C757D'; // Gray - Unknown
  },

  /**
   * Get status badge variant for workflow
   *
   * @param status - Workflow status
   * @param conclusion - Workflow conclusion (null if not completed)
   * @returns Badge variant string
   */
  getWorkflowStatusBadge(
    status: string,
    conclusion: string | null
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'queued' || status === 'in_progress' || status === 'waiting') {
      return 'secondary'; // Yellow/Orange
    }

    if (status === 'completed') {
      if (conclusion === 'success' || conclusion === 'skipped') {
        return 'default'; // Green
      }
      return 'destructive'; // Red
    }

    return 'outline'; // Gray - Unknown
  },
};
