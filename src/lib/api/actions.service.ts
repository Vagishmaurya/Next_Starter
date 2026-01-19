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
 * Workflow definition
 */
export type Workflow = {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  downloadUrl: string;
  // Optional fields that might be added by frontend
  id?: number;
  state?: 'active' | 'inactive';
  badge_url?: string;
  html_url?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * API Response interface for workflows list endpoint
 */
type WorkflowsApiResponse = {
  success: boolean;
  message: string;
  data: {
    count: number;
    owner: string;
    repository: string;
    workflows: Workflow[];
  };
};

/**
 * Create Workflow Request Types
 */
export type EC2CommonFields = {
  credentialId: string;
  awsRegion: string;
  jenkinsJobs: string;
  releaseTag?: string;
  codeownersEmails: string;
  devopsStakeholdersEmails?: string;
};

export type KubernetesCommonFields = {
  jenkinsJobName: string;
  releaseTag: string;
  helmValuesRepository: string;
  codeownersEmailIds: string;
  devopsStakeholdersEmailIds?: string;
};

export type KubernetesProject = {
  id: string;
  name: string;
};

export type EC2Project = {
  id: string;
  name: string;
  command?: string;
  port: string;
  dockerNetwork?: string;
  mountPath?: string;
  enableGpu: boolean;
  logDriver: string;
  logDriverOptions?: string;
};

export type Project = {
  id: string;
  name: string;
  dockerContextPath?: string;
  dockerfilePath?: string;
  dotEnvTesting?: string;
  dotEnvProduction?: string;
};

export type CreateWorkflowRequest = {
  owner: string;
  repository: string;
  workflowName: string;
  deploymentType: 'kubernetes' | 'ec2';
  projects: Project[];
  ec2CommonFields?: EC2CommonFields;
  ec2Projects?: EC2Project[];
  kubernetesCommonFields?: KubernetesCommonFields;
  kubernetesProjects?: KubernetesProject[];
};

export type CreateWorkflowResponse = {
  success: boolean;
  message: string;
  data: {
    workflow: {
      id: number;
      name: string;
      path: string;
      state: string;
      created_at: string;
      updated_at: string;
    };
    deploymentType: string;
    projectsCount: number;
  };
};

export type PreviewWorkflowResponse = {
  success: boolean;
  message: string;
  data: {
    workflow_name: string;
    deployment_type: string;
    yaml_content: string;
  };
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
 * API Response interface for job logs endpoint
 */
type JobLogsApiResponse = {
  success: boolean;
  message: string;
  data: {
    owner: string;
    repository: string;
    job_id: number;
    logs: string;
  };
};

/**
 * GitHub Actions Service Object
 * Provides methods for workflow operations
 */
export const actionsService = {
  /**
   * Preview a workflow before creation
   *
   * @param workflowData - Workflow preview data
   * @returns Preview workflow response with YAML content
   * @throws Error if preview generation fails
   */
  async previewWorkflow(workflowData: CreateWorkflowRequest): Promise<PreviewWorkflowResponse> {
    try {
      const response = await apiClient.post<PreviewWorkflowResponse>(
        `/workflows/preview`,
        workflowData
      );

      return response.data;
    } catch (error) {
      console.error('[ActionsService] Error previewing workflow:', error);
      throw error;
    }
  },

  /**
   * Create a new workflow
   *
   * @param workflowData - Workflow creation data
   * @returns Create workflow response
   * @throws Error if creation fails
   */
  async createWorkflow(workflowData: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
    try {
      const response = await apiClient.post<CreateWorkflowResponse>(
        `/workflows/create`,
        workflowData
      );

      return response.data;
    } catch (error) {
      console.error('[ActionsService] Error creating workflow:', error);
      throw error;
    }
  },

  /**
   * Fetch workflows for a repository
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Workflows response data
   * @throws Error if fetch fails
   */
  async fetchWorkflows(owner: string, repo: string): Promise<WorkflowsApiResponse> {
    try {
      const response = await apiClient.get<WorkflowsApiResponse>(`/workflows/${owner}/${repo}`);

      return response.data;
    } catch (error) {
      console.error('[ActionsService] Error fetching workflows:', error);
      throw error;
    }
  },

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
   * Fetch logs for a specific workflow job
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param jobId - Job ID
   * @returns Job logs response data
   * @throws Error if fetch fails
   */
  async fetchJobLogs(owner: string, repo: string, jobId: number): Promise<JobLogsApiResponse> {
    try {
      const response = await apiClient.get<JobLogsApiResponse>(
        `/repositories/${owner}/${repo}/actions/jobs/${jobId}/logs`
      );

      return response.data;
    } catch (error) {
      console.error('[ActionsService] Error fetching job logs:', error);
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
