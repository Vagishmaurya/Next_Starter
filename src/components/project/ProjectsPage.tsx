"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Star, GitBranch } from 'lucide-react';
import { Organization, Repository, organizationsService } from '@/lib/api/organizations.service';
import { useOrganizationsViewModel } from '@/viewmodels/OrganizationsViewModel';
import { useOrganizationsStore } from '@/store/organizationsStore';
import { useRepositoriesStore } from '@/store/repositoriesStore';
import { useThemeStore } from '@/store/themeStore';





export default function ProjectsPage() {
  const { isLoading, fetchOrganizations } = useOrganizationsViewModel();
  const { organizations: storeOrganizations } = useOrganizationsStore();
  const { repositories, isLoading: repositoriesLoading, setRepositories, setLoading: setRepositoriesLoading, setError: setRepositoriesError } = useRepositoriesStore();
  const { theme } = useThemeStore();
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [displayOrganizations, setDisplayOrganizations] = useState<Organization[]>([]);

  // Initialize organizations from store or fetch from API
  useEffect(() => {
    const initializeOrganizations = async () => {
      try {
        // Priority 1: Use organizations from Zustand store
        if (storeOrganizations && Array.isArray(storeOrganizations) && storeOrganizations.length > 0) {
          console.log('Using organizations from store:', storeOrganizations);
          const validOrgs = storeOrganizations.filter(org => 
            org && typeof org === 'object' && org.id && org.login
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
          console.log('Fetched organizations from API:', orgs);
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
  const handleOrgChange = async (orgLogin: string) => {
    setSelectedOrg(orgLogin);
    
    try {
      setRepositoriesLoading(true);
      setRepositoriesError(null);
      
      console.log('[ProjectsPage] Fetching repositories for organization:', orgLogin);
      const repos = await organizationsService.fetchOrganizationRepositories(orgLogin);
      
      console.log('[ProjectsPage] Repositories fetched:', repos);
      setRepositories(repos);
    } catch (error) {
      console.error('[ProjectsPage] Failed to fetch repositories:', error);
      setRepositoriesError(error instanceof Error ? error.message : 'Failed to fetch repositories');
    } finally {
      setRepositoriesLoading(false);
    }
  };

  const getLanguageColor = (language: string | null): string => {
    const colors: Record<string, string> = {
      TypeScript: theme === 'dark' 
        ? 'bg-blue-500/10 text-blue-400' 
        : 'bg-blue-100 text-blue-800',
      JavaScript: theme === 'dark' 
        ? 'bg-yellow-500/10 text-yellow-400' 
        : 'bg-yellow-100 text-yellow-800',
      Python: theme === 'dark' 
        ? 'bg-green-500/10 text-green-400' 
        : 'bg-green-100 text-green-800',
      Go: theme === 'dark' 
        ? 'bg-cyan-500/10 text-cyan-400' 
        : 'bg-cyan-100 text-cyan-800',
    };
    return colors[language || ''] || (theme === 'dark' 
      ? 'bg-gray-500/10 text-gray-400' 
      : 'bg-gray-100 text-gray-800');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-zinc-950' 
        : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-200 ${
        theme === 'dark'
          ? 'border-zinc-800 bg-zinc-900/50'
          : 'border-gray-200 bg-white/50'
      } backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Github className={`h-8 w-8 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`} />
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Projects
            </h1>
          </div>

          <div className="flex items-center gap-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Organization Selector */}
        <div className="mb-8">
          <label className={`block text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
          }`}>
            Select Organization {displayOrganizations.length > 0 && (
              <span className={`text-xs font-normal ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                ({displayOrganizations.length})
              </span>
            )}
          </label>
          <div className="max-w-xs">
            <Select value={selectedOrg} onValueChange={handleOrgChange} disabled={isLoading || repositoriesLoading}>
              <SelectTrigger className={`transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}>
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-300'}>
                {displayOrganizations.length > 0 ? (
                  displayOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.login}>
                      <div className="flex items-center gap-2">
                        {typeof org.avatar_url === 'string' && org.avatar_url.startsWith('http') ? (
                          <img
                            src={org.avatar_url}
                            alt={org.login}
                            className="h-4 w-4 rounded-full"
                          />
                        ) : (
                          <span className="text-lg">{org.avatar_url}</span>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{org.login}</span>
                          {org.name && (
                            <span className="text-xs opacity-75">{org.name}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-xs text-gray-500">
                    No organizations available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Repositories Grid */}
        {displayOrganizations.length === 0 ? (
          <div className={`text-center py-12 px-4 rounded-lg border-2 border-dashed ${
            theme === 'dark'
              ? 'border-zinc-800 bg-zinc-900/30'
              : 'border-gray-300 bg-gray-50'
          }`}>
            <Github className={`h-12 w-12 mx-auto mb-4 ${
              theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
            }`} />
            <p className={`text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              No organizations found
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
            }`}>
              Go back to dashboard and import from GitHub to get started.
            </p>
          </div>
        ) : repositoriesLoading ? (
          <div className={`text-center py-12 px-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-zinc-900/50'
              : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
            }`}>
              Loading repositories...
            </p>
          </div>
        ) : repositories && repositories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {repositories.map((repo) => (
              <Card
                key={repo.id}
                className={`transition-all duration-200 cursor-pointer overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
                } group`}
              >
                <div className="p-6 h-full">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold truncate group-hover:text-blue-400 transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {repo.name}
                        </h3>
                        <p className={`text-sm truncate ${
                          theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                        }`}>
                          {repo.full_name}
                        </p>
                      </div>
                      {repo.private && (
                        <Badge variant="secondary" className={`shrink-0 ${
                          theme === 'dark'
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          Private
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {repo.description && (
                      <p className={`text-sm line-clamp-2 ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                      }`}>
                        {repo.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className={`flex items-center justify-between pt-2 border-t transition-colors ${
                      theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-100'
                    }`}>
                      <div className="flex items-center gap-4">
                        {repo.language && (
                          <Badge className={getLanguageColor(repo.language)}>
                            {repo.language}
                          </Badge>
                        )}
                        {repo.stargazers_count > 0 && (
                          <div className={`flex items-center gap-1 text-sm ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{repo.stargazers_count}</span>
                          </div>
                        )}
                      </div>
                      <GitBranch className={`h-4 w-4 group-hover:text-blue-400 transition-colors ${
                        theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 px-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-zinc-900/50'
              : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
            }`}>
              No repositories found for this organization
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
