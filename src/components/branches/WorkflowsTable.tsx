'use client';

import type { Workflow } from '@/lib/api/actions.service';
import { Activity, Copy, Download, Edit, ExternalLink } from 'lucide-react';
import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';
import CreateWorkflowModal from '@/components/branches/CreateWorkflowModal';
import { EditWorkflowModal } from '@/components/branches/EditWorkflowModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { actionsService } from '@/lib/api/actions.service';
import { useThemeStore } from '@/store/themeStore';

export type WorkflowsTableRef = {
  refresh: () => void;
  openCreateModal: () => void;
};

type WorkflowsTableProps = {
  owner: string;
  repository: string;
};

export const WorkflowsTable = ({
  ref,
  owner,
  repository,
}: WorkflowsTableProps & { ref?: React.RefObject<WorkflowsTableRef | null> }) => {
  const { theme } = useThemeStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 15;

  // Calculate pagination
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedWorkflows = workflows.slice(startIndex, endIndex);
  const totalPages = Math.ceil(workflows.length / perPage);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await actionsService.fetchWorkflows(owner, repository);

      // Transform the data to add missing fields with defaults
      const transformedWorkflows = response.data.workflows.map((workflow, index) => ({
        ...workflow,
        id: index + 1, // Generate an ID since it's not provided
        state: 'active' as const, // Default to active since we don't have this info
        badge_url: workflow.url ? `${workflow.url}/badge.svg` : '',
        html_url: workflow.url || '',
        created_at: undefined, // Will be handled by formatDate
        updated_at: undefined, // Will be handled by formatDate
      }));
      setWorkflows(transformedWorkflows);
      setPage(1); // Reset to first page when data changes
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setError('Failed to fetch workflows. Please try again.');
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [owner, repository]);

  useEffect(() => {
    fetchWorkflows();
  }, [owner, repository, fetchWorkflows]);

  useImperativeHandle(ref, () => ({
    refresh: fetchWorkflows,
    openCreateModal: () => setIsCreateModalOpen(true),
  }));

  const handleCreateWorkflow = (success: boolean, message?: string) => {
    if (success) {
      setNotification({ type: 'success', message: message || 'Workflow created successfully!' });
      // Refresh workflows list
      fetchWorkflows();
    } else {
      setNotification({ type: 'error', message: message || 'Failed to create workflow' });
    }

    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleRefresh = () => {
    fetchWorkflows();
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWorkflow(null);
    // Optionally refresh workflows after edit
    fetchWorkflows();
  };

  const _formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStateColor = (state: string) => {
    return state === 'active'
      ? theme === 'dark'
        ? 'bg-green-500/10 text-green-400 border-green-500/20'
        : 'bg-green-50 text-green-600 border-green-200'
      : theme === 'dark'
        ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        : 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-md border ${
            notification.type === 'success'
              ? theme === 'dark'
                ? 'bg-green-900/20 border-green-700 text-green-300'
                : 'bg-green-50 border-green-300 text-green-700'
              : theme === 'dark'
                ? 'bg-red-900/20 border-red-700 text-red-300'
                : 'bg-red-50 border-red-300 text-red-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className={`text-sm underline ${
                notification.type === 'success'
                  ? theme === 'dark'
                    ? 'text-green-400 hover:text-green-300'
                    : 'text-green-600 hover:text-green-500'
                  : theme === 'dark'
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-red-600 hover:text-red-500'
              }`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Workflows Table */}
      <Card
        className={`${
          theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'
        }`}
      >
        {/* Error State */}
        {error && (
          <div className="p-6 text-center">
            <div className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className={`mt-4 ${
                theme === 'dark'
                  ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="p-6">
            <TableSkeleton rows={5} columns={6} />
          </div>
        )}

        {/* Table Content */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow
                    className={
                      theme === 'dark'
                        ? 'border-zinc-800 hover:bg-zinc-800/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }
                  >
                    <TableHead
                      className={`${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'} font-medium`}
                    >
                      Workflow
                    </TableHead>
                    <TableHead
                      className={`${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'} font-medium`}
                    >
                      File Path
                    </TableHead>
                    <TableHead
                      className={`${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'} font-medium`}
                    >
                      SHA
                    </TableHead>
                    <TableHead
                      className={`${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'} font-medium`}
                    >
                      Size
                    </TableHead>
                    <TableHead
                      className={`${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'} font-medium`}
                    >
                      Status
                    </TableHead>
                    <TableHead
                      className={`${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'} font-medium`}
                    >
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWorkflows.map((workflow, index) => (
                    <TableRow
                      key={workflow.sha || `workflow-${index}`}
                      className={`${
                        theme === 'dark'
                          ? 'border-zinc-800 hover:bg-zinc-800/30'
                          : 'border-gray-200 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Activity
                            className={`h-4 w-4 ${
                              (workflow.state || 'active') === 'active'
                                ? theme === 'dark'
                                  ? 'text-green-400'
                                  : 'text-green-600'
                                : theme === 'dark'
                                  ? 'text-gray-500'
                                  : 'text-gray-400'
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'
                            }`}
                          >
                            {workflow.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code
                          className={`text-xs px-2 py-1 rounded ${
                            theme === 'dark'
                              ? 'bg-zinc-800 text-zinc-300'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {workflow.path}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code
                            className={`text-xs px-2 py-1 rounded font-mono ${
                              theme === 'dark'
                                ? 'bg-zinc-800 text-zinc-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {workflow.sha.substring(0, 8)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Copy SHA"
                            onClick={() => copyToClipboard(workflow.sha)}
                            className={`h-6 w-6 p-0 ${
                              theme === 'dark'
                                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}
                        >
                          {formatFileSize(workflow.size)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize border ${getStateColor(workflow.state || 'active')}`}
                        >
                          {workflow.state || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditWorkflow(workflow)}
                            className={`h-8 px-3 ${
                              theme === 'dark'
                                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(workflow.url, '_blank')}
                            className={`h-8 px-3 ${
                              theme === 'dark'
                                ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(workflow.downloadUrl, '_blank')}
                            className={`h-8 px-3 ${
                              theme === 'dark'
                                ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Raw
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {workflows.length === 0 && (
              <div className="text-center py-12">
                <Activity
                  className={`h-12 w-12 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                  }`}
                />
                <p
                  className={`text-lg font-medium mb-2 ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}
                >
                  No workflows found
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Create your first workflow to get started with GitHub Actions
                </p>
              </div>
            )}

            {/* Pagination */}
            {workflows.length > 0 && (
              <div
                className={`px-6 py-4 border-t flex items-center justify-between ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Showing {startIndex + 1}-{Math.min(endIndex, workflows.length)} of{' '}
                  {workflows.length} workflows
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!hasPrevPage || loading}
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
                    disabled={!hasNextPage || loading}
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
          </>
        )}
      </Card>

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWorkflow}
        owner={owner}
        repository={repository}
      />

      {/* Edit Workflow Modal */}
      {editingWorkflow && (
        <EditWorkflowModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          owner={owner}
          repository={repository}
          workflowPath={editingWorkflow.path}
          workflowName={editingWorkflow.name}
        />
      )}
    </div>
  );
};

WorkflowsTable.displayName = 'WorkflowsTable';
