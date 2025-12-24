import type { Organization } from '@/lib/api/organizations.service';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OrganizationsStore = {
  organizations: Organization[] | null;
  selectedOrganization: string | null;
  setOrganizations: (orgs: Organization[]) => void;
  setSelectedOrganization: (orgLogin: string | null) => void;
  clearOrganizations: () => void;
};

export const useOrganizationsStore = create<OrganizationsStore>()(
  persist(
    (set) => ({
      organizations: null,
      selectedOrganization: null,
      setOrganizations: (orgs: Organization[]) => set({ organizations: orgs }),
      setSelectedOrganization: (orgLogin: string | null) => set({ selectedOrganization: orgLogin }),
      clearOrganizations: () => set({ organizations: null, selectedOrganization: null }),
    }),
    {
      name: 'organizations-store',
    }
  )
);
