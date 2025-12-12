'use client';

import { Tag } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useThemeStore } from '@/store/themeStore';

type CreateTagModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tagData: { tag_name: string; tag_message: string; tag_type: string }) => Promise<void>;
  commitSha: string;
};

export function CreateTagModal({ isOpen, onClose, onSubmit, commitSha }: CreateTagModalProps) {
  const { theme } = useThemeStore();
  const [tagName, setTagName] = useState('');
  const [tagMessage, setTagMessage] = useState('');
  const [tagType, setTagType] = useState<'annotated' | 'lightweight'>('annotated');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tagName.trim()) {
      setError('Tag name is required');
      return;
    }

    if (tagType === 'annotated' && !tagMessage.trim()) {
      setError('Tag message is required for annotated tags');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        tag_name: tagName,
        tag_message: tagMessage,
        tag_type: tagType,
      });
      // Reset form
      setTagName('');
      setTagMessage('');
      setTagType('annotated');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTagName('');
      setTagMessage('');
      setTagType('annotated');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-300'}
      >
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            <Tag className="h-5 w-5" />
            Create Tag
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Commit SHA Display */}
            <div>
              <Label className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>
                Commit SHA
              </Label>
              <code
                className={`block mt-1 text-xs font-mono px-3 py-2 rounded ${
                  theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {commitSha.substring(0, 7)}
              </code>
            </div>

            {/* Tag Name */}
            <div>
              <Label
                htmlFor="tagName"
                className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}
              >
                Tag Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tagName"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="v1.0.0"
                disabled={isSubmitting}
                className={
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
                    : 'bg-white border-gray-300 text-gray-900'
                }
              />
            </div>

            {/* Tag Type */}
            <div>
              <Label
                htmlFor="tagType"
                className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}
              >
                Tag Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={tagType}
                onValueChange={(value) => setTagType(value as 'annotated' | 'lightweight')}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="tagType"
                  className={
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-300'
                  }
                >
                  <SelectItem value="annotated">Annotated</SelectItem>
                  <SelectItem value="lightweight">Lightweight</SelectItem>
                </SelectContent>
              </Select>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                {tagType === 'annotated'
                  ? 'Annotated tags include a message and author information'
                  : 'Lightweight tags are simple pointers to a commit'}
              </p>
            </div>

            {/* Tag Message */}
            <div>
              <Label
                htmlFor="tagMessage"
                className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}
              >
                Tag Message
                {tagType === 'annotated' && <span className="text-red-500"> *</span>}
              </Label>
              <Textarea
                id="tagMessage"
                value={tagMessage}
                onChange={(e) => setTagMessage(e.target.value)}
                placeholder="Release version 1.0.0"
                disabled={isSubmitting}
                rows={4}
                className={
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
                    : 'bg-white border-gray-300 text-gray-900'
                }
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={`p-3 rounded text-sm ${
                  theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                }`}
              >
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className={
                theme === 'dark'
                  ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            >
              {isSubmitting ? 'Creating...' : 'Create Tag'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
