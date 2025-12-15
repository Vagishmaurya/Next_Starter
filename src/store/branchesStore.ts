import type { Branch, Commit } from '@/lib/api/branches.service';
import type { Tag } from '@/lib/api/tags.service';
import { create } from 'zustand';

type ViewType = 'commits' | 'tags';

type BranchesStore = {
  branches: Branch[];
  commits: Commit[];
  tags: Tag[];
  selectedBranch: string | null;
  isLoading: boolean;
  error: string | null;
  owner: string;
  repository: string;
  currentView: ViewType;

  setBranches: (branches: Branch[]) => void;
  setCommits: (commits: Commit[]) => void;
  setTags: (tags: Tag[]) => void;
  setSelectedBranch: (branch: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRepository: (owner: string, repo: string) => void;
  setCurrentView: (view: ViewType) => void;
  reset: () => void;
};

export const useBranchesStore = create<BranchesStore>((set) => ({
  branches: [],
  commits: [],
  tags: [],
  selectedBranch: null,
  isLoading: false,
  error: null,
  owner: '',
  repository: '',
  currentView: 'commits', // Default to commits view

  setBranches: (branches) => set({ branches }),
  setCommits: (commits) => set({ commits }),
  setTags: (tags) => set({ tags }),
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setRepository: (owner, repo) => set({ owner, repository: repo }),
  setCurrentView: (view) => set({ currentView: view }),
  reset: () =>
    set({
      branches: [],
      commits: [],
      tags: [],
      selectedBranch: null,
      isLoading: false,
      error: null,
      owner: '',
      repository: '',
      currentView: 'commits',
    }),
}));
