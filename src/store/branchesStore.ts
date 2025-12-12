import type { Branch, Commit } from '@/lib/api/branches.service';
import { create } from 'zustand';

type BranchesStore = {
  branches: Branch[];
  commits: Commit[];
  selectedBranch: string | null;
  isLoading: boolean;
  error: string | null;
  owner: string;
  repository: string;

  setBranches: (branches: Branch[]) => void;
  setCommits: (commits: Commit[]) => void;
  setSelectedBranch: (branch: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRepository: (owner: string, repo: string) => void;
  reset: () => void;
};

export const useBranchesStore = create<BranchesStore>((set) => ({
  branches: [],
  commits: [],
  selectedBranch: null,
  isLoading: false,
  error: null,
  owner: '',
  repository: '',

  setBranches: (branches) => set({ branches }),
  setCommits: (commits) => set({ commits }),
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setRepository: (owner, repo) => set({ owner, repository: repo }),
  reset: () =>
    set({
      branches: [],
      commits: [],
      selectedBranch: null,
      isLoading: false,
      error: null,
      owner: '',
      repository: '',
    }),
}));
