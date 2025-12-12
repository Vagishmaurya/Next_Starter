'use client';

import { ArrowLeft, Clock, ExternalLink, GitBranch, GitCommit, Shield, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
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
import { branchesService } from '@/lib/api/branches.service';
import { useBranchesStore } from '@/store/branchesStore';
import { useThemeStore } from '@/store/themeStore';

export default function BranchesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useThemeStore();
  const {
    branches,
    commits,
    selectedBranch,
    isLoading,
    error,
    owner,
    repository,
    setBranches,
    setCommits,
    setSelectedBranch,
    setLoading,
    setError,
    setRepository,
  } = useBranchesStore();

  const [page, setPage] = useState(1);
  const perPage = 30;

  const fetchBranches = useCallback(async (owner: string, repo: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await branchesService.fetchBranches(owner, repo);
      const branches = response.data.branches || [];
      setBranches(branches);
      // Don't auto-select branch - let user choose
      setSelectedBranch(null);
      setCommits([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  }, [setBranches, setSelectedBranch, setCommits, setLoading, setError]);

  const fetchCommits = useCallback(async (owner: string, repo: string, branch: string, page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await branchesService.fetchCommits(owner, repo, branch, page, perPage);
      setCommits(response.data.commits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch commits');
    } finally {
      setLoading(false);
    }
  }, [perPage, setLoading, setError, setCommits]);

  useEffect(() => {
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');

    if (ownerParam && repoParam) {
      // Check if we're navigating to a different repository
      if (owner !== ownerParam || repository !== repoParam) {
        // Reset state when navigating to a new repository
        setSelectedBranch(null);
        setCommits([]);
        setBranches([]);
      }
      setRepository(ownerParam, repoParam);
      fetchBranches(ownerParam, repoParam);
    }
  }, [searchParams, owner, repository, setSelectedBranch, setCommits, setBranches, setRepository, fetchBranches]);

  useEffect(() => {
    // Only fetch commits if a branch is explicitly selected (not empty or null)
    // AND the owner/repository match the URL params to avoid stale data
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');

    if (
      selectedBranch
      && selectedBranch.trim() !== ''
      && owner
      && repository
      && owner === ownerParam
      && repository === repoParam
    ) {
      fetchCommits(owner, repository, selectedBranch, page);
    }
  }, [selectedBranch, page, owner, repository, searchParams, fetchCommits]);

  const handleBranchChange = (branchName: string) => {
    setSelectedBranch(branchName);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'just now';
    }
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    return formatDate(dateString);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <div
        className={`border-b transition-colors duration-200 ${
          theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-200 bg-white/50'
        } backdrop-blur-md`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {owner}
                /
                {repository}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Branches and Commits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Branch Selector */}
        {branches.length > 0 && (
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
              }`}
            >
              <GitBranch className="inline h-4 w-4 mr-2" />
              Select Branch
              <span className={`text-xs font-normal ml-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                (
                {branches.length}
                {' '}
                branches)
              </span>
            </label>
            <div className="max-w-xs">
              <Select value={selectedBranch || ''} onValueChange={handleBranchChange} disabled={isLoading}>
                <SelectTrigger
                  className={`transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-900 border-zinc-800 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-300'}>
                  {branches.map(branch => (
                    <SelectItem key={branch.name} value={branch.name}>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <span>{branch.name}</span>
                        {branch.protected && (
                          <Shield className={`h-3 w-3 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
            }`}
          >
            {error}
          </div>
        )}

        {/* Commits Table */}
        {!isLoading && commits.length > 0 && (
          <Card
            className={`overflow-hidden ${
              theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`border-b ${
                    theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <tr>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      Commit Message
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      Author
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      Date
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      SHA
                    </th>
                    <th
                      className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${theme === 'dark' ? 'divide-zinc-800' : 'divide-gray-200'}`}
                >
                  {commits.map(commit => (
                    <tr
                      key={commit.sha}
                      className={`transition-colors ${
                        theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <GitCommit
                            className={`h-4 w-4 mt-1 flex-shrink-0 ${
                              theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'
                            }`}
                          />
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {commit.commit?.message?.split('\n')[0] || 'No commit message'}
                            </p>
                            {commit.commit?.comment_count > 0 && (
                              <Badge
                                variant="secondary"
                                className={`mt-1 text-xs ${
                                  theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {commit.commit?.comment_count}
                                {' '}
                                comment
                                {commit.commit?.comment_count !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User
                            className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`}
                          />
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                              }`}
                            >
                              {commit.commit?.author?.name || 'Unknown'}
                            </p>
                            <p
                              className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                            >
                              {commit.commit?.author?.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock
                            className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`}
                          />
                          <div>
                            <p
                              className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                            >
                              {getRelativeTime(commit.commit?.author?.date || '')}
                            </p>
                            <p
                              className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                            >
                              {formatDate(commit.commit?.author?.date || '')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code
                          className={`text-xs font-mono px-2 py-1 rounded ${
                            theme === 'dark'
                              ? 'bg-zinc-800 text-zinc-300'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {commit.sha.substring(0, 7)}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={commit.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-sm hover:underline ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`}
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className={`px-6 py-4 border-t flex items-center justify-between ${
                theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Showing
                {' '}
                {commits.length}
                {' '}
                commits
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className={
                    theme === 'dark'
                      ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={commits.length < perPage || isLoading}
                  className={
                    theme === 'dark'
                      ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* No Branches State */}
        {!isLoading && branches.length === 0 && (
          <div className="text-center py-12">
            <GitBranch
              className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
            />
            <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              No branches found
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              This repository does not have any branches yet
            </p>
          </div>
        )}

        {/* No Branch Selected State */}
        {!isLoading && !selectedBranch && branches.length > 0 && (
          <div className="text-center py-12">
            <GitBranch
              className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
            />
            <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Select a branch to view commits
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Choose a branch from the dropdown above to see its commit history
            </p>
          </div>
        )}

        {/* Empty State - No Commits */}
        {!isLoading && commits.length === 0 && selectedBranch && (
          <div className="text-center py-12">
            <GitCommit
              className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
            />
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              No commits found for this branch
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
