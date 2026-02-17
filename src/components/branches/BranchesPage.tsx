'use client';

import {
  Activity,
  ArrowLeft,
  Building2,
  Download,
  GitBranch,
  GitCommit,
  PlayCircle,
  Shield,
  Tag,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { CommitRow } from '@/components/branches/CommitRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { branchesService } from '@/lib/api/branches.service';
import { tagsService } from '@/lib/api/tags.service';
import { useBranchesStore } from '@/store/branchesStore';
import { usePackagesStore } from '@/store/packagesStore';
import { useThemeStore } from '@/store/themeStore';

const ActionsTable = dynamic(
  () => import('@/components/branches/ActionsTable').then((mod) => mod.ActionsTable),
  {
    loading: () => <TableSkeleton rows={5} columns={6} />,
  }
);
const CreateTagModal = dynamic(
  () => import('@/components/branches/CreateTagModal').then((mod) => mod.CreateTagModal),
  { ssr: false }
);
const OrganizationPackagesModal = dynamic(
  () =>
    import('@/components/branches/OrganizationPackagesModal').then(
      (mod) => mod.OrganizationPackagesModal
    ),
  { ssr: false }
);
const WorkflowsTable = dynamic(
  () => import('@/components/branches/WorkflowsTable').then((mod) => mod.WorkflowsTable),
  {
    loading: () => <TableSkeleton rows={5} columns={4} />,
  }
);

export default function BranchesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useThemeStore();
  const [_isPending, startTransition] = useTransition();
  const { setShowOrgPackagesModal } = usePackagesStore();
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
        // Auto-select 'main' branch if it exists
        const mainBranch = branches.find((b: any) => b.name === 'main');
        if (mainBranch) {
          setSelectedBranch('main');
        } else {
          setSelectedBranch(null);
        }
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

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'
      }`}
    >
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header Row: Back, Title, Org Packages */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className={`${theme === 'dark' ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} transition-all`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1
              className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {owner}/{repository}
            </h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => startTransition(() => setShowOrgPackagesModal(true))}
            className={`flex items-center gap-2 ${
              theme === 'dark'
                ? 'border-violet-500/50 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 hover:border-violet-400'
                : 'border-violet-300 bg-violet-50 text-violet-600 hover:bg-violet-100 hover:border-violet-400'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Org Packages
          </Button>
        </div>

        {/* Controls Row: Navigation & Branch Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
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

          {/* Branch Selector */}
          {currentView === 'commits' && branches.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-[240px]">
                <Select
                  value={selectedBranch || ''}
                  onValueChange={handleBranchChange}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    aria-label="Select a branch"
                    className={`h-9 transition-colors ${
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
                        <div
                          className={`flex items-center gap-2 ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}`}
                        >
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
        </div>

        {/* Loading State */}
        {isLoading && <TableSkeleton rows={8} columns={5} className="mb-6" />}

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
                      className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      Commit Message
                    </th>
                    <th
                      className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      Author
                    </th>
                    <th
                      className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      Date
                    </th>
                    <th
                      className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}
                    >
                      SHA
                    </th>
                    <th
                      className={`px-4 py-2 text-right text-xs font-medium uppercase tracking-wider ${
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
                    <CommitRow
                      key={commit.sha}
                      commit={commit}
                      theme={theme}
                      onTagClick={handleCreateTag}
                    />
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

      {/* Organization Packages Modal */}
      <OrganizationPackagesModal organization={owner} />
    </div>
  );
}
