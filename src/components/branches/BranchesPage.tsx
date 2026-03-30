'use client';

import type { ActionsTableRef } from '@/components/branches/ActionsTable';
import type { WorkflowsTableRef } from '@/components/branches/WorkflowsTable';
import axios from 'axios';
import {
  Activity,
  ArrowLeft,
  Building2,
  ChevronRight,
  Download,
  GitBranch,
  GitCommit,
  GitPullRequest,
  History,
  PlayCircle,
  Plus,
  RefreshCw,
  Shield,
  Tag,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { ActionsTable } from '@/components/branches/ActionsTable';
import { CommitRow } from '@/components/branches/CommitRow';
import { WorkflowsTable } from '@/components/branches/WorkflowsTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, PageTransition } from '@/components/ui/motion';
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
    prs,
    selectedBranch,
    isLoading,
    error,
    owner,
    repository,
    currentView,
    setBranches,
    setCommits,
    setTags,
    setPrs,
    setSelectedBranch,
    setLoading,
    setError,
    setRepository,
    setCurrentView,
  } = useBranchesStore();

  const [page, setPage] = useState(1);
  const perPage = 15;
  const [tagsPage, setTagsPage] = useState(1);
  const tagsPerPage = 10;
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedCommitSha, setSelectedCommitSha] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const workflowsTableRef = React.useRef<WorkflowsTableRef>(null);
  const actionsTableRef = React.useRef<ActionsTableRef>(null);

  // Calculate pagination for tags
  const tagsStartIndex = (tagsPage - 1) * tagsPerPage;
  const tagsEndIndex = tagsStartIndex + tagsPerPage;
  const paginatedTags = tags.slice(tagsStartIndex, tagsEndIndex);
  const tagsTotalPages = Math.ceil(tags.length / tagsPerPage);
  const tagsHasNextPage = tagsPage < tagsTotalPages;
  const tagsHasPrevPage = tagsPage > 1;

  const fetchBranches = useCallback(
    async (owner: string, repo: string, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const response = await branchesService.fetchBranches(owner, repo, signal);
        const branches = response.data.branches || [];
        setBranches(branches);
        // Auto-select 'main' branch if it exists
        const mainBranch = branches.find((b: any) => b.name === 'main');
        if (mainBranch) {
          setSelectedBranch('main');
        } else {
          setSelectedBranch(null);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err instanceof Error ? err.message : 'Failed to fetch branches');
        }
      } finally {
        setLoading(false);
      }
    },
    [setBranches, setSelectedBranch, setLoading, setError]
  );

  const fetchCommits = useCallback(
    async (owner: string, repo: string, branch: string, page: number, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const response = await branchesService.fetchCommits(
          owner,
          repo,
          branch,
          page,
          perPage,
          signal
        );
        setCommits(response.data.commits);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err instanceof Error ? err.message : 'Failed to fetch commits');
        }
      } finally {
        setLoading(false);
      }
    },
    [perPage, setLoading, setError, setCommits]
  );

  const fetchTags = useCallback(
    async (owner: string, repo: string, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const response = await tagsService.fetchTags(owner, repo, signal);
        setTags(response.data.tags || []);
        setTagsPage(1); // Reset to first page when data changes
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err instanceof Error ? err.message : 'Failed to fetch tags');
        }
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setTags]
  );

  const fetchPRs = useCallback(
    async (owner: string, repo: string, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const response = await branchesService.fetchPRs(owner, repo, signal);
        setPrs(response.data.prs || []);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err instanceof Error ? err.message : 'Failed to fetch PRs');
        }
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setPrs]
  );

  useEffect(() => {
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');

    if (ownerParam && repoParam) {
      const controller = new AbortController();

      // Check if we're navigating to a different repository
      if (owner !== ownerParam || repository !== repoParam) {
        setRepository(ownerParam, repoParam);
        setCurrentView('workflows');
      }

      const load = async () => {
        try {
          await Promise.all([
            fetchBranches(ownerParam, repoParam, controller.signal),
            fetchTags(ownerParam, repoParam, controller.signal),
          ]);
        } catch {
          // Error is handled by setBranches([]) and UI state
        }
      };

      load();

      return () => {
        controller.abort();
      };
    }
  }, [searchParams, owner, repository, setRepository, setCurrentView, fetchBranches, fetchTags]);

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
      const controller = new AbortController();
      fetchCommits(owner, repository, selectedBranch, page, controller.signal);
      return () => controller.abort();
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
    <PageTransition>
      <div
        key={`${owner}-${repository}`}
        className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
          theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-zinc-900'
        }`}
      >
        {/* Background Mesh Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-violet-600/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          {/* Header: Cinematic Breadcrumbs & Title */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <Link href="/projects" className="hover:text-blue-500 transition-colors">
                    Projects
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-zinc-400">{owner}</span>
                </nav>
                <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500 uppercase">
                    {repository}
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startTransition(() => setShowOrgPackagesModal(true))}
                  className={`h-9 px-4 rounded-xl border transition-all active:scale-95 flex items-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="h-4 w-4 text-violet-500" />
                  <span className="font-bold text-xs">Org Packages</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className={`h-9 w-9 p-0 rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                      : 'text-gray-400 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation & Controls Pill Bar */}
            <div
              className={`
            p-1.5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border glass-effect
            ${theme === 'dark' ? 'bg-white/5 border-white/5 shadow-2xl shadow-black/20' : 'bg-white/80 border-black/5 shadow-lg shadow-gray-200/50'}
          `}
            >
              <div className="flex items-center gap-1">
                {[
                  { id: 'workflows', label: 'Workflows', icon: PlayCircle, color: 'green' },
                  { id: 'commits', label: 'Commits', icon: History, color: 'blue' },
                  { id: 'tags', label: 'Tags', icon: Tag, color: 'purple' },
                  { id: 'prs', label: 'PRs', icon: GitPullRequest, color: 'indigo' },
                  { id: 'actions', label: 'Actions', icon: Activity, color: 'orange' },
                ].map((view) => {
                  const isActive = currentView === view.id;
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.id}
                      onClick={() => {
                        setCurrentView(view.id as any);
                        if (view.id === 'commits' && selectedBranch) {
                          fetchCommits(owner, repository, selectedBranch, page);
                        } else if (view.id === 'tags') {
                          fetchTags(owner, repository);
                        } else if (view.id === 'prs') {
                          fetchPRs(owner, repository);
                        }
                      }}
                      className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300
                      ${
                        isActive
                          ? theme === 'dark'
                            ? `text-${view.color}-400`
                            : `text-${view.color}-600`
                          : theme === 'dark'
                            ? 'text-zinc-500 hover:text-white hover:bg-white/5'
                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-gray-100'
                      }
                    `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="view-toggle-pill"
                          className={`absolute inset-0 rounded-xl ${
                            theme === 'dark'
                              ? `bg-${view.color}-500/20 shadow-[0_0_15px_rgba(var(--${view.color}-rgb),0.2)]`
                              : `bg-${view.color}-50`
                          }`}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon
                          className={`h-3.5 w-3.5 transition-transform ${isActive ? 'scale-110' : ''}`}
                        />
                        {view.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                {/* Branch Selector (Conditional) */}
                {mounted && currentView === 'commits' && branches.length > 0 && (
                  <div className="w-[200px] min-w-0 flex-shrink-0">
                    <Select value={selectedBranch || ''} onValueChange={handleBranchChange}>
                      <SelectTrigger
                        className={`
                      h-9 rounded-xl border-none font-bold text-[10px] uppercase tracking-wider overflow-hidden focus:ring-0
                      ${theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'}
                    `}
                      >
                        <div className="flex-1 text-left truncate">
                          <SelectValue placeholder="Branch" />
                        </div>
                      </SelectTrigger>
                      <SelectContent
                        className={
                          theme === 'dark'
                            ? 'bg-zinc-900 border-zinc-800'
                            : 'bg-white border-zinc-200'
                        }
                      >
                        {branches.map((branch) => (
                          <SelectItem key={branch.name} value={branch.name}>
                            <div className="flex items-center gap-2 max-w-[160px]">
                              <GitBranch className="h-3 w-3 text-blue-500" />
                              <span className="font-bold truncate">{branch.name}</span>
                              {branch.protected && (
                                <Shield className="h-2.5 w-2.5 text-yellow-500" />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pl-3 border-l border-white/10 ml-1">
                  {currentView === 'workflows' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => workflowsTableRef.current?.refresh()}
                        className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-blue-400"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => workflowsTableRef.current?.openCreateModal()}
                        className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-600/20"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Create
                      </Button>
                    </>
                  )}
                  {currentView === 'actions' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => actionsTableRef.current?.refresh()}
                      className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-orange-400"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content Area (Loading/Error/Tables) */}
          <div className="space-y-6">
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
                        theme === 'dark'
                          ? 'border-zinc-800/50 bg-zinc-900/40'
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <tr>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[45%]">
                          Commit
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[15%]">
                          Author
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[20%]">
                          Date
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[10%]">
                          SHA
                        </th>
                        <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[10%]">
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
                        theme === 'dark'
                          ? 'border-zinc-800/50 bg-zinc-900/40'
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <tr>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Tag
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          SHA
                        </th>
                        <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${theme === 'dark' ? 'divide-zinc-800' : 'divide-gray-200'}`}
                    >
                      {paginatedTags.map((tag) => (
                        <tr
                          key={tag.node_id}
                          className={`group transition-all duration-300 ${
                            theme === 'dark' ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.01]'
                          }`}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-5 w-5 rounded-md flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}
                              >
                                <Tag className="h-3 w-3" />
                              </div>
                              <span
                                className={`text-xs font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}
                              >
                                {tag.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <code
                              className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md border ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5 text-zinc-400' : 'bg-zinc-100 border-black/5 text-zinc-600'}`}
                            >
                              {tag.commit.sha.substring(0, 7)}
                            </code>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a
                                href={tag.zipball_url}
                                className={`h-7 px-2 flex items-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                  theme === 'dark'
                                    ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                                    : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'
                                }`}
                              >
                                <Download className="h-3 w-3" />
                                Zip
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
                      theme === 'dark'
                        ? 'border-zinc-800 bg-zinc-900'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <p
                      className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                    >
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

            {/* PRs Table */}
            {currentView === 'prs' && !isLoading && prs.length > 0 && (
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
                        theme === 'dark'
                          ? 'border-zinc-800/50 bg-zinc-900/40'
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <tr>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Pull Request
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Title
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          State
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Branch
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${theme === 'dark' ? 'divide-zinc-800' : 'divide-gray-200'}`}
                    >
                      {prs.map((pr) => (
                        <tr
                          key={pr.number}
                          className={`group transition-all duration-300 ${
                            theme === 'dark' ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.01]'
                          }`}
                          onClick={() => window.open(pr.url, '_blank')}
                        >
                          <td className="px-5 py-3">
                            <div
                              className={`text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}
                            >
                              #{pr.number}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`text-xs font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}
                            >
                              {pr.title}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <Badge
                              className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                pr.state === 'open'
                                  ? theme === 'dark'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-green-50 text-green-600 border-green-200'
                                  : theme === 'dark'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : 'bg-purple-50 text-purple-600 border-purple-200'
                              } border`}
                            >
                              {pr.state}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <GitBranch
                                className={`h-3 w-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
                              />
                              <span
                                className={`text-[10px] font-black font-mono ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}
                              >
                                {pr.branch}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* simple pagination summary */}
                <div
                  className={`px-6 py-4 border-t flex items-center justify-between ${
                    theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                    Showing {prs.length} pull requests
                  </p>
                </div>
              </Card>
            )}

            {/* Actions View */}
            {currentView === 'actions' && (
              <ActionsTable
                key={`actions-${owner}-${repository}`}
                ref={actionsTableRef}
                owner={owner}
                repository={repository}
              />
            )}

            {/* Workflows View */}
            {currentView === 'workflows' && (
              <WorkflowsTable
                key={`workflows-${owner}-${repository}`}
                ref={workflowsTableRef}
                owner={owner}
                repository={repository}
              />
            )}

            {/* No Branches State - Only show in commits view */}
            {!isLoading && currentView === 'commits' && branches.length === 0 && (
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

            {!isLoading && currentView === 'prs' && prs.length === 0 && (
              <div className="text-center py-12">
                <GitPullRequest
                  className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
                />
                <p
                  className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                >
                  No pull requests found
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  This repository doesn't have any pull requests yet
                </p>
              </div>
            )}
          </div>
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
    </PageTransition>
  );
}
