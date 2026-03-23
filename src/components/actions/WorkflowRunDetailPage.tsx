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
  User,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());
  const [loadingJobLogsMap, setLoadingJobLogsMap] = useState<Record<number, boolean>>({});

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

  useEffect(() => {
    const ownerParam = searchParams.get('owner');
    const repoParam = searchParams.get('repo');
    const runIdParam = searchParams.get('runId');

    if (ownerParam && repoParam && runIdParam) {
      setRepository(ownerParam, repoParam);
      // Reset logs when navigating to a different run
      clearJobLogs();
      fetchWorkflowRunDetail(ownerParam, repoParam, Number.parseInt(runIdParam, 10));
    }
  }, [searchParams, setRepository, clearJobLogs, fetchWorkflowRunDetail]);

  const toggleJobLogs = useCallback(
    async (jobId: number) => {
      const isExpanded = expandedJobs.has(jobId);

      if (!isExpanded) {
        if (!jobLogs[jobId]) {
          try {
            setLoadingJobLogsMap((prev) => ({ ...prev, [jobId]: true }));
            const response = await actionsService.fetchJobLogs(owner, repository, jobId);
            setJobLogs(jobId, response.data.logs);
          } catch (err) {
            console.error(`Failed to fetch logs for job ${jobId}:`, err);
            setJobLogs(
              jobId,
              `Error loading logs: ${err instanceof Error ? err.message : 'Unknown error'}`
            );
          } finally {
            setLoadingJobLogsMap((prev) => ({ ...prev, [jobId]: false }));
          }
        }

        setExpandedJobs((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
      } else {
        setExpandedJobs((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      }
    },
    [expandedJobs, jobLogs, owner, repository, setJobLogs]
  );

  // Parse logs and create expandable groups
  const parseLogsWithGroups = useCallback(
    (logs: string, jobId: number) => {
      const lines = logs.split('\n');
      const elements: React.ReactNode[] = [];
      let currentGroup: { name: string; lines: string[]; startIndex: number } | null = null;
      let currentLines: string[] = [];

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
                  theme === 'dark' ? 'border-zinc-800' : 'border-gray-300'
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
                      ? 'hover:bg-zinc-800 text-zinc-400'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="font-medium text-xs">{currentGroup.name}</span>
                  <span
                    className={`text-[9px] ml-auto opacity-50 ${
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
                        ? 'border-zinc-800 text-zinc-400'
                        : 'border-gray-200 text-gray-600'
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
        theme === 'dark' ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-50 text-zinc-700'
      }`}
    >
      {/* Cinematic Header */}
      <div
        className={`border-b transition-all duration-500 ${
          theme === 'dark' ? 'bg-zinc-950 border-white/5' : 'bg-white border-black/5'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/branches?owner=${owner}&repo=${repository}`}
              className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                theme === 'dark'
                  ? 'border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white'
                  : 'border-black/5 hover:bg-black/5 text-zinc-500 hover:text-black'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <span>{owner}</span>
                <ChevronRight className="h-2 w-2 opacity-50" />
                <span>{repository}</span>
              </div>
              <h1
                className={`text-sm font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}
              >
                {selectedRun?.display_title || 'Workflow Run'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (selectedRun?.head_sha) {
                  window.open(
                    `https://github.com/${owner}/${repository}/commit/${selectedRun.head_sha}`,
                    '_blank'
                  );
                }
              }}
              className="h-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
              disabled={!selectedRun?.head_sha}
            >
              <GitCommit className="h-3.5 w-3.5 mr-2" />
              Commit
            </Button>
            <div className={`h-4 w-px ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />
            <a
              href={selectedRun?.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`h-8 px-3 flex items-center gap-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200'
              }`}
            >
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 animate-pulse">
              Initializing Pipeline Data...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl border border-red-500/10 bg-red-500/5 text-red-500 text-sm font-medium flex items-center gap-3 mb-8">
            <XCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {!isLoading && selectedRun && (
          <div className="space-y-10">
            {/* Status Spotlight Hero (Compact) */}
            <div className="relative group">
              <div
                className={`absolute -inset-0.5 rounded-3xl blur-2xl opacity-20 transition-opacity group-hover:opacity-30 ${
                  selectedRun.conclusion === 'success'
                    ? 'bg-green-500'
                    : selectedRun.conclusion === 'failure'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                }`}
              />

              <Card
                className={`relative overflow-hidden rounded-3xl border-0 shadow-2xl ${
                  theme === 'dark' ? 'bg-zinc-900/40' : 'bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
                  {/* Status Big Indicator */}
                  <div className="p-6 md:p-8 flex flex-col items-center justify-center gap-4 min-w-[200px]">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 blur-xl opacity-40 animate-pulse ${
                          selectedRun.conclusion === 'success'
                            ? 'bg-green-500'
                            : selectedRun.conclusion === 'failure'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                        }`}
                      />
                      <div
                        className={`relative h-14 w-14 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ${
                          theme === 'dark' ? 'bg-zinc-950/80 shadow-2xl' : 'bg-zinc-50 shadow-xl'
                        }`}
                      >
                        {getStatusIcon(selectedRun.status, selectedRun.conclusion)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">
                        Conclusion
                      </p>
                      <h2
                        className={`text-xl font-black tracking-tight ${
                          selectedRun.conclusion === 'success'
                            ? 'text-green-500'
                            : selectedRun.conclusion === 'failure'
                              ? 'text-red-500'
                              : theme === 'dark'
                                ? 'text-white'
                                : 'text-zinc-900'
                        }`}
                      >
                        {getStatusText(selectedRun.status, selectedRun.conclusion)}
                      </h2>
                    </div>
                  </div>

                  {/* Metadata Grid (Dense) */}
                  <div className="flex-1 p-6 md:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-1.5 leading-none">
                          <GitBranch className="h-2.5 w-2.5" />
                          Branch
                        </p>
                        <div
                          className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}
                        >
                          {selectedRun.head_branch}
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-1.5 leading-none">
                          <Activity className="h-2.5 w-2.5" />
                          Event
                        </p>
                        <Badge
                          className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 ${
                            theme === 'dark'
                              ? 'bg-zinc-950 text-blue-400 border-white/5'
                              : 'bg-blue-50 text-blue-600 border-black/5'
                          } border`}
                        >
                          {selectedRun.event}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-1.5 leading-none">
                          <User className="h-2.5 w-2.5" />
                          Actor
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                            {selectedRun.actor.login.charAt(0)}
                          </div>
                          <span
                            className={`text-xs font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}
                          >
                            {selectedRun.actor.login}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-1.5 leading-none">
                          <Clock className="h-2.5 w-2.5" />
                          Runtime
                        </p>
                        <div
                          className={`text-xs font-bold ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}
                        >
                          {getDuration(selectedRun.run_started_at, selectedRun.updated_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Interactive Jobs List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                  Pipeline Execution ({selectedRunJobs.length})
                </h3>
              </div>

              <div className="space-y-4">
                {selectedRunJobs.map((job: WorkflowJob) => {
                  const isExpanded = expandedJobs.has(job.id);
                  const isLoadingLogs = loadingJobLogsMap[job.id];

                  return (
                    <div key={job.id} className="space-y-2">
                      <Card
                        onClick={() => toggleJobLogs(job.id)}
                        className={`group cursor-pointer overflow-hidden transition-all duration-300 ${
                          isExpanded
                            ? theme === 'dark'
                              ? 'bg-zinc-900 border-blue-500/30'
                              : 'bg-white border-blue-500/30 ring-1 ring-blue-500/10 shadow-2xl'
                            : theme === 'dark'
                              ? 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60'
                              : 'bg-white border-black/5 hover:shadow-md'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="relative">
                                <div
                                  className={`absolute inset-0 blur-sm opacity-20 ${
                                    job.conclusion === 'success'
                                      ? 'bg-green-500'
                                      : job.conclusion === 'failure'
                                        ? 'bg-red-500'
                                        : 'bg-blue-500'
                                  }`}
                                />
                                <div className="relative">
                                  {getStatusIcon(job.status, job.conclusion)}
                                </div>
                              </div>
                              <div className="truncate flex-1">
                                <h4
                                  className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}
                                >
                                  {job.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                                    {getStatusText(job.status, job.conclusion)}
                                    {job.started_at && job.completed_at && (
                                      <> • {getDuration(job.started_at, job.completed_at)}</>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {isLoadingLogs && (
                                <Activity className="h-3 w-3 animate-spin text-blue-500" />
                              )}
                              <div
                                className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                                  isExpanded
                                    ? 'bg-blue-500 text-white rotate-180'
                                    : 'bg-zinc-500/10 text-zinc-500'
                                }`}
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </div>
                            </div>
                          </div>

                          {/* Steps Visualization (Horizontal Pills) */}
                          <div className="mt-4 flex flex-wrap gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            {job.steps.map((step, idx) => (
                              <div
                                key={`${job.id}-step-badge-${idx}`}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                                  theme === 'dark'
                                    ? 'bg-black/20 border-white/5'
                                    : 'bg-zinc-50 border-black/5'
                                }`}
                              >
                                {getStatusIcon(step.status, step.conclusion)}
                                <span
                                  className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}
                                >
                                  {step.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>

                      {/* Expandable Log Section */}
                      {isExpanded && (
                        <Card
                          className={`overflow-hidden rounded-2xl border-0 shadow-2xl animate-in slide-in-from-top-2 duration-300 ${
                            theme === 'dark' ? 'bg-black/60 shadow-black/40' : 'bg-zinc-50'
                          }`}
                        >
                          <div
                            className={`flex items-center justify-between px-5 py-2.5 border-b ${
                              theme === 'dark'
                                ? 'border-white/5 bg-white/5'
                                : 'border-black/5 bg-black/5'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-red-500/40" />
                              <div className="h-2 w-2 rounded-full bg-yellow-500/40" />
                              <div className="h-2 w-2 rounded-full bg-green-500/40" />
                            </div>
                            <div
                              className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${
                                theme === 'dark' ? 'text-zinc-500/60' : 'text-zinc-500'
                              }`}
                            >
                              {job.name.toLowerCase().replace(/\s+/g, '_')}.log
                            </div>
                            <div className="flex items-center gap-2">
                              {isLoadingLogs && (
                                <span className="text-[8px] font-black uppercase text-blue-500 animate-pulse">
                                  Syncing...
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className={`font-mono text-[11px] leading-relaxed selection:bg-blue-500/30 p-6 ${
                              theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'
                            }`}
                          >
                            {jobLogs[job.id] ? (
                              <div className="space-y-1">
                                {parseLogsWithGroups(jobLogs[job.id], job.id)}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
                                <Activity className="h-6 w-6 mb-3 animate-spin opacity-40" />
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                                  Streaming logs...
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !selectedRun && !error && (
          <div className="text-center py-20">
            <Activity
              className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-800' : 'text-gray-300'}`}
            />
            <p
              className={`text-sm font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}
            >
              Protocol Offline
            </p>
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-zinc-700' : 'text-gray-500'}`}>
              Unable to establish uplink with this workflow run.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
