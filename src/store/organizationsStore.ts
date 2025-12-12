import type { Organization } from '@/lib/api/organizations.service';
import { create } from 'zustand';

type OrganizationsStore = {
  organizations: Organization[] | null;
  setOrganizations: (orgs: Organization[]) => void;
  clearOrganizations: () => void;
};

export const useOrganizationsStore = create<OrganizationsStore>((set) => ({
  organizations: null,
  setOrganizations: (orgs: Organization[]) => set({ organizations: orgs }),
  clearOrganizations: () => set({ organizations: null }),
}));
