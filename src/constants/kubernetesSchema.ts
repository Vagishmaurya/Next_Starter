// src/constants/kubernetesSchema.ts

export type K8sFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean'
  | 'list'
  | 'object'
  | 'any'
  | 'password';

export type K8sField = {
  id: string;
  label: string;
  type: K8sFieldType;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  fields?: K8sField[]; // For 'object' type
  itemSchema?: K8sField[]; // For 'list' type
  helpText?: string;
  placeholder?: string;
  min?: number;
  max?: number;
};

export type K8sSection = {
  id: string;
  title: string;
  description?: string;
  fields: K8sField[];
  condition?: {
    field: string;
    equals: any;
  };
};

export const KUBERNETES_INFRA_SCHEMA: K8sSection[] = [
  {
    id: 'basic',
    title: 'Basic Configuration',
    fields: [
      {
        id: 'namespace',
        label: 'Namespace',
        type: 'text',
        required: true,
        defaultValue: 'default',
      },
      {
        id: 'replicaCount',
        label: 'Replica Count',
        type: 'number',
        required: true,
        defaultValue: 1,
        min: 1,
      },
      {
        id: 'jenkinsNodeName',
        label: 'Jenkins Node Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. jenkins-slave-01',
      },
      { id: 'pullSecret', label: 'Pull Secret', type: 'text', required: false },
      {
        id: 'hostAliases',
        label: 'Host Aliases',
        type: 'list',
        itemSchema: [
          { id: 'ip', label: 'IP Address', type: 'text', required: true },
          { id: 'hostnames', label: 'Hostnames (comma separated)', type: 'text', required: true },
        ],
      },
    ],
  },
  {
    id: 'credentials',
    title: 'Credentials & Environment',
    fields: [
      {
        id: 'awsAccessKeyId',
        label: 'AWS Access Key ID',
        type: 'text',
        required: true,
        placeholder: 'AKIA...',
      },
      {
        id: 'awsSecretAccessKey',
        label: 'AWS Secret Access Key',
        type: 'password',
        required: true,
        placeholder: '••••••••',
      },
      {
        id: 'environments',
        label: 'Environments (envs)',
        type: 'text',
        placeholder: 'e.g. key=value, debug=true',
      },
    ],
  },
  {
    id: 'image',
    title: 'Image Configuration',
    fields: [
      {
        id: 'image',
        label: 'Image Details',
        type: 'object',
        fields: [
          { id: 'name', label: 'Image Name', type: 'text', required: false },
          { id: 'repository', label: 'Repository', type: 'text', required: true },
          { id: 'tag', label: 'Tag', type: 'text', required: true },
          {
            id: 'pullPolicy',
            label: 'Pull Policy',
            type: 'select',
            options: [
              { label: 'IfNotPresent', value: 'IfNotPresent' },
              { label: 'Always', value: 'Always' },
            ],
            defaultValue: 'IfNotPresent',
          },
          {
            id: 'command',
            label: 'Command (JSON array)',
            type: 'text',
            placeholder: '["npm", "start"]',
          },
          { id: 'livenessProbe', label: 'Liveness Probe Path', type: 'text' },
          { id: 'readinessProbe', label: 'Readiness Probe Path', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'service',
    title: 'Service Configuration',
    fields: [
      {
        id: 'service',
        label: 'Service Details',
        type: 'object',
        fields: [
          { id: 'name', label: 'Service Name', type: 'text', required: true },
          {
            id: 'type',
            label: 'Service Type',
            type: 'select',
            options: [
              { label: 'ClusterIP', value: 'ClusterIP' },
              { label: 'NodePort', value: 'NodePort' },
            ],
            defaultValue: 'ClusterIP',
          },
          {
            id: 'externalPort',
            label: 'External Port',
            type: 'number',
            defaultValue: 80,
            min: 80,
            max: 65535,
          },
          {
            id: 'internalPort',
            label: 'Internal Port',
            type: 'number',
            defaultValue: 80,
            min: 80,
            max: 65535,
          },
        ],
      },
    ],
  },
  {
    id: 'ingress_selection',
    title: 'Ingress Selection',
    fields: [
      {
        id: 'ingressType',
        label: 'Ingress Configuration Type',
        type: 'select',
        options: [
          { label: 'Disabled', value: 'disabled' },
          { label: 'Calance Work', value: 'ingressCalanceWork' },
          { label: 'Stage Calance Work', value: 'ingressStageCalanceWork' },
          { label: 'Atcost', value: 'ingressAtcost' },
          { label: 'HRMS', value: 'ingressHrms' },
          { label: 'Prachinfoods', value: 'ingressPrachinfoods' },
          { label: 'Atcost Stage', value: 'ingressAtcostStage' },
          { label: 'HRMS Stage', value: 'ingressHrmsStage' },
          { label: 'Prachinfoods Stage', value: 'ingressPrachinfoodsStage' },
          { label: 'Default', value: 'ingressEnabled' },
        ],
        defaultValue: 'disabled',
      },
    ],
  },
  {
    id: 'ingress_details',
    title: 'Ingress Details (Default)',
    condition: { field: 'ingressType', equals: 'ingressEnabled' },
    fields: [
      {
        id: 'ingress',
        label: 'Ingress Settings',
        type: 'object',
        fields: [
          { id: 'className', label: 'Ingress Class Name', type: 'text', defaultValue: 'nginx' },
          { id: 'tls', label: 'TLS Enabled', type: 'boolean', defaultValue: false },
          {
            id: 'hosts',
            label: 'Hosts',
            type: 'list',
            itemSchema: [
              { id: 'host', label: 'Host', type: 'text', required: true },
              {
                id: 'paths',
                label: 'Paths',
                type: 'list',
                itemSchema: [
                  { id: 'path', label: 'Path', type: 'text', required: true, defaultValue: '/' },
                  {
                    id: 'pathType',
                    label: 'Path Type',
                    type: 'select',
                    options: [
                      { label: 'ImplementationSpecific', value: 'ImplementationSpecific' },
                      { label: 'Exact', value: 'Exact' },
                      { label: 'Prefix', value: 'Prefix' },
                    ],
                    defaultValue: 'ImplementationSpecific',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ingress_calance_details',
    title: 'Ingress Details (Calance)',
    condition: { field: 'ingressType', equals: 'ingressCalanceWork' },
    fields: [
      {
        id: 'ingress',
        label: 'Calance Ingress Settings',
        type: 'object',
        fields: [
          { id: 'className', label: 'Ingress Class Name', type: 'text', defaultValue: 'nginx' },
          { id: 'host', label: 'Host', type: 'text', required: true, defaultValue: 'calance.work' },
          { id: 'path', label: 'Path', type: 'text', defaultValue: '/' },
          {
            id: 'tlsSecretName',
            label: 'TLS Secret Name',
            type: 'text',
            defaultValue: 'calance-work-tls',
          },
        ],
      },
    ],
  },
  {
    id: 'resources',
    title: 'Resource Management',
    fields: [
      {
        id: 'resources',
        label: 'Resources',
        type: 'object',
        fields: [
          {
            id: 'limits',
            label: 'Limits',
            type: 'object',
            fields: [
              { id: 'cpu', label: 'CPU Limit', type: 'text', defaultValue: '500m' },
              { id: 'memory', label: 'Memory Limit', type: 'text', defaultValue: '512Mi' },
            ],
          },
          {
            id: 'requests',
            label: 'Requests',
            type: 'object',
            fields: [
              { id: 'cpu', label: 'CPU Request', type: 'text', defaultValue: '100m' },
              { id: 'memory', label: 'Memory Request', type: 'text', defaultValue: '128Mi' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Options',
    fields: [
      {
        id: 'nodeSelector',
        label: 'Node Selector (JSON)',
        type: 'text',
        placeholder: '{"disktype": "ssd"}',
      },
      { id: 'securityContext', label: 'Security Context (JSON)', type: 'text' },
      { id: 'persistence', label: 'Persistence (JSON)', type: 'text' },
    ],
  },
];
