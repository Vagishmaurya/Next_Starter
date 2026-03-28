'use client';

import type { WorkflowTemplateSummary } from '@/lib/api/actions.service';
import { Check, Copy, Eye, Layout, Loader2, Settings, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { WorkflowForm } from '@/components/branches/WorkflowForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [currentStep, setCurrentStep] = useState(0); // 0: Selection, 1...n: Template Steps, n+1: Preview
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [templates, setTemplates] = useState<WorkflowTemplateSummary[]>([]);
  const [previewData, setPreviewData] = useState<{
    yaml_content: string;
    workflow_name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useWorkflowForm();
  const { template, initializeFromTemplate, validateStep, getFinalPayload, resetForm } = form;

  // Load templates on open
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setError(null);
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await actionsService.fetchTemplates();
      if (response.success) {
        setTemplates(response.data.templates);
        // If only one template, select it automatically
        if (response.data.templates.length === 1) {
          selectTemplate(response.data.templates[0].templateId);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = async (templateId: string) => {
    setError(null);
    try {
      setLoading(true);
      const response = await actionsService.fetchTemplateById(templateId);
      if (response.success) {
        console.log(
          '[CreateWorkflowModal] Selected Template Schema:',
          JSON.stringify(response.data, null, 2)
        );
        initializeFromTemplate(response.data);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Error selecting template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewWorkflow = async () => {
    setError(null);
    try {
      setPreviewing(true);

      const payload = getFinalPayload(owner, repository);

      // Handle the workflowFileName .yml extension if present in payload
      if (payload.workflowFileName && !payload.workflowFileName.endsWith('.yml')) {
        payload.workflowFileName = `${payload.workflowFileName}.yml`;
      }

      console.log('[CreateWorkflowModal] Preview Payload:', payload);

      const response = await actionsService.previewWorkflow(payload);
      if (response.success) {
        setPreviewData({
          yaml_content: response.data.yaml_content,
          workflow_name: response.data.workflow_name,
        });
        setCurrentStep((template?.schema.steps.length || 0) + 1);
      } else {
        onSubmit(false, response.message || 'Failed to generate preview');
      }
    } catch (error: any) {
      console.error('Error generating preview:', error);
      onSubmit(false, error instanceof Error ? error.message : 'Failed to generate preview');
    } finally {
      setPreviewing(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      return;
    }

    // 1. Handle Template Steps
    if (currentStep <= templateStepsCount) {
      const currentStepObj = template?.schema.steps[currentStep - 1];
      if (currentStepObj && validateStep(currentStepObj)) {
        if (currentStep === templateStepsCount) {
          await handlePreviewWorkflow();
        } else {
          // Sync projects if moving from Step 1 to Step 2
          if (currentStep === 1) {
            form.syncLinkedProjects();
          }
          setCurrentStep(currentStep + 1);
        }
      }
      return;
    }

    // 2. Handle Preview Step -> Transition to Infrastructure if EC2
    if (isPreviewStep && showInfrastructureStep) {
      setCurrentStep(infrastructureStepIndex);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Guard: Only allow submit on the actual final step
    const canSubmit = isSubmitStep || (isPreviewStep && !showInfrastructureStep);
    if (!canSubmit) {
      handleNext();
      return;
    }

    // Validation for Infrastructure Step (EC2 & Kubernetes)
    if (isInfrastructureStep) {
      const projects =
        deploymentType === 'ec2'
          ? form.values.ec2_projects || []
          : form.values.kubernetes_projects || [];
      const infraConfig = form.values.infrastructure_config || {};

      for (const project of projects) {
        for (const env of ['stage', 'prod']) {
          const configKey = `${project.name}-${env}`;
          const config = infraConfig[configKey];

          if (
            !config?.jenkinsNodeName ||
            !config?.awsAccessKeyId ||
            !config?.awsSecretAccessKey ||
            !config?.environments ||
            (deploymentType === 'kubernetes' && !config?.namespace)
          ) {
            setError(`Please fill all fields for ${project.name} (${env})`);
            return;
          }
        }
      }
    }

    try {
      setSubmitting(true);

      const payload = getFinalPayload(owner, repository);

      // Handle the workflowFileName .yml extension if present in payload
      if (payload.workflowFileName && !payload.workflowFileName.endsWith('.yml')) {
        payload.workflowFileName = `${payload.workflowFileName}.yml`;
      }

      console.log('[CreateWorkflowModal] Creation Payload:', payload);

      const response = await actionsService.createWorkflow(payload);

      if (response.success) {
        onSubmit(true, response.message);
        handleClose();
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

  const handleClose = () => {
    setError(null);
    setCurrentStep(0);
    resetForm();
    setPreviewData(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const deploymentType = form.getFieldValue('deploymentType');
  const showInfrastructureStep = deploymentType === 'ec2' || deploymentType === 'kubernetes';

  const steps = [
    { label: 'Template', icon: Layout },
    ...(template?.schema.steps.map((s: any) => ({ label: s.title, icon: Settings })) || []),
    { label: 'Preview', icon: Eye },
    ...(showInfrastructureStep ? [{ label: 'Infrastructure', icon: Settings }] : []),
  ];

  const totalStepsCount = steps.length;
  const templateStepsCount = template?.schema.steps.length || 0;
  const previewStepIndex = templateStepsCount + 1;
  const infrastructureStepIndex = templateStepsCount + 2;

  const isTemplateStep = currentStep > 0 && currentStep <= templateStepsCount;
  const isPreviewStep = currentStep === previewStepIndex;
  const isInfrastructureStep = showInfrastructureStep && currentStep === infrastructureStepIndex;
  const isLastStep = currentStep === totalStepsCount - 1; // Since it's 0-indexed in some places? No, currentStep starts at 1 for forms.

  // The submit button should appear on the very last step
  const isSubmitStep = currentStep === totalStepsCount - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={handleClose}
      />

      <Card
        className={`relative w-full max-w-7xl h-[92vh] overflow-hidden flex flex-col shadow-2xl ${
          theme === 'dark'
            ? 'bg-zinc-900/90 border-zinc-700/50 backdrop-blur-xl text-white'
            : 'bg-white/95 border-gray-200 backdrop-blur-xl text-gray-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}
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
                {template
                  ? `${template.name} v${template.version}`
                  : 'Select a workflow template to begin'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-9 w-9 p-0 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8">
            {/* Step Indicator */}
            {template && (
              <div className="relative mb-12 overflow-x-auto pb-4">
                <div className="flex items-center justify-between min-w-[600px] mx-auto relative z-10 px-4">
                  {steps.map((item, index) => (
                    <React.Fragment key={index}>
                      <div className="flex flex-col items-center group">
                        <div
                          className={`
                            relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 border-2
                            ${
                              currentStep === index
                                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30 text-white'
                                : currentStep > index
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : theme === 'dark'
                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-400'
                            }
                          `}
                        >
                          {currentStep > index ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <item.icon className="h-4 w-4" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-[10px] font-bold uppercase tracking-tighter ${currentStep === index ? 'text-blue-500' : 'text-zinc-500'}`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {index < totalStepsCount - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 mb-4 ${currentStep > index ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">Loading schema...</p>
              </div>
            ) : (
              error && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm font-medium text-red-500">{error}</p>
                  </div>
                </div>
              )
            )}

            {currentStep === 0 ? (
              /* Selection Step */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {templates.map((tpl) => (
                  <Card
                    key={tpl.templateId}
                    onClick={() => selectTemplate(tpl.templateId)}
                    className={`p-6 cursor-pointer border-2 transition-all hover:scale-[1.02] ${
                      theme === 'dark'
                        ? 'bg-zinc-800/50 border-zinc-700 hover:border-blue-500/50 hover:bg-zinc-800'
                        : 'bg-gray-50 border-gray-100 hover:border-blue-500/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-col h-full justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg">{tpl.name}</h3>
                          <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">
                            v{tpl.version}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}
                        >
                          {tpl.description}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Select Template
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : currentStep <= templateStepsCount ? (
              /* Dynamic Form Steps */
              <WorkflowForm form={form} currentStep={currentStep} />
            ) : isPreviewStep ? (
              /* Preview Step */
              previewData && (
                <div className="space-y-6 animate-in fade-in zoom-in-95">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">Preview Workflow</h3>
                      <div className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                        {previewData.workflow_name || 'workflow.yml'}
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl blur opacity-10" />
                      <pre className="relative p-6 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-blue-300/90 font-mono overflow-x-auto max-h-[400px] custom-scrollbar">
                        <code>{previewData.yaml_content}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )
            ) : isInfrastructureStep ? (
              /* Infrastructure Step (EC2 Only) */
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-500/5 rounded-r-xl">
                  <h3 className="text-xl font-bold tracking-tight">Infrastructure Configuration</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Enter infrastructure details for each project and environment.
                  </p>
                </div>

                <div className="space-y-12">
                  {(deploymentType === 'ec2'
                    ? form.values.ec2_projects
                    : form.values.kubernetes_projects
                  )?.map((project: any, pIdx: number, projectArray: any[]) => (
                    <div key={pIdx} className="space-y-6">
                      <div className="flex items-center justify-between border-b border-zinc-700/30 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-1 bg-blue-600 rounded-full" />
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                            Project: {project.name}
                          </h4>
                        </div>
                        {pIdx > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const prevProject = projectArray[pIdx - 1];
                              if (prevProject) {
                                ['stage', 'prod'].forEach((env) => {
                                  const sourceKey = `${prevProject.name}-${env}`;
                                  const targetKey = `${project.name}-${env}`;
                                  const sourceData = form.values.infrastructure_config?.[sourceKey];
                                  if (sourceData) {
                                    form.handleFieldChange('infrastructure_config', targetKey, {
                                      ...sourceData,
                                      projectName: project.name, // Ensure targeted project name is correct
                                      environment: env,
                                    });
                                  }
                                });
                              }
                            }}
                            className="h-7 px-3 text-[10px] font-bold text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 gap-1.5 transition-all"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy from {projectArray[pIdx - 1]?.name}
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {['stage', 'prod'].map((env) => {
                          const configKey = `${project.name}-${env}`;
                          return (
                            <Card
                              key={env}
                              className={`p-6 space-y-5 border shadow-sm ${
                                theme === 'dark'
                                  ? 'bg-zinc-800/20 border-zinc-800'
                                  : 'bg-zinc-50 border-zinc-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <Badge
                                  className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 ${
                                    env === 'prod'
                                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  } border`}
                                >
                                  {env}
                                </Badge>
                                {env === 'prod' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const stageKey = `${project.name}-stage`;
                                      const stageData =
                                        form.values.infrastructure_config?.[stageKey];
                                      if (stageData) {
                                        form.handleFieldChange('infrastructure_config', configKey, {
                                          ...stageData,
                                          environment: 'prod',
                                        });
                                      }
                                    }}
                                    className="h-7 px-2 text-[10px] font-bold text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 gap-1.5 transition-all"
                                  >
                                    <Copy className="h-3 w-3" />
                                    Copy from Stage
                                  </Button>
                                )}
                              </div>

                              <div className="space-y-4">
                                {deploymentType === 'kubernetes' && (
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                      Namespace <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      placeholder="e.g. default"
                                      value={
                                        form.values.infrastructure_config?.[configKey]?.namespace ||
                                        ''
                                      }
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        form.handleFieldChange('infrastructure_config', configKey, {
                                          ...(form.values.infrastructure_config?.[configKey] || {}),
                                          namespace: e.target.value,
                                          projectName: project.name,
                                          environment: env,
                                        })
                                      }
                                      className="h-10 text-xs"
                                    />
                                  </div>
                                )}
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                    Jenkins Node Name <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    placeholder="e.g. jenkins-slave-01"
                                    value={
                                      form.values.infrastructure_config?.[configKey]
                                        ?.jenkinsNodeName || ''
                                    }
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                      form.handleFieldChange('infrastructure_config', configKey, {
                                        ...(form.values.infrastructure_config?.[configKey] || {}),
                                        jenkinsNodeName: e.target.value,
                                        projectName: project.name,
                                        environment: env,
                                      })
                                    }
                                    className="h-10 text-xs"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                    AWS Access Key ID <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    placeholder="AKIA..."
                                    value={
                                      form.values.infrastructure_config?.[configKey]
                                        ?.awsAccessKeyId || ''
                                    }
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                      form.handleFieldChange('infrastructure_config', configKey, {
                                        ...(form.values.infrastructure_config?.[configKey] || {}),
                                        awsAccessKeyId: e.target.value,
                                        projectName: project.name,
                                        environment: env,
                                      })
                                    }
                                    className="h-10 text-xs"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                    AWS Secret Access Key <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={
                                      form.values.infrastructure_config?.[configKey]
                                        ?.awsSecretAccessKey || ''
                                    }
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                      form.handleFieldChange('infrastructure_config', configKey, {
                                        ...(form.values.infrastructure_config?.[configKey] || {}),
                                        awsSecretAccessKey: e.target.value,
                                        projectName: project.name,
                                        environment: env,
                                      })
                                    }
                                    className="h-10 text-xs"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                    Environments (envs) <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    placeholder="e.g. key=value, debug=true"
                                    value={
                                      form.values.infrastructure_config?.[configKey]
                                        ?.environments || ''
                                    }
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                      form.handleFieldChange('infrastructure_config', configKey, {
                                        ...(form.values.infrastructure_config?.[configKey] || {}),
                                        environments: e.target.value,
                                        projectName: project.name,
                                        environment: env,
                                      })
                                    }
                                    className="h-10 text-xs"
                                  />
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-6 border-t flex items-center justify-between ${theme === 'dark' ? 'border-zinc-700 bg-zinc-900/50' : 'border-gray-100 bg-gray-50/50'}`}
        >
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading || submitting || previewing}
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep > 0 && (
              <Button
                onClick={
                  isSubmitStep || (isPreviewStep && !showInfrastructureStep)
                    ? handleSubmit
                    : handleNext
                }
                disabled={loading || submitting || previewing}
                className="bg-blue-600 hover:bg-blue-500 text-white min-w-[140px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : previewing ? (
                  <Loader2 className="h-4 w-4 animate-spin pr-2" />
                ) : null}
                {isSubmitStep || (isPreviewStep && !showInfrastructureStep)
                  ? 'Commit Workflow'
                  : currentStep === templateStepsCount
                    ? 'Preview'
                    : 'Continue'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
