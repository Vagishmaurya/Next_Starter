import React from 'react';
import { useThemeStore } from '@/store/themeStore';

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export function TableSkeleton({ rows = 5, columns = 4, className = '' }: TableSkeletonProps) {
  const { theme } = useThemeStore();

  return (
    <div
      className={`w-full overflow-hidden rounded-lg border ${
        theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-200 bg-white'
      } ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`border-b ${
                theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-gray-50'
              }`}
            >
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div
                    className={`h-4 w-24 rounded animate-pulse ${
                      theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
                    }`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b last:border-0 ${
                  theme === 'dark' ? 'border-zinc-800' : 'border-gray-100'
                }`}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div
                      className={`h-4 rounded animate-pulse ${
                        theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'
                      }`}
                      style={{ width: `${Math.random() * 40 + 60}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
