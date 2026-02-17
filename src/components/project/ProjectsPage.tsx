'use client';

import type { Organization } from '@/lib/api/organizations.service';
import { ArrowLeft, GitBranch, Github, Package, Star } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { AllPackagesModal } from '@/components/project/AllPackagesModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  // Initialize organizations from store or fetch from API
  useEffect(() => {
    const initializeOrganizations = async () => {
      try {
        // Priority 1: Use organizations from Zustand store
        if (
          storeOrganizations &&
          Array.isArray(storeOrganizations) &&
          storeOrganizations.length > 0
        ) {
          console.warn('Using organizations from store:', storeOrganizations);
          const validOrgs = storeOrganizations.filter(
            (org) => org && typeof org === 'object' && org.id && org.login
          );

          if (validOrgs.length > 0) {
            setDisplayOrganizations(validOrgs);
            // Don't pre-select, let user choose
            return;
          }
        }

        // Priority 2: Fetch from API if no valid store data
        const orgs = await fetchOrganizations();
        if (orgs && Array.isArray(orgs) && orgs.length > 0) {
          console.warn('Fetched organizations from API:', orgs);
          setDisplayOrganizations(orgs);
          // Don't pre-select, let user choose
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

        console.warn('[ProjectsPage] Fetching repositories for organization:', orgLogin);
        const repos = await organizationsService.fetchOrganizationRepositories(orgLogin);

        console.warn('[ProjectsPage] Repositories fetched:', repos);
        setRepositories(repos);
      } catch (error) {
        console.error('[ProjectsPage] Failed to fetch repositories:', error);
        setRepositoriesError(
          error instanceof Error ? error.message : 'Failed to fetch repositories'
        );
      } finally {
        setRepositoriesLoading(false);
      }
    },
    [setSelectedOrganization, setRepositoriesLoading, setRepositoriesError, setRepositories]
  );

  // Auto-load repositories if organization is already selected
  useEffect(() => {
    if (selectedOrganization && displayOrganizations.length > 0) {
      // Check if selected org still exists in available organizations
      const orgExists = displayOrganizations.some((org) => org.login === selectedOrganization);
      if (orgExists) {
        handleOrgChange(selectedOrganization);
      } else {
        // Clear invalid selection
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
      TypeScript: theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-800',
      JavaScript:
        theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
      Python: theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800',
      Go: theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-100 text-cyan-800',
    };
    return (
      colors[language || ''] ||
      (theme === 'dark' ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-800')
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'
      }`}
    >
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className={`${theme === 'dark' ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} transition-all`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header with Organization Selector and Packages Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white/80'
              } backdrop-blur-sm border ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}
            >
              <Github
                className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}
              />
              <label
                htmlFor="organization-select"
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                }`}
              >
                Select Organization
              </label>
              {displayOrganizations.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {displayOrganizations.length}
                </span>
              )}
            </div>

            {/* Packages Button */}
            <Button
              onClick={() => setShowPackagesModal(true)}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${
                theme === 'dark'
                  ? 'border-purple-500/50 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400'
                  : 'border-purple-300 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:border-purple-400'
              }`}
            >
              <Package className="h-4 w-4" />
              All Packages
            </Button>
          </div>
          <div className="max-w-md">
            <Select
              value={selectedOrganization || ''}
              onValueChange={handleOrgChange}
              disabled={isLoading || repositoriesLoading}
            >
              <SelectTrigger
                id="organization-select"
                className={`transition-all duration-200 h-12 ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700'
                    : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                } shadow-sm`}
              >
                <SelectValue placeholder="Choose an organization to get started" />
              </SelectTrigger>
              <SelectContent
                className={
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-300'
                }
              >
                {displayOrganizations.length > 0 ? (
                  displayOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.login}>
                      <div
                        className={`flex items-center gap-3 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {typeof org.avatar_url === 'string' && org.avatar_url.startsWith('http') ? (
                          <Image
                            src={org.avatar_url}
                            alt={org.login}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-lg">{org.avatar_url}</span>
                        )}
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {org.login}
                          </span>
                          {org.name && (
                            <span
                              className={`text-xs ${
                                theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                              }`}
                            >
                              {org.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div
                    className={`px-2 py-1.5 text-xs ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    No organizations available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Repositories Grid */}
        {displayOrganizations.length === 0 ? (
          <div
            className={`text-center py-16 px-4 rounded-2xl border-2 border-dashed transition-all duration-200 ${
              theme === 'dark' ? 'border-zinc-800 bg-zinc-900/30' : 'border-gray-300 bg-white/50'
            }`}
          >
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
              }`}
            >
              <Github
                className={`h-8 w-8 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
              />
            </div>
            <p
              className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
              }`}
            >
              No organizations found
            </p>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Go back to dashboard and import from GitHub to get started.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className={`${
                theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        ) : !selectedOrganization ? (
          <div
            className={`text-center py-16 px-4 rounded-2xl transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-zinc-900/50 border border-zinc-800'
                : 'bg-white/80 border border-gray-200'
            }`}
          >
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
              }`}
            >
              <GitBranch
                className={`h-8 w-8 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
              />
            </div>
            <p
              className={`text-base font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
            >
              Select an organization above to view its repositories
            </p>
          </div>
        ) : repositoriesLoading ? (
          <div
            className={`text-center py-16 px-4 rounded-2xl ${
              theme === 'dark' ? 'bg-zinc-900/50' : 'bg-white/50'
            }`}
          >
            <div className="flex justify-center mb-4">
              <div
                className={`h-12 w-12 animate-spin rounded-full border-4 ${
                  theme === 'dark'
                    ? 'border-purple-500 border-t-transparent'
                    : 'border-purple-600 border-t-transparent'
                }`}
              />
            </div>
            <p
              className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
            >
              Loading repositories...
            </p>
          </div>
        ) : repositories && repositories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {repositories.map((repo) => (
              <Card
                key={repo.id}
                onClick={() => handleRepositoryClick(repo.name)}
                className={`transition-all duration-300 cursor-pointer overflow-hidden group ${
                  theme === 'dark'
                    ? 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-purple-500/10'
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/20'
                } hover:-translate-y-1`}
              >
                <div className="p-6 h-full">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-lg font-bold truncate transition-colors duration-200 ${
                            theme === 'dark'
                              ? 'text-white group-hover:text-purple-400'
                              : 'text-gray-900 group-hover:text-purple-600'
                          }`}
                        >
                          {repo.name}
                        </h3>
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                          }`}
                        >
                          {repo.full_name}
                        </p>
                      </div>
                      {repo.private && (
                        <Badge
                          variant="secondary"
                          className={`shrink-0 ${
                            theme === 'dark'
                              ? 'bg-zinc-800 text-zinc-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Private
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {repo.description && (
                      <p
                        className={`text-sm line-clamp-2 min-h-[2.5rem] ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                        }`}
                      >
                        {repo.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div
                      className={`flex items-center justify-between pt-3 border-t transition-colors ${
                        theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <Badge className={`${getLanguageColor(repo.language)} text-xs`}>
                            {repo.language}
                          </Badge>
                        )}
                        {repo.stargazers_count > 0 && (
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                            }`}
                          >
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{repo.stargazers_count}</span>
                          </div>
                        )}
                      </div>
                      <GitBranch
                        className={`h-4 w-4 transition-all duration-200 ${
                          theme === 'dark'
                            ? 'text-zinc-600 group-hover:text-purple-400'
                            : 'text-gray-400 group-hover:text-purple-600'
                        } group-hover:scale-110`}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div
            className={`text-center py-16 px-4 rounded-2xl ${
              theme === 'dark'
                ? 'bg-zinc-900/50 border border-zinc-800'
                : 'bg-white/80 border border-gray-200'
            }`}
          >
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
              }`}
            >
              <GitBranch
                className={`h-8 w-8 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
              />
            </div>
            <p
              className={`text-base font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
            >
              No repositories found for this organization
            </p>
          </div>
        )}
      </div>

      {/* Packages Modal */}
      <AllPackagesModal />
    </div>
  );
}
