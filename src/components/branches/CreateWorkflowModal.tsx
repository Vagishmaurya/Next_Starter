'use client';

import type { WorkflowTemplateSummary } from '@/lib/api/actions.service';
import { Check, Eye, Layout, Loader2, Settings, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
  const [currentStep, setCurrentStep] = useState(0); // 0: Selection, 1...n: Template Steps, n+1: Preview
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [templates, setTemplates] = useState<WorkflowTemplateSummary[]>([]);
  const [previewData, setPreviewData] = useState<{
    yaml_content: string;
    workflow_name: string;
  } | null>(null);

  const form = useWorkflowForm();
  const { template, initializeFromTemplate, validateStep, getFinalPayload, resetForm } = form;

  // Load templates on open
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
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
    const totalSteps = template?.schema.steps.length || 0;

    if (currentStep === 0) {
      return;
    }

    if (currentStep <= totalSteps) {
      const currentStepObj = template?.schema.steps[currentStep - 1];
      if (currentStepObj && validateStep(currentStepObj)) {
        if (currentStep === totalSteps) {
          await handlePreviewWorkflow();
        } else {
          // Sync projects if moving from Step 1 to Step 2
          if (currentStep === 1) {
            form.syncLinkedProjects();
          }
          setCurrentStep(currentStep + 1);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep <= (template?.schema.steps.length || 0)) {
      handleNext();
      return;
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
    setCurrentStep(0);
    resetForm();
    setPreviewData(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const steps = [
    { label: 'Template', icon: Layout },
    ...(template?.schema.steps.map((s: any) => ({ label: s.title, icon: Settings })) || []),
    { label: 'Preview', icon: Eye },
  ];

  const totalSteps = steps.length;
  const isLastFormStep = template && currentStep === template.schema.steps.length;
  const isPreviewStep = template && currentStep > template.schema.steps.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={handleClose}
      />

      <Card
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${
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
                      {index < totalSteps - 1 && (
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
            ) : currentStep === 0 ? (
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
            ) : currentStep <= (template?.schema.steps.length || 0) ? (
              /* Dynamic Form Steps */
              <WorkflowForm form={form} currentStep={currentStep} />
            ) : (
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
            )}
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
                onClick={isPreviewStep ? handleSubmit : handleNext}
                disabled={loading || submitting || previewing}
                className="bg-blue-600 hover:bg-blue-500 text-white min-w-[140px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : previewing ? (
                  <Loader2 className="h-4 w-4 animate-spin pr-2" />
                ) : null}
                {isPreviewStep ? 'Commit Workflow' : isLastFormStep ? 'Preview' : 'Continue'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
