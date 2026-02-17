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

          {projects.map((project, _index) => (
            <Card
              key={project.id}
              className={`p-6 ${
                theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="space-y-6">
                {/* Project Header */}
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <Label
                      className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
                    >
                      Project Name
                    </Label>
                    <Input
                      value={project.name}
                      onChange={(e) => handleProjectChange(project.id, 'name', e.target.value)}
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
                        className={`text-xs ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                        }`}
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
                        className={`text-xs ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                        }`}
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
                        className={`text-xs ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                        }`}
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
                        className={`text-xs ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                        }`}
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
