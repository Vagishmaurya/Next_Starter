import type { WorkflowJob, WorkflowRun } from '@/lib/api/actions.service';
import { create } from 'zustand';

type ActionsStore = {
  workflowRuns: WorkflowRun[];
  selectedRun: WorkflowRun | null;
  selectedRunJobs: WorkflowJob[];
  isLoading: boolean;
  error: string | null;
  owner: string;
  repository: string;
  pollingInterval: NodeJS.Timeout | null;

  setWorkflowRuns: (runs: WorkflowRun[]) => void;
  setSelectedRun: (run: WorkflowRun | null) => void;
  setSelectedRunJobs: (jobs: WorkflowJob[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRepository: (owner: string, repo: string) => void;
  setPollingInterval: (interval: NodeJS.Timeout | null) => void;
  reset: () => void;
};

export const useActionsStore = create<ActionsStore>((set) => ({
  workflowRuns: [],
  selectedRun: null,
  selectedRunJobs: [],
  isLoading: false,
  error: null,
  owner: '',
  repository: '',
  pollingInterval: null,

  setWorkflowRuns: (runs) => set({ workflowRuns: runs }),
  setSelectedRun: (run) => set({ selectedRun: run }),
  setSelectedRunJobs: (jobs) => set({ selectedRunJobs: jobs }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setRepository: (owner, repo) => set({ owner, repository: repo }),
  setPollingInterval: (interval) => set({ pollingInterval: interval }),
  reset: () =>
    set({
      workflowRuns: [],
      selectedRun: null,
      selectedRunJobs: [],
      isLoading: false,
      error: null,
      owner: '',
      repository: '',
      pollingInterval: null,
    }),
}));
