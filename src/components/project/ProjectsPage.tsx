'use client';

import type { Organization } from '@/lib/api/organizations.service';
import {
  GitBranch,
  Github,
  Lock,
  Package,
  Search as SearchIcon,
  Star,
  TrendingUp,
  Unlock,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { AllPackagesModal } from '@/components/project/AllPackagesModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, PageTransition } from '@/components/ui/motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { organizationsService } from '@/lib/api/organizations.service';
import { useOrganizationsStore } from '@/store/organizationsStore';
import { usePackagesStore } from '@/store/packagesStore';
import { useRepositoriesStore } from '@/store/repositoriesStore';
import { useThemeStore } from '@/store/themeStore';
import { useOrganizationsViewModel } from '@/viewmodels/OrganizationsViewModel';

export default function ProjectsPage() {
  const router = useRouter();
  const { isLoading, fetchOrganizations } = useOrganizationsViewModel();
  const {
    organizations: storeOrganizations,
    selectedOrganization,
    setSelectedOrganization,
  } = useOrganizationsStore();
  const {
    repositories,
    isLoading: repositoriesLoading,
    setRepositories,
    setLoading: setRepositoriesLoading,
    setError: setRepositoriesError,
  } = useRepositoriesStore();
  const { setShowPackagesModal } = usePackagesStore();
  const { theme } = useThemeStore();
  const [displayOrganizations, setDisplayOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize organizations from store or fetch from API
  useEffect(() => {
    const initializeOrganizations = async () => {
      try {
        if (storeOrganizations && storeOrganizations.length > 0) {
          const validOrgs = storeOrganizations.filter((org) => org && org.id && org.login);
          if (validOrgs.length > 0) {
            setDisplayOrganizations(validOrgs);
            return;
          }
        }
        const orgs = await fetchOrganizations();
        if (orgs?.length > 0) {
          setDisplayOrganizations(orgs);
        }
      } catch (error) {
        console.error('Failed to initialize organizations:', error);
      }
    };
    initializeOrganizations();
  }, [storeOrganizations, fetchOrganizations]);

  // Fetch repositories when organization is selected
  const handleOrgChange = useCallback(
    async (orgLogin: string) => {
      setSelectedOrganization(orgLogin);
      try {
        setRepositoriesLoading(true);
        setRepositoriesError(null);
        const repos = await organizationsService.fetchOrganizationRepositories(orgLogin);
        setRepositories(repos);
      } catch (error) {
        setRepositoriesError(
          error instanceof Error ? error.message : 'Failed to fetch repositories'
        );
      } finally {
        setRepositoriesLoading(false);
      }
    },
    [setSelectedOrganization, setRepositoriesLoading, setRepositoriesError, setRepositories]
  );

  useEffect(() => {
    if (selectedOrganization && displayOrganizations.length > 0) {
      const orgExists = displayOrganizations.some((org) => org.login === selectedOrganization);
      if (orgExists) {
        handleOrgChange(selectedOrganization);
      } else {
        setSelectedOrganization(null);
      }
    }
  }, [selectedOrganization, displayOrganizations, handleOrgChange, setSelectedOrganization]);

  const handleRepositoryClick = (repoName: string) => {
    if (selectedOrganization) {
      router.push(`/branches?owner=${selectedOrganization}&repo=${repoName}`);
    }
  };

  const getLanguageColor = (language: string | null): string => {
    const colors: Record<string, string> = {
      TypeScript: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      JavaScript: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      Python: 'text-green-400 bg-green-500/10 border-green-500/20',
      Go: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      Rust: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      Java: 'text-red-400 bg-red-500/10 border-red-500/20',
    };
    return colors[language || ''] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
  };

  const filteredRepositories =
    repositories?.filter((repo) => repo.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    [];

  return (
    <PageTransition>
      <div
        className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-zinc-900'}`}
      >
        {/* Background Mesh Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
          {/* Header Section */}
          <div className="flex flex-col gap-8 mb-12">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
                    REPOSITORIES
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full border ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-500'}`}
                  >
                    {repositories?.length || 0} Total
                  </span>
                </h1>
                <p
                  className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                >
                  Explore and automate your deployment workflows.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowPackagesModal(true)}
                  variant="outline"
                  className={`
                  hidden sm:flex items-center gap-2 h-11 px-6 rounded-2xl border transition-all active:scale-95
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-900/50 border-white/5 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-gray-50'
                  }
                `}
                >
                  <Package className="h-4.5 w-4.5 text-violet-500" />
                  <span className="font-bold">All Packages</span>
                </Button>
              </div>
            </div>

            {/* Quick Filters / Org Selection */}
            <div
              className={`
            p-2 rounded-2xl flex flex-wrap items-center gap-4 border
            ${theme === 'dark' ? 'bg-zinc-900/30 border-white/5' : 'bg-white/50 border-zinc-200'}
          `}
            >
              <div className="w-full sm:w-[320px]">
                <Select
                  value={selectedOrganization || ''}
                  onValueChange={handleOrgChange}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={`
                  h-12 rounded-xl border-none font-bold text-sm
                  ${theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'}
                `}
                  >
                    <SelectValue placeholder="Select Organization" />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }
                  >
                    {displayOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.login} className="rounded-lg my-1">
                        <div className="flex items-center gap-3">
                          {org.avatar_url && typeof org.avatar_url === 'string' ? (
                            <div className="relative w-6 h-6 rounded-md overflow-hidden bg-zinc-800">
                              <Image
                                src={org.avatar_url}
                                alt={org.login}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center text-[10px] text-white">
                              {org.login[0].toUpperCase()}
                            </div>
                          )}
                          <span
                            className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-700'}`}
                          >
                            {org.login}
                          </span>
                          {org.type === 'Organization' && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 bg-blue-500/10 text-blue-400 border-blue-500/20"
                            >
                              Org
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[300px] relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 z-10" />
                <Input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                  h-12 pl-11 rounded-xl border-none font-medium text-sm transition-all
                  ${
                    theme === 'dark'
                      ? 'bg-white/5 text-white placeholder:text-zinc-600 focus:bg-white/10'
                      : 'bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-200'
                  }
                `}
                />
              </div>

              <div
                className={`hidden md:flex items-center gap-2 px-4 h-12 border-l ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'}`}
              >
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                >
                  Active Projects Only
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Content Grid */}
          {repositoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-[200px] rounded-3xl animate-pulse ${theme === 'dark' ? 'bg-zinc-900/50' : 'bg-gray-200/50'}`}
                />
              ))}
            </div>
          ) : !selectedOrganization ? (
            <div
              className={`
            flex flex-col items-center justify-center min-h-[400px] rounded-[40px] border border-dashed border-zinc-800/50 transition-all
            ${theme === 'dark' ? 'bg-zinc-900/10' : 'bg-gray-50'}
          `}
            >
              <div
                className={`p-6 rounded-3xl mb-4 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-xl shadow-gray-200/50'}`}
              >
                <Github
                  className={`h-12 w-12 ${theme === 'dark' ? 'text-zinc-700' : 'text-zinc-300'}`}
                />
              </div>
              <h2 className="text-xl font-black mb-2 tracking-tight">Select an Organization</h2>
              <p
                className={`text-sm text-center max-w-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
              >
                Choose an organization from the dropdown to start managing your repositories.
              </p>
            </div>
          ) : filteredRepositories && filteredRepositories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRepositories.map((repo, idx) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.25, 0.4, 0.25, 1] }}
                  whileHover={{ y: -6 }}
                >
                  <Card
                    onClick={() => handleRepositoryClick(repo.name)}
                    className={`
                  group relative border-none rounded-2xl overflow-hidden cursor-pointer transition-all duration-500
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-900/40 hover:bg-zinc-900/60 shadow-xl'
                      : 'bg-white hover:bg-white shadow-xl shadow-gray-200/40 hover:shadow-gray-200/60'
                  }
                `}
                  >
                    {/* Colored Accent Background Glow */}
                    <div
                      className={`
                  absolute top-0 right-0 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 -z-10
                  ${repo.language === 'TypeScript' ? 'bg-blue-500' : 'bg-violet-500'}
                `}
                    />

                    <div className="p-6 h-full flex flex-col gap-4 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform duration-500">
                          <GitBranch className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          {repo.private ? (
                            <div
                              className={`p-1.5 rounded-lg border ${theme === 'dark' ? 'bg-zinc-950/50 border-white/5 text-zinc-400' : 'bg-gray-100 border-zinc-200 text-zinc-500'}`}
                            >
                              <Lock className="h-3 w-3" />
                            </div>
                          ) : (
                            <div
                              className={`p-1.5 rounded-lg border ${theme === 'dark' ? 'bg-zinc-950/50 border-white/5 text-zinc-400' : 'bg-gray-100 border-zinc-200 text-zinc-500'}`}
                            >
                              <Unlock className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h3
                          className={`text-lg font-black tracking-tight group-hover:text-blue-500 transition-colors uppercase truncate ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}
                        >
                          {repo.name}
                        </h3>
                        <p
                          className={`text-xs line-clamp-2 leading-relaxed min-h-[32px] ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'} group-hover:text-zinc-400 transition-colors`}
                        >
                          {repo.description || 'No description available for this repository.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-auto">
                        {repo.language && (
                          <div
                            className={`flex items-center gap-1.2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${getLanguageColor(repo.language)}`}
                          >
                            <div className="w-1.2 h-1.2 rounded-full bg-current" />
                            {repo.language}
                          </div>
                        )}
                        {repo.stargazers_count > 0 && (
                          <div
                            className={`flex items-center gap-1.2 text-[10px] font-bold ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}
                          >
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {repo.stargazers_count}
                          </div>
                        )}
                      </div>

                      <div
                        className={`
                    absolute bottom-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left
                    bg-gradient-to-r from-blue-500 to-violet-500
                  `}
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Image
                src="/calance_logo.png"
                alt="No data"
                width={64}
                height={64}
                className="mx-auto grayscale opacity-20 mb-6"
              />
              <h3 className="text-xl font-bold">No Repos Found</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                We couldn't find any repositories for this organization.
              </p>
            </div>
          )}
        </div>

        <AllPackagesModal />
      </div>
    </PageTransition>
  );
}
