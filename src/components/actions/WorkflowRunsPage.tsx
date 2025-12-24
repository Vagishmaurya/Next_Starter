'use client';

import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  GitBranch,
  PlayCircle,
  RefreshCw,
  User,
  XCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { actionsService } from '@/lib/api/actions.service';
import { useActionsStore } from '@/store/actionsStore';
import { useThemeStore } from '@/store/themeStore';

export default function WorkflowRunsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useThemeStore();
  const {
    workflowRuns,
    isLoading,
    error,
    owner,
    repository,
    pollingInterval,
    setWorkflowRuns,
    setLoading,
    setError,
    setRepository,
    setPollingInterval,
  } = useActionsStore();

  const [perPage] = useState(30);
  const [isPolling, setIsPolling] = useState(false);

  const fetchWorkflowRuns = useCallback(
    async (owner: string, repo: string, showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);
        const response = await actionsService.fetchWorkflowRuns(owner, repo, perPage);
        const runs = response.data.runs || [];
        setWorkflowRuns(runs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workflow runs');
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [perPage, setLoading, setError, setWorkflowRuns]
  );

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingInterval) {
      return; // Already polling
    }

    setIsPolling(true);
    const interval = setInterval(() => {
      if (owner && repository) {
        fetchWorkflowRuns(owner, repository, false); // Don't show loading on poll
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  }, [owner, repository, pollingInterval, fetchWorkflowRuns, setPollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      setIsPolling(false);
    }
  }, [pollingInterval, setPollingInterval]);

  // Initial fetch and setup
  useEffect(() => {
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');

    if (ownerParam && repoParam) {
      if (owner !== ownerParam || repository !== repoParam) {
        setWorkflowRuns([]);
      }
      setRepository(ownerParam, repoParam);
      fetchWorkflowRuns(ownerParam, repoParam);
    }
  }, [searchParams, owner, repository, setRepository, setWorkflowRuns, fetchWorkflowRuns]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

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
              <h1
                className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                {owner}/{repository}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                GitHub Actions Workflow Runs
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className={
                  theme === 'dark'
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant={isPolling ? 'default' : 'outline'}
                size="sm"
                onClick={isPolling ? stopPolling : startPolling}
                className={
                  isPolling
                    ? ''
                    : theme === 'dark'
                      ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }
              >
                <Activity className={`h-4 w-4 mr-2 ${isPolling ? 'animate-pulse' : ''}`} />
                {isPolling ? 'Stop Auto-Refresh' : 'Auto-Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && workflowRuns.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw
              className={`h-8 w-8 mx-auto mb-4 animate-spin ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
            />
            <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
              Loading workflow runs...
            </p>
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

        {/* Workflow Runs List */}
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
                  {workflowRuns.map((run) => (
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
                          <div>
                            <p
                              className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                            >
                              {getRelativeTime(run.created_at)}
                            </p>
                            <p
                              className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                            >
                              {formatDate(run.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(run.id)}
                            className={`text-xs ${
                              theme === 'dark'
                                ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <a
                            href={run.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-sm hover:underline ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div
              className={`px-6 py-4 border-t flex items-center justify-between ${
                theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Showing {workflowRuns.length} workflow run{workflowRuns.length !== 1 ? 's' : ''}
              </p>
              {isPolling && (
                <p
                  className={`text-xs flex items-center gap-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                >
                  <Activity className="h-3 w-3 animate-pulse" />
                  Auto-refreshing every 5 seconds
                </p>
              )}
            </div>
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
              This repository doesn't have any workflow runs yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
