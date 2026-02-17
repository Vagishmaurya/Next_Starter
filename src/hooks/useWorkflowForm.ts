// src/hooks/useWorkflowForm.ts
import { useState } from 'react';

export type DeploymentType = 'ec2' | 'kubernetes';

export type EC2CommonFields = {
  credentialId: string;
  awsRegion: string;
  jenkinsJobs: string;
  releaseTag: string;
  codeownersEmails: string;
  devopsStakeholdersEmails: string;
};

export type KubernetesCommonFields = {
  jenkinsJobName: string;
  releaseTag: string;
  helmValuesRepository: string;
  codeownersEmailIds: string;
  devopsStakeholdersEmailIds: string;
};

export type KubernetesProject = {
  id: string;
  name: string;
};

export type EC2Project = {
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

export type Project = {
  id: string;
  name: string;
  dockerContextPath: string;
  dockerfilePath: string;
  dotEnvTesting: string;
  dotEnvProduction: string;
};

export function useWorkflowForm() {
  const [workflowName, setWorkflowName] = useState('');
  const [deploymentType, setDeploymentType] = useState<DeploymentType>('ec2');
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

  const resetForm = () => {
    setWorkflowName('');
    setDeploymentType('ec2');
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

  return {
    workflowName,
    setWorkflowName,
    deploymentType,
    setDeploymentType,
    projects,
    setProjects,
    ec2CommonFields,
    setEc2CommonFields,
    ec2Projects,
    setEc2Projects,
    kubernetesCommonFields,
    setKubernetesCommonFields,
    kubernetesProjects,
    setKubernetesProjects,
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
    resetForm,
    validateStep1: () => {
      if (!workflowName.trim()) {
        return false;
      }
      if (projects.length === 0) {
        return false;
      }
      if (projects.some((p) => !p.name.trim())) {
        return false;
      }
      return true;
    },
    validateStep2: () => {
      if (deploymentType === 'ec2') {
        if (
          !ec2CommonFields.credentialId ||
          !ec2CommonFields.awsRegion ||
          !ec2CommonFields.jenkinsJobs ||
          !ec2CommonFields.releaseTag ||
          !ec2CommonFields.codeownersEmails
        ) {
          return false;
        }
        if (ec2Projects.some((p) => !p.name || !p.port)) {
          return false;
        }
      } else {
        if (
          !kubernetesCommonFields.jenkinsJobName ||
          !kubernetesCommonFields.releaseTag ||
          !kubernetesCommonFields.helmValuesRepository ||
          !kubernetesCommonFields.codeownersEmailIds
        ) {
          return false;
        }
        if (kubernetesProjects.some((p) => !p.name)) {
          return false;
        }
      }
      return true;
    },
  };
}
