'use client';

import type { WorkflowRun } from '@/lib/api/actions.service';
import {
  Activity,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  GitBranch,
  User,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { actionsService } from '@/lib/api/actions.service';
import { useThemeStore } from '@/store/themeStore';

export type ActionsTableRef = {
  refresh: () => void;
};

type ActionsTableProps = {
  owner: string;
  repository: string;
};

export const ActionsTable = ({
  ref,
  owner,
  repository,
}: ActionsTableProps & { ref?: React.RefObject<ActionsTableRef | null> }) => {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 15;

  // Calculate pagination
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const _paginatedRuns = workflowRuns.slice(startIndex, endIndex);
  const totalPages = Math.ceil(workflowRuns.length / perPage);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const fetchWorkflowRuns = useCallback(async (owner: string, repo: string, showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      const response = await actionsService.fetchWorkflowRuns(owner, repo, 100); // Fetch more data for client-side pagination
      const runs = response.data.runs || [];
      setWorkflowRuns(runs);
      setPage(1); // Reset to first page when data changes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow runs');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (owner && repository) {
      fetchWorkflowRuns(owner, repository);
    }
  }, [owner, repository, fetchWorkflowRuns]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (owner && repository) {
        fetchWorkflowRuns(owner, repository);
      }
    },
  }));

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

  const getStatusIcon = (status: string, conclusion: string | null) => {
    const color = actionsService.getWorkflowStatusColor(status, conclusion);

    if (status === 'queued' || status === 'in_progress' || status === 'waiting') {
      return <Circle className="h-4 w-4 animate-pulse" style={{ color }} />;
    }

    if (status === 'completed') {
      if (conclusion === 'success' || conclusion === 'skipped') {
        return <CheckCircle2 className="h-4 w-4" style={{ color }} />;
      }
      return <XCircle className="h-4 w-4" style={{ color }} />;
    }

    return <Circle className="h-4 w-4" style={{ color }} />;
  };

  const getStatusText = (status: string, conclusion: string | null) => {
    if (status === 'queued') {
      return 'Queued';
    }
    if (status === 'in_progress') {
      return 'In Progress';
    }
    if (status === 'waiting') {
      return 'Waiting';
    }
    if (status === 'completed') {
      if (conclusion === 'success') {
        return 'Success';
      }
      if (conclusion === 'failure') {
        return 'Failed';
      }
      if (conclusion === 'cancelled') {
        return 'Cancelled';
      }
      if (conclusion === 'skipped') {
        return 'Skipped';
      }
      if (conclusion === 'timed_out') {
        return 'Timed Out';
      }
      if (conclusion === 'action_required') {
        return 'Action Required';
      }
    }
    return 'Unknown';
  };

  const handleViewDetail = (runId: number) => {
    router.push(`/workflow-run-detail?owner=${owner}&repo=${repository}&runId=${runId}`);
  };

  const handleRefresh = () => {
    if (owner && repository) {
      fetchWorkflowRuns(owner, repository);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && workflowRuns.length === 0 && <TableSkeleton rows={5} columns={7} />}

      {/* Error State */}
      {error && (
        <div
          className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
          }`}
        >
          {error}
        </div>
      )}

      {/* Workflow Runs Table */}
      {!isLoading && workflowRuns.length > 0 && (
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
                    Status
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    Workflow
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    Branch
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    Event
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    Triggered By
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    Time
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
                {_paginatedRuns.map((run) => (
                  <tr
                    key={run.id}
                    className={`transition-colors ${
                      theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(run.status, run.conclusion)}
                        <span
                          className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                          }`}
                        >
                          {getStatusText(run.status, run.conclusion)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {run.display_title}
                        </p>
                        <p
                          className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                        >
                          #{run.run_number}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GitBranch
                          className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                        >
                          {run.head_branch}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          theme === 'dark'
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {run.event}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User
                          className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                        >
                          {run.actor.login}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock
                          className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                        >
                          {formatDate(run.run_started_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(run.id)}
                        className={`inline-flex items-center gap-2 ${
                          theme === 'dark'
                            ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {workflowRuns.length > 0 && (
            <div
              className={`px-6 py-4 border-t flex items-center justify-between ${
                theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Showing {startIndex + 1}-{Math.min(endIndex, workflowRuns.length)} of{' '}
                {workflowRuns.length} workflow runs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevPage || isLoading}
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
                  {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNextPage || isLoading}
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

      {/* Empty State */}
      {!isLoading && workflowRuns.length === 0 && !error && (
        <div className="text-center py-12">
          <Activity
            className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
          />
          <p
            className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
          >
            No workflow runs found
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            There are no workflow runs for this repository yet
          </p>
        </div>
      )}
    </div>
  );
};
ActionsTable.displayName = 'ActionsTable';
