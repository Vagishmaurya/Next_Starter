import type { Repository } from '@/lib/api/organizations.service';
import { create } from 'zustand';

type RepositoriesStore = {
  repositories: Repository[] | null;
  isLoading: boolean;
  error: string | null;
  setRepositories: (repos: Repository[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearRepositories: () => void;
};

export const useRepositoriesStore = create<RepositoriesStore>((set) => ({
  repositories: null,
  isLoading: false,
  error: null,
  setRepositories: (repos: Repository[]) => set({ repositories: repos, error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearRepositories: () => set({ repositories: null, error: null }),
}));
