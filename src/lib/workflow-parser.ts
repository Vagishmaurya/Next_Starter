import type {
  DeploymentType,
  EC2CommonFields,
  EC2Project,
  KubernetesCommonFields,
  KubernetesProject,
  Project,
} from '@/hooks/useWorkflowForm';

export type ParsedWorkflowData = {
  workflowName: string;
  deploymentType: DeploymentType;
  projects: Project[];
  ec2CommonFields?: EC2CommonFields;
  ec2Projects?: EC2Project[];
  kubernetesCommonFields?: KubernetesCommonFields;
  kubernetesProjects?: KubernetesProject[];
};

export function parseWorkflowYaml(content: string): ParsedWorkflowData {
  const workflowName = extractWorkflowName(content);
  const deploymentType = detectDeploymentType(content);

  const parsedData: ParsedWorkflowData = {
    workflowName,
    deploymentType,
    projects: [],
  };

  // Extract base project names from the matrix strategy
  // Pattern: project: [project1, project2]
  const projectNames = extractProjectNames(content);

  // Reconstruct basic Project objects
  // Note: Detailed docker config is not easily extractable from the template
  // as it is dynamically generated from project names in the matrix.
  // We will initialize them with empty optional fields.
  const baseProjects: Project[] = projectNames.map((name, index) => ({
    id: (index + 1).toString(),
    name,
    dockerContextPath: '',
    dockerfilePath: '',
    dotEnvTesting: '',
    dotEnvProduction: '',
  }));

  parsedData.projects = baseProjects;

  if (deploymentType === 'ec2') {
    const commonFields = extractEc2CommonFields(content);
    // For EC2, we need to extract specific project configs (ports, commands, etc.)
    const ec2Projects = extractEc2Projects(content, projectNames);

    parsedData.ec2CommonFields = commonFields;
    parsedData.ec2Projects = ec2Projects;
  } else {
    const commonFields = extractKubernetesCommonFields(content);
    // For K8s, projects are just names in the provided template
    const kubernetesProjects: KubernetesProject[] = projectNames.map((name, index) => ({
      id: (index + 1).toString(),
      name,
    }));

    parsedData.kubernetesCommonFields = commonFields;
    parsedData.kubernetesProjects = kubernetesProjects;
  }

  return parsedData;
}

function extractWorkflowName(content: string): string {
  const match = content.match(/^name:(.*)$/m);
  return match ? match[1].trim() : 'Unknown Workflow';
}

function detectDeploymentType(content: string): DeploymentType {
  const name = extractWorkflowName(content);
  if (name.includes('(Kubernetes)')) {
    return 'kubernetes';
  }
  if (name.includes('(EC2)')) {
    return 'ec2';
  }

  // Fallback heuristics
  if (content.includes('deploy-to-kubernetes')) {
    return 'kubernetes';
  }
  if (content.includes('deploy-to-ec2')) {
    return 'ec2';
  }

  return 'ec2';
}

function extractProjectNames(content: string): string[] {
  // Matches: project: [project1, project2]
  // The template generates: project: [p1, p2, p3]
  const match = content.match(/project:\s*\[(.*?)\]/);
  if (!match) {
    return [];
  }

  return match[1]
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function extractEc2CommonFields(content: string): EC2CommonFields {
  return {
    credentialId: extractValue(content, 'credentialId') || '', // Not explicitly in template secrets but often passed. Wait, template uses AWS_CREDENTIALS: {{ secrets.AWS_CREDENTIALS }} but the form asks for ID. The template doesn't seem to have a specific 'CredentialID' field in YAML output other than secrets.
    // Re-reading template: aws_region: {{.EC2CommonFields.AWSRegion}}
    awsRegion: extractValue(content, 'aws_region') || '',
    jenkinsJobs: extractValue(content, 'jenkins_jobs') || '',
    // template: uses: .../deploy-ec2.yml@{{.EC2CommonFields.ReleaseTag}}
    // OR workflows_release: {{.EC2CommonFields.ReleaseTag}}
    releaseTag: extractValue(content, 'workflows_release') || '',
    codeownersEmails: extractValue(content, 'codeowners_email_ids') || '',
    devopsStakeholdersEmails: extractValue(content, 'devops_stakeholders_email_ids') || '',
  };
}

function extractEc2Projects(content: string, projectNames: string[]): EC2Project[] {
  // We need to parse the blocks:
  // # EC2 specific configuration for <Name>
  // command: ...
  // port: ...

  const projects: EC2Project[] = [];

  for (let i = 0; i < projectNames.length; i++) {
    const name = projectNames[i];
    const id = (i + 1).toString();

    // Create a regex to find the block for this project
    // It starts with the comment and goes until the next project comment or end of secrets section (simplified)
    // We'll just look for keys following the comment.

    const blockRegex = new RegExp(
      `# EC2 specific configuration for ${escapeRegExp(name)}([\\s\\S]*?)(?=# EC2 specific configuration|secrets:|$)`
    );
    const match = content.match(blockRegex);

    if (match) {
      const block = match[1];
      projects.push({
        id,
        name,
        command: extractValueFromBlock(block, 'command') || '',
        port: extractValueFromBlock(block, 'port') || '',
        dockerNetwork: extractValueFromBlock(block, 'docker_network') || '',
        mountPath: extractValueFromBlock(block, 'mount_path') || '',
        enableGpu: block.includes('enable_gpu: true'),
        logDriver: extractValueFromBlock(block, 'log_driver') || '',
        logDriverOptions: extractValueFromBlock(block, 'log_driver_options') || '',
      });
    } else {
      // Default fallback if parsing fails
      projects.push({
        id,
        name,
        command: '',
        port: '',
        dockerNetwork: '',
        mountPath: '',
        enableGpu: false,
        logDriver: '',
        logDriverOptions: '',
      });
    }
  }

  return projects;
}

function extractKubernetesCommonFields(content: string): KubernetesCommonFields {
  return {
    jenkinsJobName: extractValue(content, 'jenkins_job_name') || '',
    releaseTag: extractValue(content, 'workflows_release') || '',
    helmValuesRepository: extractValue(content, 'helm_values_repository') || '',
    codeownersEmailIds: extractValue(content, 'codeowners_email_ids') || '',
    devopsStakeholdersEmailIds: extractValue(content, 'devops_stakeholders_email_ids') || '',
  };
}

// Helper to extract a value based on "key: value"
function extractValue(content: string, key: string): string | null {
  const regex = new RegExp(`${key}:\\s*(.+)`);
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function extractValueFromBlock(block: string, key: string): string | null {
  const regex = new RegExp(`${key}:\\s*(.+)`);
  const match = block.match(regex);
  return match ? match[1].trim() : null;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
