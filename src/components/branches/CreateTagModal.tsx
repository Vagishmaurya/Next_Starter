'use client';

import type { Tag as TagType } from '@/lib/api/tags.service';
import { Tag } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
  tags: TagType[];
  selectedBranch: string | null;
};

export function CreateTagModal({
  isOpen,
  onClose,
  onSubmit,
  commitSha,
  tags,
  selectedBranch,
}: CreateTagModalProps) {
  const { theme } = useThemeStore();
  const [tagName, setTagName] = useState('');
  const [tagMessage, setTagMessage] = useState('');
  const [tagType, setTagType] = useState<'annotated' | 'lightweight'>('annotated');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Version parsing and validation functions
  const parseVersion = (version: string) => {
    // Handle both v1.2.3 and v1.2.3-rc1 formats
    const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-rc(\d+))?$/);
    if (!match) {
      return null;
    }

    return {
      major: Number.parseInt(match[1], 10),
      minor: Number.parseInt(match[2], 10),
      patch: Number.parseInt(match[3], 10),
      rc: match[4] ? Number.parseInt(match[4], 10) : 0,
      isRC: !!match[4],
    };
  };

  const isValidVersionFormat = (version: string) => {
    const isMainBranch = selectedBranch === 'main' || selectedBranch === 'master';

    if (isMainBranch) {
      // Main branch: v1.2.3 format only
      return /^v\d+\.\d+\.\d+$/.test(version);
    } else {
      // Other branches: v1.2.3-rc1 format only
      return /^v\d+\.\d+\.\d+-rc\d+$/.test(version);
    }
  };

  // Auto-populate tag name when modal opens
  useEffect(() => {
    const generateNextVersion = () => {
      const isMainBranch = selectedBranch === 'main' || selectedBranch === 'master';

      if (tags.length === 0) {
        return isMainBranch ? 'v0.0.1' : 'v0.0.1-rc1';
      }

      let latestVersion = { major: 0, minor: 0, patch: 0, rc: 0, isRC: false };
      let latestRCVersion = { major: 0, minor: 0, patch: 0, rc: 0, isRC: false };

      // Find latest release and RC versions
      tags.forEach((tag) => {
        const parsed = parseVersion(tag.name);
        if (!parsed) {
          return;
        }

        if (parsed.isRC) {
          // Track latest RC version
          const currentRC = latestRCVersion;
          if (
            parsed.major > currentRC.major ||
            (parsed.major === currentRC.major && parsed.minor > currentRC.minor) ||
            (parsed.major === currentRC.major &&
              parsed.minor === currentRC.minor &&
              parsed.patch > currentRC.patch) ||
            (parsed.major === currentRC.major &&
              parsed.minor === currentRC.minor &&
              parsed.patch === currentRC.patch &&
              parsed.rc > currentRC.rc)
          ) {
            latestRCVersion = { ...parsed };
          }
        } else {
          // Track latest release version
          const current = latestVersion;
          if (
            parsed.major > current.major ||
            (parsed.major === current.major && parsed.minor > current.minor) ||
            (parsed.major === current.major &&
              parsed.minor === current.minor &&
              parsed.patch > current.patch)
          ) {
            latestVersion = { ...parsed };
          }
        }
      });

      if (isMainBranch) {
        // Main branch: increment patch version
        return `v${latestVersion.major}.${latestVersion.minor}.${latestVersion.patch + 1}`;
      } else {
        // Other branches: create or increment RC version
        if (
          latestRCVersion.major === 0 &&
          latestRCVersion.minor === 0 &&
          latestRCVersion.patch === 0
        ) {
          // No RC versions exist, create first RC based on latest release + 1
          return `v${latestVersion.major}.${latestVersion.minor}.${latestVersion.patch + 1}-rc1`;
        } else {
          // Increment RC number
          return `v${latestRCVersion.major}.${latestRCVersion.minor}.${latestRCVersion.patch}-rc${latestRCVersion.rc + 1}`;
        }
      }
    };

    if (isOpen && !tagName) {
      const nextVersion = generateNextVersion();
      setTagName(nextVersion);
      setTagMessage(`Release ${nextVersion}`);
    }
  }, [isOpen, tags, selectedBranch, tagName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tagName.trim()) {
      setError('Tag name is required');
      return;
    }

    // Strict version format validation
    if (!isValidVersionFormat(tagName)) {
      const isMainBranch = selectedBranch === 'main' || selectedBranch === 'master';
      setError(
        isMainBranch
          ? 'Invalid version format. Main branch requires format: v1.2.3'
          : 'Invalid version format. Feature branches require format: v1.2.3-rc1'
      );
      return;
    }

    // Check for duplicate tag names
    const tagExists = tags.some((tag) => tag.name === tagName);
    if (tagExists) {
      setError('A tag with this name already exists');
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
      setError(null);
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
            {/* Branch and Commit Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>
                  Branch
                </Label>
                <code
                  className={`block mt-1 text-xs font-mono px-3 py-2 rounded ${
                    theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedBranch || 'Unknown'}
                </code>
              </div>
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
                placeholder={
                  selectedBranch === 'main' || selectedBranch === 'master' ? 'v1.2.3' : 'v1.2.3-rc1'
                }
                disabled={isSubmitting}
                className={
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
                    : 'bg-white border-gray-300 text-gray-900'
                }
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                {selectedBranch === 'main' || selectedBranch === 'master'
                  ? 'Format: v1.2.3 (main branch releases)'
                  : 'Format: v1.2.3-rc1 (feature branch releases)'}
              </p>
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
