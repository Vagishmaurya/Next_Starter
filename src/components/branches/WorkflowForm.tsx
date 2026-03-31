import type { useWorkflowForm } from '@/hooks/useWorkflowForm';
import type { FormField, FormSection } from '@/lib/api/actions.service';
// src/components/branches/WorkflowForm.tsx
import { AlertCircle, Minus, Plus } from 'lucide-react';
import React, { useEffect } from 'react';
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
    template,
    values,
    errors,
    handleFieldChange,
    handleListFieldChange,
    addListItem,
    removeListItem,
    getFieldValue,
  } = form;

  // Synchronize project names from Step 1 to Step 2 targets automatically
  useEffect(() => {
    if (currentStep === 1) {
      form.syncLinkedProjects();
    }
  }, [values.project_config, values.deployment_selection, currentStep, form.syncLinkedProjects]);

  // Auto-scroll to first error
  useEffect(() => {
    const errorIds = Object.keys(errors);
    if (errorIds.length > 0) {
      const firstErrorId = errorIds[0].replace(/\./g, '-');
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [errors]);

  if (!template?.schema?.steps) {
    return null;
  }

  const step = template.schema.steps.find((_, index) => index + 1 === currentStep);
  if (!step) {
    return null;
  }

  const renderField = (
    field: FormField,
    value: any,
    error: string | undefined,
    onChange: (val: any) => void,
    idPrefix?: string,
    key?: string
  ) => {
    const fieldId = idPrefix ? `${idPrefix}-${field.id}` : field.id;
    const commonProps = {
      id: fieldId,
      value: value || '',
      onChange: (e: any) => {
        const val = field.type === 'boolean' ? e.target.checked : e.target.value;
        console.log(`[WorkflowForm] Change ${fieldId}:`, val);
        onChange(val);
      },
      placeholder: field.placeholder,
      disabled: false, // Force enabled
      readOnly: false, // Force editable
      required: field.required,
      className: `transition-all duration-200 ${
        error
          ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
          : theme === 'dark'
            ? 'bg-zinc-800/50 border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 text-white'
            : 'bg-white border-gray-200 focus:border-blue-600 focus:ring-blue-600/10 text-gray-900'
      }`,
    };

    const fieldContent = (() => {
      switch (field.type) {
        case 'textarea':
          return (
            <Textarea
              {...commonProps}
              rows={3}
              className={`${commonProps.className} font-mono text-xs resize-none`}
            />
          );
        case 'select':
          return (
            <select
              {...commonProps}
              className={`w-full h-11 px-3 py-2 rounded-md border text-sm ${commonProps.className}`}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        case 'boolean':
          return (
            <div className="flex items-center space-x-2 h-11">
              <input
                type="checkbox"
                id={fieldId}
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500/20"
              />
              <Label htmlFor={fieldId} className="text-sm font-medium">
                {field.label}
              </Label>
            </div>
          );
        default:
          return (
            <div className="relative flex items-center group">
              <Input
                {...commonProps}
                className={`h-11 px-4 ${field.suffix ? 'pr-12' : ''} ${commonProps.className}`}
              />
              {field.suffix && (
                <div className="absolute right-3 px-1.5 py-0.5 rounded bg-zinc-700/30 text-[10px] uppercase font-bold text-zinc-500 pointer-events-none">
                  {field.suffix}
                </div>
              )}
            </div>
          );
      }
    })();

    return (
      <div key={key || fieldId} className="space-y-1.5">
        <Label
          htmlFor={fieldId}
          className={`text-sm font-semibold flex items-center gap-1.5 ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'}`}
        >
          {field.label}
          {field.required && <span className="text-red-500 font-bold">*</span>}
          {error && <AlertCircle className="h-3.5 w-3.5 text-red-500 animate-pulse" />}
        </Label>
        {fieldContent}
        {error ? (
          <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        ) : field.helpText ? (
          <p className={`text-[11px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
            {field.helpText}
          </p>
        ) : null}
      </div>
    );
  };

  const renderSection = (section: FormSection) => {
    const isGrid = section.layout === 'grid-2';

    if (!section.fields && section.conditionalSections) {
      return (
        <div key={section.id} className="space-y-6 animate-in fade-in">
          {section.conditionalSections.map((cond, condIdx) => {
            if (getFieldValue(cond.when.field) === cond.when.equals) {
              return (
                <div
                  key={`${section.id}-cond-${condIdx}`}
                  className="space-y-6 animate-in slide-in-from-top-2 duration-300"
                >
                  {cond.sections?.map(renderSection)}
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    if (!section.fields) {
      return null;
    }

    if (section.isList) {
      const list = values[section.id] || [];
      return (
        <div key={section.id} className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b pb-2 border-zinc-700/30">
            <div>
              <Label
                className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
              >
                {section.title}
              </Label>
              {section.description && (
                <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                  {section.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem(section.id, section.fields || [])}
                disabled={list.length >= (section.maxItems || 10)}
                className={`flex items-center gap-2 rounded-full px-4 h-9 shadow-sm transition-all ${
                  theme === 'dark'
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-30'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add {section.itemLabel || 'Item'}</span>
                <span className="ml-1 opacity-50 font-mono text-[10px]">
                  {list.length}/{section.maxItems || 10}
                </span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {list.map((item: any, index: number) => {
              let itemLabel = `${section.itemLabel || 'Item'} #${index + 1}`;
              const boundField = section.fields?.find((f) => f.bindTo);
              if (boundField && boundField.bindTo) {
                const [sourceListId, sourceFieldName] = boundField.bindTo.split('.');
                const sourceList = values[sourceListId] || [];
                if (sourceList[index] && sourceList[index][sourceFieldName]) {
                  itemLabel = sourceList[index][sourceFieldName];
                }
              }

              return (
                <Card
                  key={item._id || index}
                  className={`relative group p-6 rounded-2xl border transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/50'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    {itemLabel}
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-end">
                      {list.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeListItem(section.id, index)}
                          className={`h-8 w-8 p-0 rounded-xl transition-colors ${
                            theme === 'dark'
                              ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                      {section.fields?.map((field) => {
                        const fieldValue = item[field.id];
                        return renderField(
                          field,
                          fieldValue,
                          errors[`${section.id}.${index}.${field.id}`],
                          (val) => handleListFieldChange(section.id, index, field.id, val),
                          `${section.id}-${index}`,
                          `${section.id}-${index}-${field.id}`
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div key={section.id} className="space-y-6 animate-in fade-in">
        {section.title && (
          <div className="border-b pb-2 border-zinc-700/30">
            <h3
              className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
            >
              {section.title}
            </h3>
            {section.description && (
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                {section.description}
              </p>
            )}
          </div>
        )}
        <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          {section.fields?.map((field) =>
            renderField(
              field,
              (values[section.id] || {})[field.id],
              errors[`${section.id}.${field.id}`],
              (val) => handleFieldChange(section.id, field.id, val),
              undefined,
              `${section.id}-${field.id}`
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-500/5 rounded-r-xl">
        <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
      </div>

      {step?.sections?.map(renderSection)}
      {step?.conditionalSections?.map((cond, condIdx) => {
        if (getFieldValue(cond.when.field) === cond.when.equals) {
          return (
            <div
              key={`step-cond-${condIdx}`}
              className="space-y-8 mt-8 border-t border-zinc-700/30 pt-8 animate-in fade-in slide-in-from-top-4 duration-500"
            >
              {cond.sections?.map(renderSection)}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
