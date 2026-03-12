'use client';

import type { CreateWorkflowRequest } from '@/lib/api/actions.service';
import { Check, ChevronRight, Eye, FileText, Settings, X } from 'lucide-react';
import React, { useState } from 'react';
import { WorkflowForm } from '@/components/branches/WorkflowForm';
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
    workflowFileName,
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
        workflowFileName: workflowFileName.endsWith('.yml')
          ? workflowFileName
          : `${workflowFileName}.yml`,
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
        workflowFileName: workflowFileName.endsWith('.yml')
          ? workflowFileName
          : `${workflowFileName}.yml`,
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
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${
          theme === 'dark'
            ? 'bg-zinc-900/90 border-zinc-700/50 backdrop-blur-xl text-white'
            : 'bg-white/95 border-gray-200 backdrop-blur-xl text-gray-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <Settings
                className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
              />
            </div>
            <div>
              <h2
                className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                Create Workflow
              </h2>
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                Configure and deploy your automation workflow
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className={`h-9 w-9 p-0 rounded-full transition-colors ${
              theme === 'dark'
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <form className="flex flex-col flex-1 overflow-hidden" onSubmit={handleSubmit}>
          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-8 space-y-8">
              {/* New Step Indicator */}
              <div className="relative mb-12">
                <div className="flex items-center justify-between max-w-2xl mx-auto relative z-10">
                  {[
                    { step: 1, label: 'Basic Info', icon: FileText },
                    { step: 2, label: 'Deployment', icon: Settings },
                    { step: 3, label: 'Preview', icon: Eye },
                  ].map((item, index) => (
                    <React.Fragment key={item.step}>
                      <div className="flex flex-col items-center group">
                        <div
                          className={`
                            relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 border-2
                            ${
                              currentStep === item.step
                                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30 scale-110 text-white'
                                : currentStep > item.step
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : theme === 'dark'
                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-400'
                            }
                          `}
                        >
                          {currentStep > item.step ? (
                            <Check className="h-6 w-6" />
                          ) : (
                            <item.icon className="h-5 w-5" />
                          )}

                          {/* Status Pulse */}
                          {currentStep === item.step && (
                            <span className="absolute inset-0 rounded-2xl bg-blue-500 animate-ping opacity-20" />
                          )}
                        </div>
                        <span
                          className={`
                          mt-3 text-xs font-semibold uppercase tracking-wider transition-colors
                          ${
                            currentStep === item.step
                              ? 'text-blue-500'
                              : currentStep > item.step
                                ? 'text-emerald-500'
                                : theme === 'dark'
                                  ? 'text-zinc-500'
                                  : 'text-gray-400'
                          }
                        `}
                        >
                          {item.label}
                        </span>
                      </div>
                      {index < 2 && (
                        <div className="flex-1 px-4 mb-7">
                          <div
                            className={`h-1 rounded-full transition-all duration-500 ${
                              currentStep > item.step
                                ? 'bg-emerald-500'
                                : theme === 'dark'
                                  ? 'bg-zinc-800'
                                  : 'bg-gray-100'
                            }`}
                          >
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: currentStep > item.step ? '100%' : '0%' }}
                            />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Repository Context Card */}
              <div
                className={`
                flex items-center gap-3 p-4 rounded-xl border transition-all
                ${
                  theme === 'dark'
                    ? 'bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800/60'
                    : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                }
              `}
              >
                <div className="p-2 rounded-lg bg-zinc-700/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
                  >
                    Target Repository
                  </span>
                  <span
                    className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'}`}
                  >
                    {owner} / <span className="text-blue-500">{repository}</span>
                  </span>
                </div>
              </div>

              {/* Form Content */}
              {currentStep < 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <WorkflowForm form={form} currentStep={currentStep} />
                </div>
              )}

              {/* Preview Step */}
              {currentStep === 3 && previewData && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3
                          className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        >
                          Workflow Definition Ready
                        </h3>
                        <p
                          className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
                        >
                          Please review the generated GitHub Actions YAML configuration below.
                        </p>
                      </div>
                      <div
                        className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-full border
                        ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700 text-zinc-300' : 'bg-gray-50 border-gray-200 text-gray-600'}
                      `}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
                          .github/workflows/
                          {workflowFileName.endsWith('.yml')
                            ? workflowFileName.toLowerCase()
                            : `${workflowFileName.toLowerCase()}.yml`}
                        </span>
                      </div>
                    </div>

                    <div className="relative group">
                      <div
                        className={`
                        absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000
                      `}
                      />
                      <div
                        className={`
                        relative p-0.5 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-900 border-gray-200'}
                      `}
                      >
                        <div
                          className={`
                          flex items-center justify-between px-4 py-2 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-800'}
                        `}
                        >
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            yaml / workflow
                          </span>
                        </div>
                        <pre
                          className={`
                            text-[11px] p-6 overflow-x-auto max-h-[400px] font-mono leading-relaxed custom-scrollbar
                            ${theme === 'dark' ? 'text-blue-300/90' : 'text-blue-300/90'}
                          `}
                        >
                          <code>{previewData.yaml_content}</code>
                        </pre>
                      </div>
                    </div>

                    <div
                      className={`flex gap-3 p-4 rounded-xl border ${
                        theme === 'dark'
                          ? 'bg-blue-500/5 border-blue-500/20'
                          : 'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg h-fit ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}
                      >
                        <Check
                          className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <p
                          className={`text-sm font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}
                        >
                          Validation Passed
                        </p>
                        <p
                          className={`text-xs ${theme === 'dark' ? 'text-blue-300/70' : 'text-blue-700/70'}`}
                        >
                          The configuration has been verified. Clicking 'Commit' will automatically
                          create this file in your repository.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          <div
            className={`px-8 py-5 flex items-center justify-between border-t ${
              theme === 'dark'
                ? 'border-zinc-700/50 bg-zinc-900/50'
                : 'border-gray-100 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {(currentStep === 2 || currentStep === 3) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStep(currentStep === 3 ? 2 : 1)}
                  disabled={previewing || submitting}
                  className={`flex items-center gap-2 px-4 transition-all ${
                    theme === 'dark'
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50'
                  }`}
                >
                  Back to {currentStep === 3 ? 'Deployment' : 'Basic Info'}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className={`px-6 border-transparent hover:border-zinc-500 transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="lg"
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
                    ? !workflowName || !workflowFileName || projects.some((p) => !p.name)
                    : currentStep === 2
                      ? deploymentType === 'ec2'
                        ? !ec2CommonFields.credentialId ||
                          !ec2CommonFields.awsRegion ||
                          !ec2CommonFields.jenkinsJobs ||
                          !ec2CommonFields.releaseTag ||
                          !ec2CommonFields.codeownersEmails ||
                          ec2Projects.some((p) => !p.name || !p.port)
                        : deploymentType === 'kubernetes'
                          ? !kubernetesCommonFields.jenkinsJobName ||
                            !kubernetesCommonFields.releaseTag ||
                            !kubernetesCommonFields.helmValuesRepository ||
                            !kubernetesCommonFields.codeownersEmailIds ||
                            kubernetesProjects.some((p) => !p.name)
                          : false
                      : false)
                }
                className={`
                  px-8 relative overflow-hidden group transition-all duration-300
                  ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                  }
                  ${previewing || submitting ? 'pl-10' : ''}
                `}
              >
                {(previewing || submitting) && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}

                <span className="flex items-center gap-2">
                  {previewing
                    ? 'Preparing Preview...'
                    : submitting
                      ? 'Creating Workflow...'
                      : currentStep === 1
                        ? 'Continue to Deployment'
                        : currentStep === 2
                          ? 'Generate YAML Preview'
                          : 'Commit Workflow to Repository'}
                  {!previewing && !submitting && (
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
