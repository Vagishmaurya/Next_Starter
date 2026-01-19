import type { WorkflowJob, WorkflowRun } from '@/lib/api/actions.service';
import { create } from 'zustand';

type ActionsStore = {
  workflowRuns: WorkflowRun[];
  selectedRun: WorkflowRun | null;
  selectedRunJobs: WorkflowJob[];
  jobLogs: Record<number, string>; // key: jobId, value: logs
  isLoading: boolean;
  isLoadingJobLogs: boolean;
  error: string | null;
  jobLogsError: string | null;
  owner: string;
  repository: string;
  pollingInterval: NodeJS.Timeout | null;

  setWorkflowRuns: (runs: WorkflowRun[]) => void;
  setSelectedRun: (run: WorkflowRun | null) => void;
  setSelectedRunJobs: (jobs: WorkflowJob[]) => void;
  setJobLogs: (jobId: number, logs: string) => void;
  clearJobLogs: () => void;
  setLoading: (loading: boolean) => void;
  setJobLogsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setJobLogsError: (error: string | null) => void;
  setRepository: (owner: string, repo: string) => void;
  setPollingInterval: (interval: NodeJS.Timeout | null) => void;
  reset: () => void;
};

export const useActionsStore = create<ActionsStore>((set) => ({
  workflowRuns: [],
  selectedRun: null,
  selectedRunJobs: [],
  jobLogs: {},
  isLoading: false,
  isLoadingJobLogs: false,
  error: null,
  jobLogsError: null,
  owner: '',
  repository: '',
  pollingInterval: null,

  setWorkflowRuns: (runs) => set({ workflowRuns: runs }),
  setSelectedRun: (run) => set({ selectedRun: run }),
  setSelectedRunJobs: (jobs) => set({ selectedRunJobs: jobs }),
  setJobLogs: (jobId, logs) =>
    set((state) => ({
      jobLogs: {
        ...state.jobLogs,
        [jobId]: logs,
      },
    })),
  clearJobLogs: () => set({ jobLogs: {} }),
  setLoading: (loading) => set({ isLoading: loading }),
  setJobLogsLoading: (loading) => set({ isLoadingJobLogs: loading }),
  setError: (error) => set({ error }),
  setJobLogsError: (error) => set({ jobLogsError: error }),
  setRepository: (owner, repo) => set({ owner, repository: repo }),
  setPollingInterval: (interval) => set({ pollingInterval: interval }),
  reset: () =>
    set({
      workflowRuns: [],
      selectedRun: null,
      selectedRunJobs: [],
      jobLogs: {},
      isLoading: false,
      isLoadingJobLogs: false,
      error: null,
      jobLogsError: null,
      owner: '',
      repository: '',
      pollingInterval: null,
    }),
}));
