'use client';

import type { WorkflowFile } from '@/lib/api/actions.service';
import { Code, FileEdit, Loader2, Save, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { actionsService } from '@/lib/api/actions.service';
import { useThemeStore } from '@/store/themeStore';

type EditWorkflowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repository: string;
  workflowPath: string;
  workflowName: string;
};

export function EditWorkflowModal({
  isOpen,
  onClose,
  owner,
  repository,
  workflowPath,
  workflowName,
}: EditWorkflowModalProps) {
  const { theme } = useThemeStore();
  const [workflowFile, setWorkflowFile] = useState<WorkflowFile | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchWorkflowFile = useCallback(async () => {
    if (!isOpen || !workflowPath) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await actionsService.fetchWorkflowFile(owner, repository, workflowPath);
      setWorkflowFile(response.data);
      setEditedContent(response.data.content);
      setHasChanges(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch workflow file');
    } finally {
      setLoading(false);
    }
  }, [isOpen, owner, repository, workflowPath]);

  const handleSave = useCallback(async () => {
    if (!workflowFile || !hasChanges) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await actionsService.updateWorkflowFile(
        owner,
        repository,
        workflowFile.path,
        editedContent,
        workflowFile.sha
      );

      // Refresh the file data after successful update
      await fetchWorkflowFile();

      // Show success notification or close modal
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update workflow file');
    } finally {
      setSaving(false);
    }
  }, [workflowFile, editedContent, hasChanges, owner, repository, fetchWorkflowFile, onClose]);

  const handleContentChange = (content: string) => {
    setEditedContent(content);
    setHasChanges(content !== workflowFile?.content);
  };

  const handleClose = () => {
    if (hasChanges) {
      // eslint-disable-next-line no-alert
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setWorkflowFile(null);
        setEditedContent('');
        setHasChanges(false);
        setError(null);
        onClose();
      }
    } else {
      setWorkflowFile(null);
      setEditedContent('');
      setHasChanges(false);
      setError(null);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkflowFile();
    }
  }, [isOpen, fetchWorkflowFile]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-7xl max-h-[95vh] overflow-hidden ${
          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-300'
        }`}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle
            className={`text-xl font-bold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            <FileEdit className="h-5 w-5" />
            Edit Workflow: {workflowName}
            {hasChanges && (
              <Badge variant="outline" className="text-xs">
                Unsaved changes
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                Loading workflow file...
              </span>
            </div>
          </div>
        ) : error ? (
          <div
            className={`text-center py-8 px-4 rounded-lg ${
              theme === 'dark'
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            <p className="mb-4">{error}</p>
            <Button
              onClick={fetchWorkflowFile}
              variant="outline"
              size="sm"
              className={
                theme === 'dark' ? 'border-red-500/50 text-red-400' : 'border-red-300 text-red-600'
              }
            >
              Retry
            </Button>
          </div>
        ) : workflowFile ? (
          <div className="space-y-4 max-h-[calc(95vh-120px)] overflow-y-auto">
            {/* File Info */}
            <div
              className={`p-3 rounded-lg ${
                theme === 'dark'
                  ? 'bg-zinc-800/50 border border-zinc-700'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4 text-sm">
                <div
                  className={`flex items-center gap-1 ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                  }`}
                >
                  <Code className="h-4 w-4" />
                  <span>{workflowFile.path}</span>
                </div>
                <div className={`${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  {workflowFile.size} bytes
                </div>
                <div className={`${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  SHA: {workflowFile.sha.substring(0, 8)}...
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <label
                htmlFor="workflow-content"
                className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                }`}
              >
                Workflow Content
              </label>
              <Textarea
                id="workflow-content"
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className={`min-h-[450px] max-h-[500px] font-mono text-sm resize-y ${
                  theme === 'dark'
                    ? 'bg-zinc-900/50 border-zinc-700 text-zinc-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter your workflow YAML content..."
              />
            </div>

            {/* Action Buttons */}
            <div
              className={`flex items-center justify-between pt-4 border-t ${
                theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
              }`}
            >
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                {hasChanges ? 'You have unsaved changes' : 'No changes made'}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={saving}
                  className={
                    theme === 'dark'
                      ? 'border-zinc-600 text-zinc-300 hover:bg-zinc-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`${
                    theme === 'dark'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Updating...' : 'Update Workflow'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
