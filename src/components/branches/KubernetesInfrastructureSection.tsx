import type { K8sField, K8sSection } from '@/constants/kubernetesSchema';
// src/components/branches/KubernetesInfrastructureSection.tsx
import { Minus, Plus } from 'lucide-react';
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KUBERNETES_INFRA_SCHEMA } from '@/constants/kubernetesSchema';
import { useThemeStore } from '@/store/themeStore';

type KubernetesInfrastructureSectionProps = {
  configKey: string; // e.g. "projectA-stage"
  values: any; // The whole infrastructure_config object or just the part for this projectA-stage
  onChange: (path: string, value: any) => void;
};

export function KubernetesInfrastructureSection({
  configKey,
  values = {},
  onChange,
}: KubernetesInfrastructureSectionProps) {
  const { theme } = useThemeStore();

  const handleFieldChange = (path: string, value: any) => {
    onChange(path, value);
  };

  const renderField = (field: K8sField, currentPath: string, fieldValues: any) => {
    const value = fieldValues?.[field.id];
    const fullPath = currentPath ? `${currentPath}.${field.id}` : field.id;

    const commonProps = {
      id: `${configKey}-${fullPath}`,
      value: value === undefined || value === null ? (field.defaultValue ?? '') : value,
      onChange: (e: any) => {
        const val = field.type === 'number' ? Number(e.target.value) : e.target.value;
        handleFieldChange(fullPath, val);
      },
      placeholder: field.placeholder,
      className: `transition-all duration-200 ${
        theme === 'dark'
          ? 'bg-zinc-800/50 border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 text-white'
          : 'bg-white border-gray-200 focus:border-blue-600 focus:ring-blue-600/10 text-gray-900'
      }`,
    };

    switch (field.type) {
      case 'text':
      case 'number':
      case 'password':
        return (
          <div key={fullPath} className="space-y-1.5">
            <Label
              htmlFor={commonProps.id}
              className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter"
            >
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              {...commonProps}
              type={field.type}
              className={`h-9 text-xs ${commonProps.className}`}
            />
          </div>
        );

      case 'select':
        return (
          <div key={fullPath} className="space-y-1.5">
            <Label
              htmlFor={commonProps.id}
              className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter"
            >
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <select
              {...commonProps}
              className={`w-full h-9 px-3 py-1 rounded-md border text-xs ${commonProps.className}`}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'boolean':
        return (
          <div key={fullPath} className="flex items-center space-x-2 pt-4">
            <input
              type="checkbox"
              id={commonProps.id}
              checked={!!value}
              onChange={(e) => handleFieldChange(fullPath, e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500/20"
            />
            <Label htmlFor={commonProps.id} className="text-xs font-medium">
              {field.label}
            </Label>
          </div>
        );

      case 'object':
        return (
          <div key={fullPath} className="space-y-4 pt-2 pb-2 pl-4 border-l-2 border-zinc-700/30">
            <Label className="text-[11px] font-black text-blue-500 uppercase tracking-widest">
              {field.label}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field.fields?.map((f) => renderField(f, fullPath, value || {}))}
            </div>
          </div>
        );

      case 'list': {
        const list = Array.isArray(value) ? value : [];
        return (
          <div key={fullPath} className="space-y-4 pt-2 pb-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-black text-blue-500 uppercase tracking-widest">
                {field.label}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newItem: any = { _id: crypto.randomUUID() };
                  field.itemSchema?.forEach((f) => {
                    if (f.defaultValue !== undefined) {
                      newItem[f.id] = f.defaultValue;
                    }
                  });
                  handleFieldChange(fullPath, [...list, newItem]);
                }}
                className="h-7 px-2 text-[10px] gap-1"
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            <div className="space-y-4">
              {list.map((item: any, idx: number) => (
                <Card
                  key={item._id || idx}
                  className="p-4 relative bg-zinc-800/10 border-zinc-700/50"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newList = [...list];
                      newList.splice(idx, 1);
                      handleFieldChange(fullPath, newList);
                    }}
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-zinc-500 hover:text-red-500"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {field.itemSchema?.map((f) => renderField(f, `${fullPath}.${idx}`, item))}
                  </div>
                </Card>
              ))}
              {list.length === 0 && (
                <p className="text-[10px] text-zinc-500 italic">
                  No {field.label.toLowerCase()} added.
                </p>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const renderSection = (section: K8sSection) => {
    // Check condition if any
    if (section.condition) {
      const conditionValue = values[section.condition.field];
      if (conditionValue !== section.condition.equals) {
        return null;
      }
    }

    return (
      <AccordionItem key={section.id} value={section.id} className="border-zinc-800">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm font-bold text-zinc-200">{section.title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6">
          <div className="grid grid-cols-1 gap-6 pt-2">
            {section.fields.map((field) => renderField(field, '', values))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={['basic']} className="w-full">
        {KUBERNETES_INFRA_SCHEMA.map(renderSection)}
      </Accordion>
    </div>
  );
}
