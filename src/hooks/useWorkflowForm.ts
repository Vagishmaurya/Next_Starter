import type { FormField, FormSection, FormStep, WorkflowTemplate } from '@/lib/api/actions.service';
// src/hooks/useWorkflowForm.ts
import { useCallback, useState } from 'react';

/**
 * Hook to manage complex server-driven workflow forms.
 * Stores values nested by section ID to maintain exact payload structure.
 */
export function useWorkflowForm() {
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize values from template - NESTED structure
  const initializeFromTemplate = useCallback((tpl: WorkflowTemplate) => {
    setTemplate(tpl);
    const initialValues: Record<string, any> = {};

    if (tpl.schema?.steps) {
      tpl.schema.steps.forEach((step) => {
        const processSection = (section: FormSection) => {
          if (section.fields) {
            if (section.isList) {
              // List section initialization
              initialValues[section.id] = [{ _id: crypto.randomUUID() }];
              section.fields.forEach((field) => {
                let val = field.defaultValue;
                if (val === undefined && field.type === 'select' && field.options?.length) {
                  val = field.options[0].value;
                }
                if (val !== undefined) {
                  initialValues[section.id][0][field.id] = val;
                }
              });
            } else {
              // Regular section initialization - ALWAYS NESTED
              initialValues[section.id] = initialValues[section.id] || {};
              section.fields.forEach((field) => {
                let val = field.defaultValue;
                if (val === undefined && field.type === 'select' && field.options?.length) {
                  val = field.options[0].value;
                }
                // Special Case: Pre-fill releaseTag with template version (ensure 'v' prefix)
                if (field.id === 'releaseTag' && !val) {
                  val = tpl.version.startsWith('v') ? tpl.version : `v${tpl.version}`;
                }
                if (val !== undefined) {
                  initialValues[section.id][field.id] = val;
                }
              });
            }
          }
          section.conditionalSections?.forEach((cond) => {
            cond.sections.forEach(processSection);
          });
        };

        step.sections?.forEach(processSection);
        step.conditionalSections?.forEach((cond) => {
          cond.sections.forEach(processSection);
        });
      });
    }

    setValues(initialValues);
    setErrors({});
  }, []);

  // Update a field inside a regular section
  const handleFieldChange = (sectionId: string, fieldId: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [fieldId]: value,
      },
    }));

    // Clear error
    const errorKey = `${sectionId}.${fieldId}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Update a field inside a list item
  const handleListFieldChange = (sectionId: string, index: number, fieldId: string, value: any) => {
    console.log(
      `[useWorkflowForm] handleListFieldChange ${sectionId}[${index}].${fieldId} =`,
      value
    );
    setValues((prev) => {
      const list = [...(prev[sectionId] || [])];
      list[index] = { ...list[index], [fieldId]: value };
      return { ...prev, [sectionId]: list };
    });

    const errorKey = `${sectionId}.${index}.${fieldId}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addListItem = (sectionId: string, templateFields: FormField[]) => {
    setValues((prev) => {
      const list = [...(prev[sectionId] || [])];
      if (list.length >= 10) {
        return prev;
      } // Logical cap

      const newItem: Record<string, any> = { _id: crypto.randomUUID() };
      templateFields.forEach((f) => {
        let val = f.defaultValue;
        if (val === undefined && f.type === 'select' && f.options?.length) {
          val = f.options[0].value;
        }
        if (val !== undefined) {
          newItem[f.id] = val;
        }
      });

      return { ...prev, [sectionId]: [...list, newItem] };
    });
  };

  const removeListItem = (sectionId: string, index: number) => {
    setValues((prev) => {
      const list = [...(prev[sectionId] || [])];
      if (list.length <= 1) {
        return prev;
      }
      list.splice(index, 1);
      return { ...prev, [sectionId]: list };
    });
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    const validateSection = (section: FormSection) => {
      if (section.fields) {
        if (section.isList) {
          const list = values[section.id] || [];
          list.forEach((item: any, idx: number) => {
            section.fields?.forEach((field) => {
              if (field.required && (!item[field.id] || String(item[field.id]).trim() === '')) {
                newErrors[`${section.id}.${idx}.${field.id}`] = `${field.label} is required`;
              }
            });
          });
        } else {
          const sectionData = values[section.id] || {};
          section.fields.forEach((field) => {
            if (
              field.required &&
              (!sectionData[field.id] || String(sectionData[field.id]).trim() === '')
            ) {
              newErrors[`${section.id}.${field.id}`] = `${field.label} is required`;
            }
          });
        }
      }

      section.conditionalSections?.forEach((cond) => {
        if (getFieldValue(cond.when.field) === cond.when.equals) {
          cond.sections.forEach(validateSection);
        }
      });
    };

    step.sections?.forEach(validateSection);
    step.conditionalSections?.forEach((cond) => {
      if (getFieldValue(cond.when.field) === cond.when.equals) {
        cond.sections.forEach(validateSection);
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to find a field value in the nested structure
  const getFieldValue = (fieldId: string) => {
    for (const sectionId in values) {
      if (!Array.isArray(values[sectionId])) {
        if (values[sectionId][fieldId] !== undefined) {
          return values[sectionId][fieldId];
        }
      }
    }
    return undefined;
  };

  /**
   * Transforms nested form values into the final payload.
   * Restores the exact structure required by the backend by mapping
   * section IDs to specific keys and flattening metadata sections.
   * Also filters out irrelevant deployment-specific sections.
   */
  const getFinalPayload = (owner: string, repository: string) => {
    const payload: any = {
      owner,
      repository,
      templateId: template?.templateId,
    };

    if (!template?.schema?.steps) {
      return payload;
    }

    // First pass: flatten metadata to get deploymentType
    Object.keys(values).forEach((sectionId) => {
      if (['base_info', 'deployment_selection'].includes(sectionId)) {
        const sectionValue = values[sectionId];
        if (sectionValue && !Array.isArray(sectionValue) && typeof sectionValue === 'object') {
          Object.assign(payload, sectionValue);
        }
      }
    });

    const deploymentType = payload.deploymentType;

    // Second pass: Process other sections with deployment-type filtering
    Object.keys(values).forEach((sectionId) => {
      // Skip already processed metadata sections
      if (['base_info', 'deployment_selection'].includes(sectionId)) {
        return;
      }

      const sectionValue = values[sectionId];
      if (!sectionValue) {
        return;
      }

      // Map section IDs to the keys the backend expects
      let targetKey = sectionId;
      if (sectionId === 'ec2_common') {
        targetKey = 'ec2CommonFields';
      }
      if (sectionId === 'ec2_projects') {
        targetKey = 'ec2Projects';
      }
      if (sectionId === 'kubernetes_common') {
        targetKey = 'kubernetesCommonFields';
      }
      if (sectionId === 'kubernetes_projects') {
        targetKey = 'kubernetesProjects';
      }
      if (sectionId === 'project_config') {
        targetKey = 'projects';
      }

      // FILTERING: Only include sections relevant to the selected deployment type
      const isEc2Section = ['ec2CommonFields', 'ec2Projects'].includes(targetKey);
      const isK8sSection = ['kubernetesCommonFields', 'kubernetesProjects'].includes(targetKey);

      if (isEc2Section && deploymentType !== 'ec2') {
        return;
      }
      if (isK8sSection && deploymentType !== 'kubernetes') {
        return;
      }

      // Project ID Injection: Add "id" to list items in specific structural sections
      let processedValue = sectionValue;
      if (
        ['projects', 'ec2Projects', 'kubernetesProjects'].includes(targetKey) &&
        Array.isArray(sectionValue)
      ) {
        processedValue = sectionValue.map((item, idx) => ({
          ...item,
          id: (idx + 1).toString(),
        }));
      }

      // Add the section to the payload
      payload[targetKey] = processedValue;
    });

    console.log('[useWorkflowForm] Final Filtered Payload:', payload);
    return payload;
  };

  /**
   * Synchronizes project names from Step 1 (project_config) to Step 2 (ec2_projects or kubernetes_projects).
   * This ensures that names entered in Step 1 are pre-populated in Step 2 while remaining editable.
   */
  const syncLinkedProjects = useCallback(() => {
    setValues((prev) => {
      // Helper to find field in ANY section found in current state
      const getVal = (id: string, state: Record<string, any>) => {
        for (const sid in state) {
          if (!Array.isArray(state[sid]) && state[sid][id] !== undefined) {
            return state[sid][id];
          }
        }
        return undefined;
      };

      const deploymentType = getVal('deploymentType', prev);
      const sourceProjects = prev.project_config || [];

      if (!sourceProjects.length) {
        return prev;
      }

      const targetSectionId = deploymentType === 'ec2' ? 'ec2_projects' : 'kubernetes_projects';
      const targetProjects = [...(prev[targetSectionId] || [])];
      let hasChanges = false;

      const syncedProjects = sourceProjects.map((source: any, idx: number) => {
        const existing = targetProjects[idx] || {};
        if (existing.name !== source.name) {
          hasChanges = true;
          return {
            ...existing,
            _id: existing._id || crypto.randomUUID(),
            name: source.name,
          };
        }
        return { ...existing, _id: existing._id || crypto.randomUUID() };
      });

      if (!hasChanges && syncedProjects.length === targetProjects.length) {
        return prev;
      }

      console.log(
        `[useWorkflowForm] Synced ${syncedProjects.length} projects to ${targetSectionId}`
      );
      return {
        ...prev,
        [targetSectionId]: syncedProjects,
      };
    });
  }, []); // Remove values dependency as we use functional setValues

  const resetForm = () => {
    setValues({});
    setErrors({});
    setTemplate(null);
  };

  return {
    template,
    values,
    errors,
    setValues,
    initializeFromTemplate,
    handleFieldChange,
    handleListFieldChange,
    addListItem,
    removeListItem,
    validateStep,
    getFinalPayload,
    syncLinkedProjects,
    resetForm,
    getFieldValue,
  };
}
