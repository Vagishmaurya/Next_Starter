import type { Commit } from '@/lib/api/branches.service';
import { Clock, ExternalLink, GitCommit, Tag, User } from 'lucide-react';
import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Helper functions moved outside component to avoid recreation
const formatDate = (dateString: string) => {
  if (!dateString) {
    return 'N/A';
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getRelativeTime = (dateString: string) => {
  if (!dateString) {
    return 'N/A';
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 30) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  return formatDate(dateString);
};

type CommitRowProps = {
  commit: Commit;
  theme: string;
  onTagClick: (sha: string) => void;
};

export const CommitRow = memo(({ commit, theme, onTagClick }: CommitRowProps) => {
  return (
    <tr
      className={`transition-all duration-200 ${
        theme === 'dark' ? 'hover:bg-zinc-800/70' : 'hover:bg-gray-50/80'
      }`}
    >
      <td className="px-6 py-4">
        <div className="flex items-start gap-2">
          <GitCommit
            className={`h-4 w-4 mt-1 shrink-0 ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'
            }`}
          />
          <div>
            <p
              className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {commit.commit?.message?.split('\n')[0] || 'No commit message'}
            </p>
            {commit.commit?.comment_count > 0 && (
              <Badge
                variant="secondary"
                className={`mt-1 text-xs ${
                  theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {commit.commit?.comment_count} comment
                {commit.commit?.comment_count !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <User className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`} />
          <div>
            <p
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
              }`}
            >
              {commit.commit?.author?.name || 'Unknown'}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              {commit.commit?.author?.email || ''}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`} />
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              {getRelativeTime(commit.commit?.author?.date || '')}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              {formatDate(commit.commit?.author?.date || '')}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <code
          className={`text-xs font-mono px-2 py-1 rounded ${
            theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {commit.sha.substring(0, 7)}
        </code>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTagClick(commit.sha)}
            className={`text-xs ${
              theme === 'dark'
                ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Tag className="h-3 w-3 mr-1" />
            Create Tag
          </Button>
          <a
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-sm hover:underline ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            View
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </td>
    </tr>
  );
});

CommitRow.displayName = 'CommitRow';
