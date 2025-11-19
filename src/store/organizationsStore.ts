import { create } from 'zustand';
import { Organization } from '@/lib/api/organizations.service';

interface OrganizationsStore {
  organizations: Organization[] | null;
  setOrganizations: (orgs: Organization[]) => void;
  clearOrganizations: () => void;
}

export const useOrganizationsStore = create<OrganizationsStore>((set) => ({
  organizations: null,
  setOrganizations: (orgs: Organization[]) => set({ organizations: orgs }),
  clearOrganizations: () => set({ organizations: null }),
}));
