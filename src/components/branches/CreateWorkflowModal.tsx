'use client';

import type { CreateWorkflowRequest } from '@/lib/api/actions.service';
import { Copy, Minus, Plus, X } from 'lucide-react';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { actionsService } from '@/lib/api/actions.service';
import { useThemeStore } from '@/store/themeStore';

type DeploymentType = 'ec2' | 'kubernetes';

type EC2CommonFields = {
  credentialId: string;
  awsRegion: string;
  jenkinsJobs: string;
  releaseTag: string;
  codeownersEmails: string;
  devopsStakeholdersEmails: string;
};

type KubernetesCommonFields = {
  jenkinsJobName: string;
  releaseTag: string;
  helmValuesRepository: string;
  codeownersEmailIds: string;
  devopsStakeholdersEmailIds: string;
};

type KubernetesProject = {
  id: string;
  name: string;
};

type EC2Project = {
  id: string;
  name: string;
  command: string;
  port: string;
  dockerNetwork: string;
  mountPath: string;
  enableGpu: boolean;
  logDriver: string;
  logDriverOptions: string;
};

type Project = {
  id: string;
  name: string;
  dockerContextPath: string;
  dockerfilePath: string;
  dotEnvTesting: string;
  dotEnvProduction: string;
};

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
  const [workflowName, setWorkflowName] = useState('');
  const [deploymentType, setDeploymentType] = useState<DeploymentType>('ec2');
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<{
    yaml_content: string;
    workflow_name: string;
  } | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: '',
      dockerContextPath: '',
      dockerfilePath: '',
      dotEnvTesting: '',
      dotEnvProduction: '',
    },
  ]);
  // EC2 specific states
  const [ec2CommonFields, setEc2CommonFields] = useState<EC2CommonFields>({
    credentialId: '',
    awsRegion: '',
    jenkinsJobs: '',
    releaseTag: '',
    codeownersEmails: '',
    devopsStakeholdersEmails: '',
  });

  const [ec2Projects, setEc2Projects] = useState<EC2Project[]>([
    {
      id: '1',
      name: '',
      command: '',
      port: '',
      dockerNetwork: '',
      mountPath: '',
      enableGpu: false,
      logDriver: '',
      logDriverOptions: '',
    },
  ]);

  // Kubernetes specific states
  const [kubernetesCommonFields, setKubernetesCommonFields] = useState<KubernetesCommonFields>({
    jenkinsJobName: '',
    releaseTag: '',
    helmValuesRepository: '',
    codeownersEmailIds: '',
    devopsStakeholdersEmailIds: '',
  });

  const [kubernetesProjects, setKubernetesProjects] = useState<KubernetesProject[]>([
    {
      id: '1',
      name: '',
    },
  ]);

  const handleAddProject = () => {
    if (projects.length >= 3) {
      return;
    }
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      dockerContextPath: '',
      dockerfilePath: '',
      dotEnvTesting: '',
      dotEnvProduction: '',
    };
    setProjects([...projects, newProject]);
  };

  const handleRemoveProject = (id: string) => {
    if (projects.length > 1) {
      setProjects(projects.filter((project) => project.id !== id));
    }
  };

  const handleProjectChange = (id: string, field: keyof Project, value: string) => {
    setProjects(
      projects.map((project) => (project.id === id ? { ...project, [field]: value } : project))
    );
  };

  // EC2 handlers
  const handleAddEc2Project = () => {
    if (ec2Projects.length >= 3) {
      return;
    }
    const newProject: EC2Project = {
      id: Date.now().toString(),
      name: '',
      command: '',
      port: '',
      dockerNetwork: '',
      mountPath: '',
      enableGpu: false,
      logDriver: '',
      logDriverOptions: '',
    };
    setEc2Projects([...ec2Projects, newProject]);
  };

  const handleRemoveEc2Project = (id: string) => {
    if (ec2Projects.length > 1) {
      setEc2Projects(ec2Projects.filter((project) => project.id !== id));
    }
  };

  const handleEc2ProjectChange = (id: string, field: keyof EC2Project, value: string | boolean) => {
    setEc2Projects(
      ec2Projects.map((project) => (project.id === id ? { ...project, [field]: value } : project))
    );
  };

  const handleEc2CommonFieldChange = (field: keyof EC2CommonFields, value: string) => {
    setEc2CommonFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Kubernetes handlers
  const handleAddKubernetesProject = () => {
    if (kubernetesProjects.length >= 3) {
      return;
    }
    const newProject: KubernetesProject = {
      id: Date.now().toString(),
      name: '',
    };
    setKubernetesProjects([...kubernetesProjects, newProject]);
  };

  const handleRemoveKubernetesProject = (id: string) => {
    if (kubernetesProjects.length > 1) {
      setKubernetesProjects(kubernetesProjects.filter((project) => project.id !== id));
    }
  };

  const handleKubernetesProjectChange = (
    id: string,
    field: keyof KubernetesProject,
    value: string
  ) => {
    setKubernetesProjects(
      kubernetesProjects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );
  };

  const handleKubernetesCommonFieldChange = (
    field: keyof KubernetesCommonFields,
    value: string
  ) => {
    setKubernetesCommonFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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
        console.error('Failed to generate preview');
      }
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      // Move to next step
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // Generate preview
      await handlePreviewWorkflow();
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
    setWorkflowName('');
    setDeploymentType('ec2');
    setSubmitting(false);
    setPreviewing(false);
    setPreviewData(null);
    setProjects([
      {
        id: '1',
        name: '',
        dockerContextPath: '',
        dockerfilePath: '',
        dotEnvTesting: '',
        dotEnvProduction: '',
      },
    ]);
    setEc2CommonFields({
      credentialId: '',
      awsRegion: '',
      jenkinsJobs: '',
      releaseTag: '',
      codeownersEmails: '',
      devopsStakeholdersEmails: '',
    });
    setEc2Projects([
      {
        id: '1',
        name: '',
        command: '',
        port: '',
        dockerNetwork: '',
        mountPath: '',
        enableGpu: false,
        logDriver: '',
        logDriverOptions: '',
      },
    ]);
    setKubernetesCommonFields({
      jenkinsJobName: '',
      releaseTag: '',
      helmValuesRepository: '',
      codeownersEmailIds: '',
      devopsStakeholdersEmailIds: '',
    });
    setKubernetesProjects([
      {
        id: '1',
        name: '',
      },
    ]);
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
        <form className="p-6 space-y-6">
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

          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Workflow Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="workflowName"
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}
                >
                  Workflow Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="workflowName"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                  required
                  className={
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }
                />
              </div>

              {/* Projects Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    }`}
                  >
                    Projects <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddProject}
                    disabled={projects.length >= 3}
                    className={`flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    Add Project {projects.length >= 3 ? '(Max 3)' : `(${projects.length}/3)`}
                  </Button>
                </div>

                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className={`p-6 ${
                      theme === 'dark'
                        ? 'bg-zinc-800/50 border-zinc-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="space-y-6">
                      {/* Project Header */}
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-1">
                          <Label
                            className={`text-xs ${
                              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                            }`}
                          >
                            Project Name
                          </Label>
                          <Input
                            value={project.name}
                            onChange={(e) =>
                              handleProjectChange(project.id, 'name', e.target.value)
                            }
                            placeholder="Enter project name"
                            required
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'bg-zinc-700 border-zinc-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        {projects.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProject(project.id)}
                            className={`h-8 w-8 p-0 mt-1 ${
                              theme === 'dark'
                                ? 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Docker Configuration */}
                      <div className="space-y-4">
                        <Label
                          className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                          }`}
                        >
                          Docker Configuration
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                            >
                              Docker Context Path (optional)
                            </Label>
                            <Input
                              value={project.dockerContextPath}
                              onChange={(e) =>
                                handleProjectChange(project.id, 'dockerContextPath', e.target.value)
                              }
                              placeholder="e.g., ./backend"
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'bg-zinc-700 border-zinc-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                            >
                              Dockerfile Path (optional)
                            </Label>
                            <Input
                              value={project.dockerfilePath}
                              onChange={(e) =>
                                handleProjectChange(project.id, 'dockerfilePath', e.target.value)
                              }
                              placeholder="e.g., ./Dockerfile"
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'bg-zinc-700 border-zinc-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Environment Variables */}
                      <div className="space-y-4">
                        <Label
                          className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                          }`}
                        >
                          Environment Variables
                        </Label>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                            >
                              Testing Environment Variables (optional)
                            </Label>
                            <Textarea
                              value={project.dotEnvTesting}
                              onChange={(e) =>
                                handleProjectChange(project.id, 'dotEnvTesting', e.target.value)
                              }
                              placeholder={`NODE_ENV=testing\\nAPI_URL=https://api.testing.example.com\\nDEBUG=true`}
                              rows={3}
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'bg-zinc-700 border-zinc-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                            >
                              Production Environment Variables (optional)
                            </Label>
                            <Textarea
                              value={project.dotEnvProduction}
                              onChange={(e) =>
                                handleProjectChange(project.id, 'dotEnvProduction', e.target.value)
                              }
                              placeholder={`NODE_ENV=production\\nAPI_URL=https://api.example.com\\nDEBUG=false`}
                              rows={3}
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'bg-zinc-700 border-zinc-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Deployment Type Selection */}
              <div className="space-y-2">
                <Label
                  htmlFor="deploymentType"
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}
                >
                  Deployment Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="deploymentType"
                  value={deploymentType}
                  onChange={(e) => setDeploymentType(e.target.value as DeploymentType)}
                  required
                  className={`w-full px-3 py-2 rounded-md border text-sm ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="ec2">Deploy on EC2</option>
                  <option value="kubernetes">Deploy on Kubernetes</option>
                </select>
              </div>

              {/* Show form fields based on deployment type */}
              {deploymentType === 'kubernetes' && (
                <div className="space-y-6">
                  {/* Kubernetes Common Fields */}
                  <div className="space-y-4">
                    <Label
                      className={`text-lg font-medium ${
                        theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                      }`}
                    >
                      Common Configuration
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                        >
                          Jenkins Job Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={kubernetesCommonFields.jenkinsJobName}
                          onChange={(e) =>
                            handleKubernetesCommonFieldChange('jenkinsJobName', e.target.value)
                          }
                          placeholder="e.g., kubernetes-deploy-on-nutanix or Finca Deployment"
                          required
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                        >
                          Release Tag <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={kubernetesCommonFields.releaseTag}
                          onChange={(e) =>
                            handleKubernetesCommonFieldChange('releaseTag', e.target.value)
                          }
                          placeholder="e.g., v2.0.0"
                          required
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                      >
                        Helm Values Repository <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={kubernetesCommonFields.helmValuesRepository}
                        onChange={(e) =>
                          handleKubernetesCommonFieldChange('helmValuesRepository', e.target.value)
                        }
                        placeholder="Repository name that has helm values files"
                        required
                        className={`text-sm ${
                          theme === 'dark'
                            ? 'bg-zinc-700 border-zinc-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                      >
                        Codeowners Email IDs <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={kubernetesCommonFields.codeownersEmailIds}
                        onChange={(e) =>
                          handleKubernetesCommonFieldChange('codeownersEmailIds', e.target.value)
                        }
                        placeholder="user1@example.com, user2@example.com"
                        rows={2}
                        required
                        className={`text-sm ${
                          theme === 'dark'
                            ? 'bg-zinc-700 border-zinc-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                      >
                        DevOps Stakeholders Email IDs (optional)
                      </Label>
                      <Textarea
                        value={kubernetesCommonFields.devopsStakeholdersEmailIds}
                        onChange={(e) =>
                          handleKubernetesCommonFieldChange(
                            'devopsStakeholdersEmailIds',
                            e.target.value
                          )
                        }
                        placeholder="devops1@example.com, devops2@example.com"
                        rows={2}
                        className={`text-sm ${
                          theme === 'dark'
                            ? 'bg-zinc-700 border-zinc-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Kubernetes Projects Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label
                        className={`text-lg font-medium ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}
                      >
                        Kubernetes Projects <span className="text-red-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddKubernetesProject}
                        disabled={kubernetesProjects.length >= 3}
                        className={`flex items-center gap-2 ${
                          theme === 'dark'
                            ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        Add Project{' '}
                        {kubernetesProjects.length >= 3
                          ? '(Max 3)'
                          : `(${kubernetesProjects.length}/3)`}
                      </Button>
                    </div>

                    {kubernetesProjects.map((project) => (
                      <Card
                        key={project.id}
                        className={`p-6 ${
                          theme === 'dark'
                            ? 'bg-zinc-800/50 border-zinc-700'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-1">
                            <Label
                              className={`text-xs ${
                                theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                              }`}
                            >
                              Project Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={project.name}
                              onChange={(e) =>
                                handleKubernetesProjectChange(project.id, 'name', e.target.value)
                              }
                              placeholder="Enter project name"
                              required
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'bg-zinc-700 border-zinc-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                          {kubernetesProjects.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveKubernetesProject(project.id)}
                              className={`h-8 w-8 p-0 mt-1 ${
                                theme === 'dark'
                                  ? 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {deploymentType === 'ec2' && (
                <div className="space-y-6">
                  {/* EC2 Common Fields */}
                  <div className="space-y-4">
                    <Label
                      className={`text-lg font-medium ${
                        theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                      }`}
                    >
                      Common Configuration
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                        >
                          Credential ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={ec2CommonFields.credentialId}
                          onChange={(e) =>
                            handleEc2CommonFieldChange('credentialId', e.target.value)
                          }
                          placeholder="Enter credential ID"
                          required
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                        >
                          AWS Region <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={ec2CommonFields.awsRegion}
                          onChange={(e) => handleEc2CommonFieldChange('awsRegion', e.target.value)}
                          placeholder="e.g., us-east-1"
                          required
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                        >
                          Jenkins Jobs <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={ec2CommonFields.jenkinsJobs}
                          onChange={(e) =>
                            handleEc2CommonFieldChange('jenkinsJobs', e.target.value)
                          }
                          placeholder="Enter Jenkins job names"
                          required
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                        >
                          Release Tag (optional)
                        </Label>
                        <Input
                          value={ec2CommonFields.releaseTag}
                          onChange={(e) => handleEc2CommonFieldChange('releaseTag', e.target.value)}
                          placeholder="e.g., v1.0.0"
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                      >
                        Codeowners Email IDs <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={ec2CommonFields.codeownersEmails}
                        onChange={(e) =>
                          handleEc2CommonFieldChange('codeownersEmails', e.target.value)
                        }
                        placeholder="user1@example.com, user2@example.com"
                        rows={2}
                        required
                        className={`text-sm ${
                          theme === 'dark'
                            ? 'bg-zinc-700 border-zinc-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                      >
                        DevOps Stakeholders Email IDs (optional)
                      </Label>
                      <Textarea
                        value={ec2CommonFields.devopsStakeholdersEmails}
                        onChange={(e) =>
                          handleEc2CommonFieldChange('devopsStakeholdersEmails', e.target.value)
                        }
                        placeholder="devops1@example.com, devops2@example.com"
                        rows={2}
                        className={`text-sm ${
                          theme === 'dark'
                            ? 'bg-zinc-700 border-zinc-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* EC2 Projects Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label
                        className={`text-lg font-medium ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}
                      >
                        EC2 Projects <span className="text-red-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddEc2Project}
                        disabled={ec2Projects.length >= 3}
                        className={`flex items-center gap-2 ${
                          theme === 'dark'
                            ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        Add Project{' '}
                        {ec2Projects.length >= 3 ? '(Max 3)' : `(${ec2Projects.length}/3)`}
                      </Button>
                    </div>

                    {ec2Projects.map((project) => (
                      <Card
                        key={project.id}
                        className={`p-6 ${
                          theme === 'dark'
                            ? 'bg-zinc-800/50 border-zinc-700'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="space-y-4">
                          {/* Project Header */}
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-1">
                              <Label
                                className={`text-xs ${
                                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                                }`}
                              >
                                Project Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                value={project.name}
                                onChange={(e) =>
                                  handleEc2ProjectChange(project.id, 'name', e.target.value)
                                }
                                placeholder="Enter project name"
                                required
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'bg-zinc-700 border-zinc-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                            {ec2Projects.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEc2Project(project.id)}
                                className={`h-8 w-8 p-0 mt-1 ${
                                  theme === 'dark'
                                    ? 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                }`}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                              >
                                Command (optional)
                              </Label>
                              <Input
                                value={project.command}
                                onChange={(e) =>
                                  handleEc2ProjectChange(project.id, 'command', e.target.value)
                                }
                                placeholder="e.g., npm start"
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'bg-zinc-700 border-zinc-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                              >
                                Port <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                value={project.port}
                                onChange={(e) =>
                                  handleEc2ProjectChange(project.id, 'port', e.target.value)
                                }
                                placeholder="e.g., 3000 : 3000"
                                required
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'bg-zinc-700 border-zinc-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                              >
                                Docker Network (optional)
                              </Label>
                              <Input
                                value={project.dockerNetwork}
                                onChange={(e) =>
                                  handleEc2ProjectChange(
                                    project.id,
                                    'dockerNetwork',
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., my-network"
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'bg-zinc-700 border-zinc-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                              >
                                Mount Path (optional)
                              </Label>
                              <Input
                                value={project.mountPath}
                                onChange={(e) =>
                                  handleEc2ProjectChange(project.id, 'mountPath', e.target.value)
                                }
                                placeholder="e.g., /app/data"
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'bg-zinc-700 border-zinc-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`enableGpu-${project.id}`}
                                checked={project.enableGpu}
                                onChange={(e) =>
                                  handleEc2ProjectChange(project.id, 'enableGpu', e.target.checked)
                                }
                                className="rounded border-gray-300"
                              />
                              <Label
                                htmlFor={`enableGpu-${project.id}`}
                                className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                              >
                                Enable GPU (optional)
                              </Label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                              >
                                Log Driver <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                value={project.logDriver}
                                onChange={(e) =>
                                  handleEc2ProjectChange(project.id, 'logDriver', e.target.value)
                                }
                                placeholder="e.g., json-file"
                                required
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'bg-zinc-700 border-zinc-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                              >
                                Log Driver Options (optional)
                              </Label>
                              <Input
                                value={project.logDriverOptions}
                                onChange={(e) =>
                                  handleEc2ProjectChange(
                                    project.id,
                                    'logDriverOptions',
                                    e.target.value
                                  )
                                }
                                placeholder="max-size=10m,max-file=3"
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'bg-zinc-700 border-zinc-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && previewData && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    className={`text-lg font-medium ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    }`}
                  >
                    Workflow Preview
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(previewData.yaml_content)}
                    className={`flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Copy className="h-4 w-4" />
                    Copy YAML
                  </Button>
                </div>

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
