'use client';

import type { WorkflowFile } from '@/lib/api/actions.service';
import { Loader2, Save, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWorkflowForm } from '@/hooks/useWorkflowForm';
import { actionsService } from '@/lib/api/actions.service';

import { parseWorkflowYaml } from '@/lib/workflow-parser';
import { useThemeStore } from '@/store/themeStore';
import { WorkflowForm } from './WorkflowForm';

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
  const form = useWorkflowForm();

  // Destructure needed methods from form
  const { setValues, initializeFromTemplate, getFinalPayload } = form;

  const [workflowFile, setWorkflowFile] = useState<WorkflowFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflowFile = useCallback(async () => {
    if (!isOpen || !workflowPath) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Template first (Required for form structure)
      // We assume build-publish-v1 for now as it's the primary server-driven template
      const templateResponse = await actionsService.fetchTemplateById('build-publish-v1');
      initializeFromTemplate(templateResponse.data);

      // 2. Fetch Workflow File
      const response = await actionsService.fetchWorkflowFile(owner, repository, workflowPath);
      setWorkflowFile(response.data);

      try {
        const parsedData = parseWorkflowYaml(response.data.content);

        // 3. Map parsed data to the nested sections the dynamic form expects
        const initialValues: Record<string, any> = {
          base_info: {
            workflowName: parsedData.workflowName || workflowName,
            workflowFileName: workflowPath.split('/').pop() || '',
          },
          deployment_selection: {
            deploymentType: parsedData.deploymentType,
          },
          project_config: parsedData.projects,
        };

        if (parsedData.deploymentType === 'ec2') {
          initialValues.ec2_common = parsedData.ec2CommonFields || {};
          if (!initialValues.ec2_common.releaseTag) {
            const version = templateResponse.data.version;
            initialValues.ec2_common.releaseTag = version.startsWith('v') ? version : `v${version}`;
          }
          initialValues.ec2_projects = parsedData.ec2Projects;
        } else {
          initialValues.kubernetes_common = parsedData.kubernetesCommonFields || {};
          if (!initialValues.kubernetes_common.releaseTag) {
            const version = templateResponse.data.version;
            initialValues.kubernetes_common.releaseTag = version.startsWith('v')
              ? version
              : `v${version}`;
          }
          initialValues.kubernetes_projects = parsedData.kubernetesProjects;
        }

        setValues(initialValues);
      } catch (parseErr) {
        console.error('Failed to parse workflow YAML:', parseErr);
        setError(
          'Failed to parse workflow content. The file format might be invalid or unsupported.'
        );
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch workflow file');
    } finally {
      setLoading(false);
    }
  }, [isOpen, owner, repository, workflowPath, workflowName, setValues, initializeFromTemplate]);

  const handleSave = useCallback(async () => {
    if (!workflowFile) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // 1. Construct payload from form using the new centralized mapper
      const payload = getFinalPayload(owner, repository);

      // Handle the workflowFileName .yml extension if present in payload
      if (payload.workflowFileName && !payload.workflowFileName.endsWith('.yml')) {
        payload.workflowFileName = `${payload.workflowFileName}.yml`;
      }

      // 2. Generate YAML via Preview API
      const previewResponse = await actionsService.previewWorkflow(payload);
      const generatedYaml = previewResponse.data.yaml_content;

      // 3. Update File
      await actionsService.updateWorkflowFile(
        owner,
        repository,
        workflowFile.path,
        generatedYaml,
        workflowFile.sha
      );

      // Refresh
      await fetchWorkflowFile();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update workflow file');
    } finally {
      setSaving(false);
    }
  }, [workflowFile, getFinalPayload, owner, repository, fetchWorkflowFile, onClose]);

  const handleClose = () => {
    // Basic unsaved changes check can be added here
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkflowFile();
    }
  }, [isOpen, fetchWorkflowFile]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-7xl max-h-[95vh] overflow-hidden flex flex-col ${
          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-300'
        }`}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle
            className={`text-xl font-bold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Edit Workflow: {workflowName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                Loading workflow...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 p-6">
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
                  theme === 'dark'
                    ? 'border-red-500/50 text-red-400'
                    : 'border-red-300 text-red-600'
                }
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-1 py-4">
            {/* Render Step 1 (Basic Info) */}
            <div className="mb-8">
              <h3
                className={`text-lg font-semibold mb-4 px-1 border-b pb-2 ${theme === 'dark' ? 'text-zinc-200 border-zinc-700' : 'text-gray-800 border-gray-200'}`}
              >
                General Settings & Projects
              </h3>
              <WorkflowForm form={form} currentStep={1} />
            </div>

            {/* Render Step 2 (Deployment Config) */}
            <div>
              <h3
                className={`text-lg font-semibold mb-4 px-1 border-b pb-2 ${theme === 'dark' ? 'text-zinc-200 border-zinc-700' : 'text-gray-800 border-gray-200'}`}
              >
                Deployment Configuration
              </h3>
              <WorkflowForm form={form} currentStep={2} />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div
          className={`flex-shrink-0 flex items-center justify-end gap-3 pt-4 border-t ${
            theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
          }`}
        >
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
            disabled={loading || saving || !!error}
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
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
