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
import { Github, Star, GitBranch, LogOut, Sun, Moon } from 'lucide-react';
import { Organization } from '@/lib/api/organizations.service';
import { useOrganizationsViewModel } from '@/viewmodels/OrganizationsViewModel';
import { useOrganizationsStore } from '@/store/organizationsStore';





export default function ProjectsPage() {
  const { isLoading, fetchOrganizations } = useOrganizationsViewModel();
  const { organizations: storeOrganizations } = useOrganizationsStore();
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [displayOrganizations, setDisplayOrganizations] = useState<Organization[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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
            setSelectedOrg(validOrgs[0].login);
            return;
          }
        }
        
        // Priority 2: Fetch from API if no valid store data
        const orgs = await fetchOrganizations();
        if (orgs && Array.isArray(orgs) && orgs.length > 0) {
          console.log('Fetched organizations from API:', orgs);
          setDisplayOrganizations(orgs);
          setSelectedOrg(orgs[0].login);
        }
      } catch (error) {
        console.error('Failed to initialize organizations:', error);
      }
    };

    initializeOrganizations();
  }, [storeOrganizations, fetchOrganizations]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-zinc-800 text-zinc-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <Button
              variant="outline"
              size="sm"
              className={`transition-colors ${
                theme === 'dark'
                  ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
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
            <Select value={selectedOrg} onValueChange={setSelectedOrg} disabled={isLoading}>
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

        {/* Projects/Organizations Empty State */}
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
        ) : (
          <div className={`text-center py-12 px-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-zinc-900/50'
              : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
            }`}>
              Organization repositories will be loaded here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
