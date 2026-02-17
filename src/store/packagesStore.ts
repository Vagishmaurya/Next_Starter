import type { Package } from '@/lib/api/packages.service';
import { create } from 'zustand';

type PackagesState = {
  // All packages for user
  allPackages: Package[];
  allPackagesLoading: boolean;
  allPackagesError: string | null;

  // Organization packages
  orgPackages: Package[];
  orgPackagesLoading: boolean;
  orgPackagesError: string | null;
  selectedOrganization: string | null;

  // UI state
  showPackagesModal: boolean;
  showOrgPackagesModal: boolean;
  currentPackageType: string;

  // Actions
  setAllPackages: (packages: Package[]) => void;
  setAllPackagesLoading: (loading: boolean) => void;
  setAllPackagesError: (error: string | null) => void;

  setOrgPackages: (packages: Package[]) => void;
  setOrgPackagesLoading: (loading: boolean) => void;
  setOrgPackagesError: (error: string | null) => void;
  setSelectedOrganization: (org: string | null) => void;

  setShowPackagesModal: (show: boolean) => void;
  setShowOrgPackagesModal: (show: boolean) => void;
  setCurrentPackageType: (type: string) => void;

  // Reset actions
  resetAllPackages: () => void;
  resetOrgPackages: () => void;
  resetAll: () => void;
};

export const usePackagesStore = create<PackagesState>((set) => ({
  // Initial state
  allPackages: [],
  allPackagesLoading: false,
  allPackagesError: null,

  orgPackages: [],
  orgPackagesLoading: false,
  orgPackagesError: null,
  selectedOrganization: null,

  showPackagesModal: false,
  showOrgPackagesModal: false,
  currentPackageType: 'npm',

  // Actions
  setAllPackages: (packages) => set({ allPackages: packages }),
  setAllPackagesLoading: (loading) => set({ allPackagesLoading: loading }),
  setAllPackagesError: (error) => set({ allPackagesError: error }),

  setOrgPackages: (packages) => set({ orgPackages: packages }),
  setOrgPackagesLoading: (loading) => set({ orgPackagesLoading: loading }),
  setOrgPackagesError: (error) => set({ orgPackagesError: error }),
  setSelectedOrganization: (org) => set({ selectedOrganization: org }),

  setShowPackagesModal: (show) => set({ showPackagesModal: show }),
  setShowOrgPackagesModal: (show) => set({ showOrgPackagesModal: show }),
  setCurrentPackageType: (type) => set({ currentPackageType: type }),

  // Reset actions
  resetAllPackages: () =>
    set({
      allPackages: [],
      allPackagesLoading: false,
      allPackagesError: null,
    }),

  resetOrgPackages: () =>
    set({
      orgPackages: [],
      orgPackagesLoading: false,
      orgPackagesError: null,
    }),

  resetAll: () =>
    set({
      allPackages: [],
      allPackagesLoading: false,
      allPackagesError: null,
      orgPackages: [],
      orgPackagesLoading: false,
      orgPackagesError: null,
      selectedOrganization: null,
      showPackagesModal: false,
      showOrgPackagesModal: false,
      currentPackageType: 'container',
    }),
}));
