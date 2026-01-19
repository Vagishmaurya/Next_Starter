'use client';

import type { WorkflowJob } from '@/lib/api/actions.service';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  ExternalLink,
  GitBranch,
  GitCommit,
  Tag,
  User,
  XCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { actionsService } from '@/lib/api/actions.service';
import { useActionsStore } from '@/store/actionsStore';
import { useThemeStore } from '@/store/themeStore';

export default function WorkflowRunDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useThemeStore();
  const {
    selectedRun,
    selectedRunJobs,
    jobLogs,
    isLoading,
    isLoadingJobLogs,
    error,
    jobLogsError,
    owner,
    repository,
    setSelectedRun,
    setSelectedRunJobs,
    setJobLogs,
    clearJobLogs,
    setLoading,
    setJobLogsLoading,
    setError,
    setJobLogsError,
    setRepository,
  } = useActionsStore();

  const [activeTab, setActiveTab] = useState<'jobs' | 'logs'>('jobs');
  const [allLogsLoaded, setAllLogsLoaded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

  const fetchWorkflowRunDetail = useCallback(
    async (owner: string, repo: string, runId: number) => {
      try {
        setLoading(true);
        setError(null);
        const response = await actionsService.fetchWorkflowRunDetail(owner, repo, runId);
        setSelectedRun(response.data.run);
        setSelectedRunJobs(response.data.jobs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workflow run detail');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setSelectedRun, setSelectedRunJobs]
  );

  const fetchAllLogs = useCallback(async () => {
    if (!selectedRunJobs.length || allLogsLoaded || isLoadingJobLogs) {
      return;
    }

    try {
      setJobLogsLoading(true);
      setJobLogsError(null);

      // Fetch logs for all jobs
      const logPromises: Promise<void>[] = [];

      selectedRunJobs.forEach((job) => {
        // Skip if logs already exist for this job
        if (!jobLogs[job.id]) {
          const promise = actionsService
            .fetchJobLogs(owner, repository, job.id)
            .then((response) => {
              setJobLogs(job.id, response.data.logs);
            })
            .catch((err) => {
              console.warn(`Failed to fetch logs for job ${job.id}:`, err);
              setJobLogs(job.id, `Error loading logs: ${err.message || 'Unknown error'}`);
            });
          logPromises.push(promise);
        }
      });

      await Promise.all(logPromises);
      setAllLogsLoaded(true);
    } catch (err) {
      setJobLogsError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setJobLogsLoading(false);
    }
  }, [
    selectedRunJobs,
    allLogsLoaded,
    isLoadingJobLogs,
    jobLogs,
    owner,
    repository,
    setJobLogsLoading,
    setJobLogsError,
    setJobLogs,
  ]);

  useEffect(() => {
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');
    const runIdParam = searchParams.get('runId');

    if (ownerParam && repoParam && runIdParam) {
      setRepository(ownerParam, repoParam);
      // Reset logs when navigating to a different run
      clearJobLogs();
      setAllLogsLoaded(false);
      fetchWorkflowRunDetail(ownerParam, repoParam, Number.parseInt(runIdParam, 10));
    }
  }, [searchParams, setRepository, clearJobLogs, fetchWorkflowRunDetail]);

  // Handle tab changes
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value as 'jobs' | 'logs');
      if (value === 'logs' && !allLogsLoaded) {
        fetchAllLogs();
      }
    },
    [allLogsLoaded, fetchAllLogs]
  );

  // Parse logs and create expandable groups
  const parseLogsWithGroups = useCallback(
    (logs: string, jobId: number) => {
      const lines = logs.split('\n');
      const elements: JSX.Element[] = [];
      let currentGroup: { name: string; lines: string[]; startIndex: number } | null = null;
      let currentLines: string[] = [];
      const _lineIndex = 0;

      const flushCurrentLines = () => {
        if (currentLines.length > 0) {
          elements.push(
            <div key={`normal-${elements.length}`} className="whitespace-pre-wrap">
              {currentLines.join('\n')}
            </div>
          );
          currentLines = [];
        }
      };

      lines.forEach((line, index) => {
        if (line.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z ##\[group\](.*)$/)) {
          // Start of a group
          flushCurrentLines();
          const groupName = line.match(/##\[group\](.*)$/)?.[1]?.trim() || 'Unnamed Group';
          currentGroup = { name: groupName, lines: [], startIndex: index };
        } else if (line.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z ##\[endgroup\]$/)) {
          // End of a group
          if (currentGroup) {
            const groupKey = `${jobId}-group-${currentGroup.startIndex}`;
            const isExpanded = expandedGroups.has(groupKey);

            elements.push(
              <div
                key={groupKey}
                className={`border rounded mt-2 mb-2 ${
                  theme === 'dark' ? 'border-zinc-600' : 'border-gray-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setExpandedGroups((prev) => {
                      const newSet = new Set(prev);
                      if (newSet.has(groupKey)) {
                        newSet.delete(groupKey);
                      } else {
                        newSet.add(groupKey);
                      }
                      return newSet;
                    });
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-opacity-50 ${
                    theme === 'dark'
                      ? 'hover:bg-zinc-700 text-zinc-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="font-medium text-sm">{currentGroup.name}</span>
                  <span
                    className={`text-xs ml-auto ${
                      theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                    }`}
                  >
                    {currentGroup.lines.length} lines
                  </span>
                </button>
                {isExpanded && (
                  <div
                    className={`px-3 pb-3 border-t whitespace-pre-wrap ${
                      theme === 'dark'
                        ? 'border-zinc-600 text-zinc-400'
                        : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    {currentGroup.lines.join('\n')}
                  </div>
                )}
              </div>
            );
            currentGroup = null;
          }
        } else {
          // Regular line
          if (currentGroup) {
            currentGroup.lines.push(line);
          } else {
            currentLines.push(line);
          }
        }
      });

      // Flush any remaining lines
      flushCurrentLines();

      return elements;
    },
    [theme, expandedGroups]
  );

  // Toggle group expansion
  const _toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  }, []);

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
      second: '2-digit',
    }).format(date);
  };

  const getDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      return 'N/A';
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 'Invalid';
    }

    const diffMs = end.getTime() - start.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;

    if (diffMins > 0) {
      return `${diffMins}m ${secs}s`;
    }
    return `${secs}s`;
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
                Workflow Run Details
              </p>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedRun?.head_sha) {
                      window.open(
                        `https://github.com/${owner}/${repository}/commit/${selectedRun.head_sha}`,
                        '_blank'
                      );
                    }
                  }}
                  className={`flex items-center gap-2 ${
                    theme === 'dark'
                      ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={!selectedRun?.head_sha}
                >
                  <GitCommit className="h-4 w-4" />
                  Commit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open(`https://github.com/${owner}/${repository}/tags`, '_blank');
                  }}
                  className={`flex items-center gap-2 ${
                    theme === 'dark'
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
                  onClick={() => {
                    window.open(`https://github.com/${owner}/${repository}/actions`, '_blank');
                  }}
                  className={`flex items-center gap-2 ${
                    theme === 'dark'
                      ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Actions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Activity
              className={`h-8 w-8 mx-auto mb-4 animate-spin ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
            />
            <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
              Loading workflow run details...
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

        {/* Workflow Run Summary */}
        {!isLoading && selectedRun && (
          <div className="space-y-6">
            {/* Run Info Card */}
            <Card
              className={`p-6 ${
                theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedRun.status, selectedRun.conclusion)}
                  <div>
                    <h2
                      className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      {selectedRun.display_title}
                    </h2>
                    <p
                      className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                    >
                      Run #{selectedRun.run_number} •{' '}
                      {getStatusText(selectedRun.status, selectedRun.conclusion)}
                    </p>
                  </div>
                </div>
                <a
                  href={selectedRun.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 text-sm hover:underline ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  View on GitHub
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p
                    className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                  >
                    Branch
                  </p>
                  <div className="flex items-center gap-2">
                    <GitBranch
                      className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`}
                    />
                    <span
                      className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                    >
                      {selectedRun.head_branch}
                    </span>
                  </div>
                </div>

                <div>
                  <p
                    className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                  >
                    Event
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedRun.event}
                  </Badge>
                </div>

                <div>
                  <p
                    className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                  >
                    Triggered By
                  </p>
                  <div className="flex items-center gap-2">
                    <User
                      className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`}
                    />
                    <span
                      className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                    >
                      {selectedRun.actor.login}
                    </span>
                  </div>
                </div>

                <div>
                  <p
                    className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                  >
                    Started
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock
                      className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`}
                    />
                    <span
                      className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                    >
                      {formatDate(selectedRun.run_started_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p
                  className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                >
                  Commit SHA
                </p>
                <code
                  className={`text-xs font-mono px-2 py-1 rounded ${
                    theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedRun.head_sha}
                </code>
              </div>
            </Card>

            {/* Jobs and Logs Tabs */}
            <div>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList
                  className={`grid w-full grid-cols-2 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}
                >
                  <TabsTrigger
                    value="jobs"
                    className={`${theme === 'dark' ? 'data-[state=active]:bg-zinc-700 text-zinc-300' : 'data-[state=active]:bg-white text-gray-700'}`}
                  >
                    Jobs ({selectedRunJobs.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="logs"
                    className={`${theme === 'dark' ? 'data-[state=active]:bg-zinc-700 text-zinc-300' : 'data-[state=active]:bg-white text-gray-700'}`}
                  >
                    Logs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="mt-6">
                  <div className="space-y-4">
                    {selectedRunJobs.map((job: WorkflowJob) => (
                      <Card
                        key={job.id}
                        className={`overflow-hidden ${
                          theme === 'dark'
                            ? 'bg-zinc-900/50 border-zinc-800'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {getStatusIcon(job.status, job.conclusion)}
                              <div className="flex-1">
                                <h4
                                  className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                >
                                  {job.name}
                                </h4>
                                <p
                                  className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                                >
                                  {getStatusText(job.status, job.conclusion)}
                                  {job.started_at && job.completed_at && (
                                    <>
                                      {' '}
                                      • Duration: {getDuration(job.started_at, job.completed_at)}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={actionsService.getWorkflowStatusBadge(
                                job.status,
                                job.conclusion
                              )}
                              className="text-xs shrink-0"
                            >
                              {getStatusText(job.status, job.conclusion)}
                            </Badge>
                          </div>

                          {/* Job Steps */}
                          <div className="mt-3 pt-3 border-t border-zinc-800">
                            <h5
                              className={`text-xs font-medium mb-3 uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                            >
                              Steps ({job.steps.length})
                            </h5>
                            <div className="space-y-2">
                              {job.steps.map((step, index) => (
                                <div
                                  key={`${job.id}-step-${step.number || index}`}
                                  className={`flex items-start gap-3 p-3 rounded ${
                                    theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {getStatusIcon(step.status, step.conclusion)}
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                                      >
                                        {step.name}
                                      </p>
                                      <p
                                        className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                                      >
                                        Step {step.number || index + 1}
                                        {step.started_at && step.completed_at && (
                                          <>
                                            {' '}
                                            • Duration:{' '}
                                            {getDuration(step.started_at, step.completed_at)}
                                          </>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant={actionsService.getWorkflowStatusBadge(
                                      step.status,
                                      step.conclusion
                                    )}
                                    className="text-xs shrink-0"
                                  >
                                    {getStatusText(step.status, step.conclusion)}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="mt-6">
                  {isLoadingJobLogs && (
                    <div className="text-center py-12">
                      <Activity
                        className={`h-8 w-8 mx-auto mb-4 animate-spin ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                      />
                      <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                        Loading all logs...
                      </p>
                    </div>
                  )}

                  {jobLogsError && (
                    <div
                      className={`p-4 rounded-lg mb-6 ${
                        theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {jobLogsError}
                    </div>
                  )}

                  {!isLoadingJobLogs && selectedRunJobs.length > 0 && (
                    <Card
                      className={`${
                        theme === 'dark'
                          ? 'bg-zinc-900/50 border-zinc-800'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div
                        className={`px-3 py-2 text-xs font-medium border-b ${
                          theme === 'dark'
                            ? 'text-zinc-400 border-zinc-700 bg-zinc-800/50'
                            : 'text-gray-600 border-gray-200 bg-gray-50'
                        }`}
                      >
                        Complete Workflow Logs
                      </div>
                      <div
                        className={`max-h-[80vh] overflow-auto ${
                          theme === 'dark' ? 'bg-black/20' : 'bg-gray-50/50'
                        }`}
                      >
                        <div
                          className={`p-4 text-xs font-mono ${
                            theme === 'dark' ? 'text-zinc-300' : 'text-gray-800'
                          }`}
                        >
                          {selectedRunJobs.map((job: WorkflowJob) => {
                            const currentJobLogs = jobLogs[job.id];

                            if (!currentJobLogs) {
                              return null;
                            }

                            return (
                              <div key={`job-logs-${job.id}`} className="mb-6">
                                <div
                                  className={`font-bold text-sm mb-3 pb-2 border-b ${
                                    theme === 'dark'
                                      ? 'text-zinc-200 border-zinc-600'
                                      : 'text-gray-800 border-gray-300'
                                  }`}
                                >
                                  {job.name} (Job ID: {job.id})
                                </div>
                                {parseLogsWithGroups(currentJobLogs, job.id)}
                              </div>
                            );
                          })}
                          {Object.keys(jobLogs).length === 0 && (
                            <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>
                              No logs available. Logs will appear here once loaded.
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !selectedRun && !error && (
          <div className="text-center py-12">
            <Activity
              className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
            />
            <p
              className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
            >
              No workflow run found
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Unable to load workflow run details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
