'use client';

import {
  Activity,
  ArrowLeft,
  Clock,
  Download,
  ExternalLink,
  GitBranch,
  GitCommit,
  PlayCircle,
  Shield,
  Tag,
  User,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { ActionsTable } from '@/components/branches/ActionsTable';
import { CreateTagModal } from '@/components/branches/CreateTagModal';
import { WorkflowsTable } from '@/components/branches/WorkflowsTable';
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
import { tagsService } from '@/lib/api/tags.service';
import { useBranchesStore } from '@/store/branchesStore';
import { useThemeStore } from '@/store/themeStore';

export default function BranchesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useThemeStore();
  const {
    branches,
    commits,
    tags,
    // workflowRuns, - not used in this component anymore
    selectedBranch,
    isLoading,
    error,
    owner,
    repository,
    currentView,
    setBranches,
    setCommits,
    setTags,
    // setWorkflowRuns, - not used in this component anymore
    setSelectedBranch,
    setLoading,
    setError,
    setRepository,
    setCurrentView,
  } = useBranchesStore();

  const [page, setPage] = useState(1);
  const perPage = 30;
  const [tagsPage, setTagsPage] = useState(1);
  const tagsPerPage = 10;
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedCommitSha, setSelectedCommitSha] = useState<string>('');

  // Calculate pagination for tags
  const tagsStartIndex = (tagsPage - 1) * tagsPerPage;
  const tagsEndIndex = tagsStartIndex + tagsPerPage;
  const paginatedTags = tags.slice(tagsStartIndex, tagsEndIndex);
  const tagsTotalPages = Math.ceil(tags.length / tagsPerPage);
  const tagsHasNextPage = tagsPage < tagsTotalPages;
  const tagsHasPrevPage = tagsPage > 1;

  const fetchBranches = useCallback(
    async (owner: string, repo: string) => {
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
    },
    [setBranches, setSelectedBranch, setCommits, setLoading, setError]
  );

  const fetchCommits = useCallback(
    async (owner: string, repo: string, branch: string, page: number) => {
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
    },
    [perPage, setLoading, setError, setCommits]
  );

  const fetchTags = useCallback(
    async (owner: string, repo: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await tagsService.fetchTags(owner, repo);
        setTags(response.data.tags || []);
        setTagsPage(1); // Reset to first page when data changes
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tags');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setTags]
  );

  useEffect(() => {
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');

    if (ownerParam && repoParam) {
      // Check if we're navigating to a different repository
      if (owner !== ownerParam || repository !== repoParam) {
        // Reset state when navigating to a new repository
        setSelectedBranch(null);
        setCommits([]);
        setTags([]);
        setBranches([]);
        setCurrentView('commits');
      }
      setRepository(ownerParam, repoParam);
      fetchBranches(ownerParam, repoParam);
      // Fetch tags by default when page loads
      fetchTags(ownerParam, repoParam);
    }
  }, [
    searchParams,
    owner,
    repository,
    setSelectedBranch,
    setCommits,
    setTags,
    setBranches,
    setRepository,
    setCurrentView,
    fetchBranches,
    fetchTags,
  ]);

  useEffect(() => {
    // Only fetch commits if a branch is explicitly selected (not empty or null)
    // AND the owner/repository match the URL params to avoid stale data
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');

    if (
      selectedBranch &&
      selectedBranch.trim() !== '' &&
      owner &&
      repository &&
      owner === ownerParam &&
      repository === repoParam &&
      currentView === 'commits'
    ) {
      fetchCommits(owner, repository, selectedBranch, page);
    }
  }, [selectedBranch, page, owner, repository, searchParams, currentView, fetchCommits]);

  const handleBranchChange = (branchName: string) => {
    setSelectedBranch(branchName);
    setPage(1);
    if (currentView === 'commits') {
      fetchCommits(owner, repository, branchName, 1);
    }
  };

  const handleCreateTag = (commitSha: string) => {
    setSelectedCommitSha(commitSha);
    setIsTagModalOpen(true);
  };

  const handleTagSubmit = async (tagData: {
    tag_name: string;
    tag_message: string;
    tag_type: string;
  }) => {
    if (!owner || !repository || !selectedCommitSha) {
      return;
    }

    await branchesService.createTag(owner, repository, selectedCommitSha, tagData);

    // Refresh tags if currently viewing tags
    if (currentView === 'tags') {
      fetchTags(owner, repository);
    }
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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className={`${theme === 'dark' ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} transition-all`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Repository Header with Navigation */}
        <div className="mb-8 text-center">
          <h1
            className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            {owner}/{repository}
          </h1>
          <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            Repository Branches & History
          </p>
          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('workflows')}
              className={`flex items-center gap-2 ${
                currentView === 'workflows'
                  ? theme === 'dark'
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-green-500 bg-green-50 text-green-600'
                  : theme === 'dark'
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              Workflows
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentView('commits');
                if (selectedBranch) {
                  fetchCommits(owner, repository, selectedBranch, page);
                }
              }}
              className={`flex items-center gap-2 ${
                currentView === 'commits'
                  ? theme === 'dark'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-blue-500 bg-blue-50 text-blue-600'
                  : theme === 'dark'
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <GitCommit className="h-4 w-4" />
              Commits
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentView('tags');
                fetchTags(owner, repository);
              }}
              className={`flex items-center gap-2 ${
                currentView === 'tags'
                  ? theme === 'dark'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                    : 'border-purple-500 bg-purple-50 text-purple-600'
                  : theme === 'dark'
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Tag className="h-4 w-4" />
              Tags
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('actions')}
              className={`flex items-center gap-2 ${
                currentView === 'actions'
                  ? theme === 'dark'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-orange-500 bg-orange-50 text-orange-600'
                  : theme === 'dark'
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Activity className="h-4 w-4" />
              Actions
            </Button>
          </div>
        </div>

        {/* View Toggle Buttons */}
        {/* <div className="mb-8 flex items-center justify-center">
          <div
            className={`inline-flex items-center gap-1 p-1.5 rounded-xl ${
              theme === 'dark'
                ? 'bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50'
                : 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg shadow-gray-200/50'
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewToggle('commits')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                currentView === 'commits'
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40 scale-105'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <GitCommit
                className={`h-4 w-4 mr-2 ${currentView === 'commits' ? 'animate-pulse' : ''}`}
              />
              Commits
              {commits.length > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentView === 'commits'
                      ? 'bg-white/20 text-white'
                      : theme === 'dark'
                        ? 'bg-zinc-700 text-zinc-300'
                        : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {commits.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewToggle('tags')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                currentView === 'tags'
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/40 scale-105'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <Tag className={`h-4 w-4 mr-2 ${currentView === 'tags' ? 'animate-pulse' : ''}`} />
              Tags
              {tags.length > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentView === 'tags'
                      ? 'bg-white/20 text-white'
                      : theme === 'dark'
                        ? 'bg-zinc-700 text-zinc-300'
                        : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tags.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewToggle('actions')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                currentView === 'actions'
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-105'
                    : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/40 scale-105'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <Activity
                className={`h-4 w-4 mr-2 ${currentView === 'actions' ? 'animate-pulse' : ''}`}
              />
              Actions
              {workflowRuns.length > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentView === 'actions'
                      ? 'bg-white/20 text-white'
                      : theme === 'dark'
                        ? 'bg-zinc-700 text-zinc-300'
                        : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {workflowRuns.length}
                </span>
              )}
            </Button>
          </div>
        </div> */}

        {/* Branch Selector - Only show for commits view */}
        {currentView === 'commits' && branches.length > 0 && (
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
              }`}
            >
              <GitBranch className="inline h-4 w-4 mr-2" />
              Select Branch
              <span
                className={`text-xs font-normal ml-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
              >
                ({branches.length} branches)
              </span>
            </label>
            <div className="max-w-xs">
              <Select
                value={selectedBranch || ''}
                onValueChange={handleBranchChange}
                disabled={isLoading}
              >
                <SelectTrigger
                  className={`transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-900 border-zinc-800 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-300'
                  }
                >
                  {branches.map((branch) => (
                    <SelectItem key={branch.name} value={branch.name}>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <span>{branch.name}</span>
                        {branch.protected && (
                          <Shield
                            className={`h-3 w-3 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}
                          />
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
        {currentView === 'commits' && !isLoading && commits.length > 0 && (
          <Card
            className={`overflow-hidden transition-shadow duration-300 ${
              theme === 'dark'
                ? 'bg-zinc-900/50 border-zinc-800 shadow-xl shadow-zinc-900/50'
                : 'bg-white border-gray-200 shadow-xl shadow-gray-200/60'
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
                  {commits.map((commit) => (
                    <tr
                      key={commit.sha}
                      className={`transition-all duration-200 ${
                        theme === 'dark' ? 'hover:bg-zinc-800/70' : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <GitCommit
                            className={`h-4 w-4 mt-1 shrink-0 ${
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
                                  theme === 'dark'
                                    ? 'bg-zinc-800 text-zinc-300'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {commit.commit?.comment_count} comment
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateTag(commit.sha)}
                            className={`text-xs ${
                              theme === 'dark'
                                ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            Create Tag
                          </Button>
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
                        </div>
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
                Showing {commits.length} commits
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => p + 1)}
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

        {/* Tags Table */}
        {currentView === 'tags' && !isLoading && tags.length > 0 && (
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
                      Tag Name
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      Commit SHA
                    </th>
                    <th
                      className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      Downloads
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${theme === 'dark' ? 'divide-zinc-800' : 'divide-gray-200'}`}
                >
                  {paginatedTags.map((tag) => (
                    <tr
                      key={tag.node_id}
                      className={`transition-colors ${
                        theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag
                            className={`h-4 w-4 ${
                              theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {tag.name}
                          </span>
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
                          {tag.commit.sha.substring(0, 7)}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={tag.zipball_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-sm hover:underline ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`}
                          >
                            <Download className="h-3 w-3" />
                            ZIP
                          </a>
                          <a
                            href={tag.tarball_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-sm hover:underline ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`}
                          >
                            <Download className="h-3 w-3" />
                            TAR
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tags Pagination */}
            {tags.length > 0 && (
              <div
                className={`px-6 py-4 border-t flex items-center justify-between ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Showing {tagsStartIndex + 1}-{Math.min(tagsEndIndex, tags.length)} of{' '}
                  {tags.length} tags
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTagsPage((p) => Math.max(1, p - 1))}
                    disabled={!tagsHasPrevPage || isLoading}
                    className={
                      theme === 'dark'
                        ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                    }
                  >
                    Previous
                  </Button>
                  <span
                    className={`px-3 py-1.5 text-sm ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    }`}
                  >
                    {tagsPage} of {tagsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTagsPage((p) => p + 1)}
                    disabled={!tagsHasNextPage || isLoading}
                    className={
                      theme === 'dark'
                        ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Actions View */}
        {currentView === 'actions' && <ActionsTable owner={owner} repository={repository} />}

        {/* Workflows View */}
        {currentView === 'workflows' && <WorkflowsTable owner={owner} repository={repository} />}

        {/* No Branches State */}
        {!isLoading && branches.length === 0 && (
          <div className="text-center py-12">
            <GitBranch
              className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
            />
            <p
              className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
            >
              No branches found
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              This repository does not have any branches yet
            </p>
          </div>
        )}

        {/* Empty States */}
        {!isLoading && currentView === 'commits' && !selectedBranch && branches.length > 0 && (
          <div className="text-center py-12">
            <GitBranch
              className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
            />
            <p
              className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
            >
              Select a branch to view commits
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Choose a branch from the dropdown above to see its commit history
            </p>
          </div>
        )}

        {!isLoading && currentView === 'commits' && commits.length === 0 && selectedBranch && (
          <div className="text-center py-12">
            <GitCommit
              className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
            />
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              No commits found for this branch
            </p>
          </div>
        )}

        {!isLoading && currentView === 'tags' && tags.length === 0 && (
          <div className="text-center py-12">
            <Tag
              className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
            />
            <p
              className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
            >
              No tags found
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              This repository doesn't have any tags yet
            </p>
          </div>
        )}
      </div>

      {/* Create Tag Modal */}
      <CreateTagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onSubmit={handleTagSubmit}
        commitSha={selectedCommitSha}
        tags={tags}
        selectedBranch={selectedBranch}
      />
    </div>
  );
}
