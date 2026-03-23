import type { Commit } from '@/lib/api/branches.service';
import { ExternalLink, GitCommit, Tag } from 'lucide-react';
import React, { memo } from 'react';
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
      className={`group transition-all duration-300 ${
        theme === 'dark' ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.01]'
      }`}
    >
      <td className="px-5 py-3">
        <div className="flex items-start gap-3">
          <div
            className={`mt-1 h-5 w-5 rounded-md flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}
          >
            <GitCommit className="h-3 w-3" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p
              className={`text-xs font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}
            >
              {commit.commit?.message?.split('\n')[0] || 'No commit message'}
            </p>
            {commit.commit?.comment_count > 0 && (
              <div className="flex items-center gap-1 opacity-60">
                <div className="w-1 h-1 rounded-full bg-zinc-500" />
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                  {commit.commit?.comment_count} comment
                  {commit.commit?.comment_count !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
            {commit.commit?.author?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <span
              className={`text-[11px] font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}
            >
              {commit.commit?.author?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-col">
          <span
            className={`text-[11px] font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
          >
            {getRelativeTime(commit.commit?.author?.date || '')}
          </span>
          <span className="text-[9px] uppercase tracking-tighter text-zinc-500/60 font-black">
            {formatDate(commit.commit?.author?.date || '')}
          </span>
        </div>
      </td>
      <td className="px-5 py-3">
        <code
          className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md border ${
            theme === 'dark'
              ? 'bg-zinc-900/50 border-white/5 text-zinc-400'
              : 'bg-zinc-100 border-black/5 text-zinc-600'
          }`}
        >
          {commit.sha.substring(0, 7)}
        </code>
      </td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTagClick(commit.sha)}
            className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10"
          >
            <Tag className="h-3 w-3 mr-1" />
            Tag
          </Button>
          <a
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </td>
    </tr>
  );
});

CommitRow.displayName = 'CommitRow';
