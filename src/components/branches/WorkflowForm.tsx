import type { useWorkflowForm } from '@/hooks/useWorkflowForm';
import { Minus, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useThemeStore } from '@/store/themeStore';

type WorkflowFormProps = {
  form: ReturnType<typeof useWorkflowForm>;
  currentStep: number;
};

export function WorkflowForm({ form, currentStep }: WorkflowFormProps) {
  const { theme } = useThemeStore();
  const {
    workflowName,
    setWorkflowName,
    workflowFileName,
    setWorkflowFileName,
    deploymentType,
    setDeploymentType,
    projects,
    ec2CommonFields,
    ec2Projects,
    kubernetesCommonFields,
    kubernetesProjects,
    handleAddProject,
    handleRemoveProject,
    handleProjectChange,
    handleAddEc2Project,
    handleRemoveEc2Project,
    handleEc2ProjectChange,
    handleEc2CommonFieldChange,
    handleAddKubernetesProject,
    handleRemoveKubernetesProject,
    handleKubernetesProjectChange,
    handleKubernetesCommonFieldChange,
  } = form;

  if (currentStep === 1) {
    return (
      <div className="space-y-6">
        {/* Base Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workflow Name */}
          <div className="space-y-2">
            <Label
              htmlFor="workflowName"
              className={`text-sm font-semibold tracking-tight ${
                theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'
              }`}
            >
              Workflow Name <span className="text-red-500 font-bold">*</span>
            </Label>
            <div className="relative group">
              <Input
                id="workflowName"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g., Production Deployment"
                required
                className={`
                  h-11 px-4 transition-all duration-200
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/50 border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-white border-gray-200 focus:border-blue-600 focus:ring-blue-600/10'
                  }
                `}
              />
              <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-transparent group-hover:ring-blue-400/20 pointer-events-none transition-all" />
            </div>
            <p className={`text-[11px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
              Display name for this workflow in the dashboard
            </p>
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <Label
              htmlFor="workflowFileName"
              className={`text-sm font-semibold tracking-tight ${
                theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'
              }`}
            >
              File Name <span className="text-red-500 font-bold">*</span>
            </Label>
            <div className="relative flex items-center group">
              <Input
                id="workflowFileName"
                value={workflowFileName}
                onChange={(e) => setWorkflowFileName(e.target.value)}
                placeholder="build.yml"
                required
                className={`
                  h-11 px-4 pr-12 transition-all duration-200 font-mono text-xs
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/50 border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-white border-gray-200 focus:border-blue-600 focus:ring-blue-600/10'
                  }
                `}
              />
              <div className="absolute right-3 px-1.5 py-0.5 rounded bg-zinc-700/30 text-[10px] uppercase font-bold text-zinc-500 pointer-events-none">
                .yml
              </div>
            </div>
            <p className={`text-[11px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
              Actual YAML filename in .github/workflows/
            </p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b pb-4 border-zinc-700/30">
            <div>
              <Label
                className={`text-lg font-bold tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Project Configuration
              </Label>
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                Define services and their specific build environments
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddProject}
              disabled={projects.length >= 3}
              className={`flex items-center gap-2 rounded-full px-4 h-9 shadow-sm transition-all ${
                theme === 'dark'
                  ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-30'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Project</span>
              <span className="ml-1 opacity-50 font-mono text-[10px]">{projects.length}/3</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`
                  relative group p-8 rounded-2xl border transition-all duration-300
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/50'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {/* Project Badge */}
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  Project #{index + 1}
                </div>

                <div className="space-y-8">
                  {/* Project Header */}
                  <div className="flex items-end gap-6">
                    <div className="flex-1 space-y-2">
                      <Label
                        className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
                      >
                        Project Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={project.name}
                        onChange={(e) => handleProjectChange(project.id, 'name', e.target.value)}
                        placeholder="e.g., API Gateway"
                        required
                        className={`h-10 transition-all ${
                          theme === 'dark'
                            ? 'bg-zinc-900 border-zinc-700 focus:border-blue-500'
                            : 'bg-white border-gray-200'
                        }`}
                      />
                    </div>
                    {projects.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProject(project.id)}
                        className={`h-10 w-10 p-0 rounded-xl transition-colors ${
                          theme === 'dark'
                            ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  {/* Docker Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-6 bg-blue-500/50 rounded-full" />
                      <span
                        className={`text-xs font-bold tracking-widest uppercase ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
                      >
                        Docker Context
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
                        >
                          Context Path
                        </Label>
                        <Input
                          value={project.dockerContextPath}
                          onChange={(e) =>
                            handleProjectChange(project.id, 'dockerContextPath', e.target.value)
                          }
                          placeholder="./"
                          className={`text-sm h-10 ${
                            theme === 'dark'
                              ? 'bg-zinc-900 border-zinc-700'
                              : 'bg-white border-gray-200'
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
                        >
                          Dockerfile Path
                        </Label>
                        <Input
                          value={project.dockerfilePath}
                          onChange={(e) =>
                            handleProjectChange(project.id, 'dockerfilePath', e.target.value)
                          }
                          placeholder="./Dockerfile"
                          className={`text-sm h-10 ${
                            theme === 'dark'
                              ? 'bg-zinc-900 border-zinc-700'
                              : 'bg-white border-gray-200'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Env Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-6 bg-emerald-500/50 rounded-full" />
                      <span
                        className={`text-xs font-bold tracking-widest uppercase ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
                      >
                        Environment Variables
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
                        >
                          Testing Configuration
                        </Label>
                        <Textarea
                          value={project.dotEnvTesting}
                          onChange={(e) =>
                            handleProjectChange(project.id, 'dotEnvTesting', e.target.value)
                          }
                          placeholder="PORT=3000"
                          rows={3}
                          className={`text-xs font-mono resize-none ${
                            theme === 'dark'
                              ? 'bg-zinc-900 border-zinc-700'
                              : 'bg-white border-gray-200'
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
                        >
                          Production Configuration
                        </Label>
                        <Textarea
                          value={project.dotEnvProduction}
                          onChange={(e) =>
                            handleProjectChange(project.id, 'dotEnvProduction', e.target.value)
                          }
                          placeholder="PORT=80"
                          rows={3}
                          className={`text-xs font-mono resize-none ${
                            theme === 'dark'
                              ? 'bg-zinc-900 border-zinc-700'
                              : 'bg-white border-gray-200'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
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
            onChange={(e) => setDeploymentType(e.target.value as any)}
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
                    placeholder="e.g., career-ats-fe"
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
                    placeholder="e.g., RELEASES/v1.0.0"
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
                    Helm Values Repository <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={kubernetesCommonFields.helmValuesRepository}
                    onChange={(e) =>
                      handleKubernetesCommonFieldChange('helmValuesRepository', e.target.value)
                    }
                    placeholder="e.g., https://github.com/org/helm-values.git"
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
                    Codeowners Emails <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={kubernetesCommonFields.codeownersEmailIds}
                    onChange={(e) =>
                      handleKubernetesCommonFieldChange('codeownersEmailIds', e.target.value)
                    }
                    placeholder="e.g., user1@example.com, user2@example.com"
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
                    DevOps Stakeholders Emails
                  </Label>
                  <Input
                    value={kubernetesCommonFields.devopsStakeholdersEmailIds}
                    onChange={(e) =>
                      handleKubernetesCommonFieldChange(
                        'devopsStakeholdersEmailIds',
                        e.target.value
                      )
                    }
                    placeholder="e.g., devops@example.com"
                    className={`text-sm ${
                      theme === 'dark'
                        ? 'bg-zinc-700 border-zinc-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Kubernetes Projects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  className={`text-lg font-medium ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}
                >
                  Kubernetes Projects Configuration <span className="text-red-500">*</span>
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
                  Add K8s Project{' '}
                  {kubernetesProjects.length >= 3 ? '(Max 3)' : `(${kubernetesProjects.length}/3)`}
                </Button>
              </div>

              {kubernetesProjects.map((project, _index) => (
                <Card
                  key={project.id}
                  className={`p-6 ${
                    theme === 'dark'
                      ? 'bg-zinc-800/50 border-zinc-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}
                        >
                          Project Name (K8s Service Name) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={project.name}
                          onChange={(e) =>
                            handleKubernetesProjectChange(project.id, 'name', e.target.value)
                          }
                          placeholder="e.g., frontend-service"
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
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
                    onChange={(e) => handleEc2CommonFieldChange('credentialId', e.target.value)}
                    placeholder="e.g., aws-creds-prod"
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
                    Jenkins Jobs <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={ec2CommonFields.jenkinsJobs}
                    onChange={(e) => handleEc2CommonFieldChange('jenkinsJobs', e.target.value)}
                    placeholder="e.g., job1,job2"
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
                    value={ec2CommonFields.releaseTag}
                    onChange={(e) => handleEc2CommonFieldChange('releaseTag', e.target.value)}
                    placeholder="e.g., RELEASES/v1.0.0"
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
                    Codeowners Emails <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={ec2CommonFields.codeownersEmails}
                    onChange={(e) => handleEc2CommonFieldChange('codeownersEmails', e.target.value)}
                    placeholder="e.g., owner@example.com"
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
                    DevOps Stakeholders Emails
                  </Label>
                  <Input
                    value={ec2CommonFields.devopsStakeholdersEmails}
                    onChange={(e) =>
                      handleEc2CommonFieldChange('devopsStakeholdersEmails', e.target.value)
                    }
                    placeholder="e.g., devops@example.com"
                    className={`text-sm ${
                      theme === 'dark'
                        ? 'bg-zinc-700 border-zinc-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* EC2 Projects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  className={`text-lg font-medium ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}
                >
                  EC2 Projects Configuration <span className="text-red-500">*</span>
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
                  Add EC2 Project{' '}
                  {ec2Projects.length >= 3 ? '(Max 3)' : `(${ec2Projects.length}/3)`}
                </Button>
              </div>

              {ec2Projects.map((project, _index) => (
                <Card
                  key={project.id}
                  className={`p-6 ${
                    theme === 'dark'
                      ? 'bg-zinc-800/50 border-zinc-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
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
                          placeholder="e.g., backend-service"
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
                          className={`text-xs ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}
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
                          className={`text-xs ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}
                        >
                          Port <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={project.port}
                          onChange={(e) =>
                            handleEc2ProjectChange(project.id, 'port', e.target.value)
                          }
                          placeholder="e.g., 3000"
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
                          className={`text-xs ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}
                        >
                          Docker Network (optional)
                        </Label>
                        <Input
                          value={project.dockerNetwork}
                          onChange={(e) =>
                            handleEc2ProjectChange(project.id, 'dockerNetwork', e.target.value)
                          }
                          placeholder="e.g., host"
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}
                        >
                          Mount Path (optional)
                        </Label>
                        <Input
                          value={project.mountPath}
                          onChange={(e) =>
                            handleEc2ProjectChange(project.id, 'mountPath', e.target.value)
                          }
                          placeholder="e.g., /var/app:/app"
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
                          className={`text-xs ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}
                        >
                          Log Driver (optional)
                        </Label>
                        <Input
                          value={project.logDriver}
                          onChange={(e) =>
                            handleEc2ProjectChange(project.id, 'logDriver', e.target.value)
                          }
                          placeholder="e.g., json-file"
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}
                        >
                          Log Driver Options (optional)
                        </Label>
                        <Input
                          value={project.logDriverOptions}
                          onChange={(e) =>
                            handleEc2ProjectChange(project.id, 'logDriverOptions', e.target.value)
                          }
                          placeholder="e.g., max-size=10m,max-file=3"
                          className={`text-sm ${
                            theme === 'dark'
                              ? 'bg-zinc-700 border-zinc-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`gpu-${project.id}`}
                        checked={project.enableGpu}
                        onChange={(e) =>
                          handleEc2ProjectChange(project.id, 'enableGpu', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor={`gpu-${project.id}`}
                        className={`text-sm ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}
                      >
                        Enable GPU Support
                      </Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
