'use client';

import type { CreateWorkflowRequest } from '@/lib/api/actions.service';
import { X } from 'lucide-react';
import React, { useState } from 'react';
import { WorkflowForm } from '@/components/branches/WorkflowForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkflowForm } from '@/hooks/useWorkflowForm';
import { actionsService } from '@/lib/api/actions.service';
import { useThemeStore } from '@/store/themeStore';

type CreateWorkflowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean, message?: string) => void;
  owner: string;
  repository: string;
};

export default function CreateWorkflowModal({
  isOpen,
  onClose,
  onSubmit,
  owner,
  repository,
}: CreateWorkflowModalProps) {
  const { theme } = useThemeStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<{
    yaml_content: string;
    workflow_name: string;
  } | null>(null);

  const form = useWorkflowForm();
  const {
    workflowName,
    deploymentType,
    projects,
    ec2CommonFields,
    ec2Projects,
    kubernetesCommonFields,
    kubernetesProjects,
    resetForm,
    validateStep1,
    validateStep2,
  } = form;

  const handlePreviewWorkflow = async () => {
    try {
      setPreviewing(true);
      const formData: CreateWorkflowRequest = {
        owner,
        repository,
        workflowName,
        deploymentType,
        projects,
        ec2CommonFields: deploymentType === 'ec2' ? ec2CommonFields : undefined,
        ec2Projects: deploymentType === 'ec2' ? ec2Projects : undefined,
        kubernetesCommonFields:
          deploymentType === 'kubernetes' ? kubernetesCommonFields : undefined,
        kubernetesProjects: deploymentType === 'kubernetes' ? kubernetesProjects : undefined,
      };
      const response = await actionsService.previewWorkflow(formData);
      if (response.success) {
        setPreviewData({
          yaml_content: response.data.yaml_content,
          workflow_name: response.data.workflow_name,
        });
        setCurrentStep(3); // Move to preview step
      } else {
        console.error('Preview failed:', response.message);
        onSubmit(false, response.message || 'Failed to generate preview');
      }
    } catch (error: any) {
      console.error('Error generating preview:', error);

      // Check if the error response contains the actual data we need
      if (error.response?.data?.success && error.response?.data?.data) {
        const responseData = error.response.data;
        setPreviewData({
          yaml_content: responseData.data.yaml_content,
          workflow_name: responseData.data.workflow_name,
        });
        setCurrentStep(3); // Move to preview step
      } else {
        // Handle actual error - could show error message to user
        onSubmit(false, error instanceof Error ? error.message : 'Failed to generate preview');
      }
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
      return;
    }

    if (currentStep === 2) {
      if (validateStep2()) {
        await handlePreviewWorkflow();
      }
      return;
    }

    // Final submission (currentStep === 3) - call API
    try {
      setSubmitting(true);

      const formData: CreateWorkflowRequest = {
        owner,
        repository,
        workflowName,
        deploymentType,
        projects,
        ec2CommonFields: deploymentType === 'ec2' ? ec2CommonFields : undefined,
        ec2Projects: deploymentType === 'ec2' ? ec2Projects : undefined,
        kubernetesCommonFields:
          deploymentType === 'kubernetes' ? kubernetesCommonFields : undefined,
        kubernetesProjects: deploymentType === 'kubernetes' ? kubernetesProjects : undefined,
      };

      const response = await actionsService.createWorkflow(formData);

      if (response.success) {
        onSubmit(true, response.message);
        handleReset();
        onClose();
      } else {
        onSubmit(false, response.message || 'Failed to create workflow');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      onSubmit(false, error instanceof Error ? error.message : 'Failed to create workflow');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    resetForm();
    setSubmitting(false);
    setPreviewing(false);
    setPreviewData(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClose();
          }
        }}
        tabIndex={-1}
        aria-label="Close modal"
      />

      {/* Modal */}
      <Card
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
          }`}
        >
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Create Workflow
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className={`h-8 w-8 p-0 ${
              theme === 'dark'
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= 1
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : theme === 'dark'
                      ? 'bg-zinc-700 text-zinc-400'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                1
              </div>
              <div
                className={`w-12 h-0.5 ${
                  currentStep > 1
                    ? theme === 'dark'
                      ? 'bg-blue-600'
                      : 'bg-blue-600'
                    : theme === 'dark'
                      ? 'bg-zinc-700'
                      : 'bg-gray-200'
                }`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= 2
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : theme === 'dark'
                      ? 'bg-zinc-700 text-zinc-400'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
              <div
                className={`w-12 h-0.5 ${
                  currentStep > 2
                    ? theme === 'dark'
                      ? 'bg-blue-600'
                      : 'bg-blue-600'
                    : theme === 'dark'
                      ? 'bg-zinc-700'
                      : 'bg-gray-200'
                }`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= 3
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : theme === 'dark'
                      ? 'bg-zinc-700 text-zinc-400'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                3
              </div>
            </div>
          </div>

          {/* Repository Info */}
          <div className="flex items-center gap-2 text-sm">
            <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
              Repository:
            </span>
            <Badge
              variant="secondary"
              className={
                theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
              }
            >
              {owner}/{repository}
            </Badge>
          </div>

          {/* Form Content */}
          <WorkflowForm form={form} currentStep={currentStep} />

          {/* Preview Step */}
          {currentStep === 3 && previewData && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span
                  className={`text-lg font-medium ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}
                >
                  Workflow Preview
                </span>
                <div className="space-y-2">
                  <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                    Review the generated workflow YAML before creating:
                  </p>
                  <p
                    className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-800'}`}
                  >
                    File:{' '}
                    <code
                      className={`px-1 py-0.5 rounded ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}
                    >
                      .github/workflows/
                      {previewData.workflow_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.yml
                    </code>
                  </p>
                </div>
                <div className="relative">
                  <pre
                    className={`text-xs p-4 rounded-lg border overflow-x-auto max-h-96 ${
                      theme === 'dark'
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  >
                    <code>{previewData.yaml_content}</code>
                  </pre>
                </div>

                <div
                  className={`p-3 rounded-md ${
                    theme === 'dark'
                      ? 'bg-blue-900/20 border border-blue-700'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    💡 This preview shows the workflow file that will be created. You can copy it or
                    proceed to create the workflow.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            className={`flex items-center justify-end gap-3 pt-4 border-t ${
              theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
            }`}
          >
            {(currentStep === 2 || currentStep === 3) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep === 3 ? 2 : 1)}
                disabled={previewing || submitting}
                className={
                  theme === 'dark'
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                }
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className={
                theme === 'dark'
                  ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={
                currentStep === 1
                  ? () => setCurrentStep(2)
                  : currentStep === 2
                    ? handlePreviewWorkflow
                    : handleSubmit
              }
              disabled={
                previewing ||
                submitting ||
                (currentStep === 1
                  ? !workflowName || projects.some((p) => !p.name)
                  : currentStep === 2
                    ? deploymentType === 'ec2'
                      ? !ec2CommonFields.credentialId ||
                        !ec2CommonFields.awsRegion ||
                        !ec2CommonFields.jenkinsJobs ||
                        !ec2CommonFields.codeownersEmails ||
                        ec2Projects.some((p) => !p.name || !p.port || !p.logDriver)
                      : deploymentType === 'kubernetes'
                        ? !kubernetesCommonFields.jenkinsJobName ||
                          !kubernetesCommonFields.releaseTag ||
                          !kubernetesCommonFields.helmValuesRepository ||
                          !kubernetesCommonFields.codeownersEmailIds ||
                          kubernetesProjects.some((p) => !p.name)
                        : false
                    : false)
              }
              className={
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
              }
            >
              {previewing
                ? 'Generating Preview...'
                : submitting
                  ? 'Creating...'
                  : currentStep === 1
                    ? 'Next'
                    : currentStep === 2
                      ? 'Preview Workflow'
                      : 'Create Workflow'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
