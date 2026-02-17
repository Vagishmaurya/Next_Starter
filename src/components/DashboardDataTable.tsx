'use client';

import { Check, ChevronDown, GripVertical, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

/**
 * Dashboard Data Table Component
 * Displays document sections with draggable handles, checkboxes, status, and reviewer assignments
 * Matches the provided screenshot design exactly
 */

type TableRow = {
  id: string;
  header: string;
  sectionType: 'Cover page' | 'Table of contents' | 'Narrative' | 'Technical content';
  status: 'Done' | 'In Process';
  target: number;
  limit: number;
  reviewer: string | 'Assign reviewer';
};

type DashboardDataTableProps = {
  data?: TableRow[];
  onRowSelect?: (selectedIds: string[]) => void;
  onReviewerAssign?: (rowId: string, reviewer: string) => void;
};

const DEFAULT_DATA: TableRow[] = [
  {
    id: '1',
    header: 'Cover page',
    sectionType: 'Cover page',
    status: 'Done',
    target: 100,
    limit: 120,
    reviewer: 'Eddie Lake',
  },
  {
    id: '2',
    header: 'Table of contents',
    sectionType: 'Table of contents',
    status: 'In Process',
    target: 85,
    limit: 110,
    reviewer: 'Assign reviewer',
  },
  {
    id: '3',
    header: 'Executive summary',
    sectionType: 'Narrative',
    status: 'Done',
    target: 150,
    limit: 180,
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: '4',
    header: 'Technical approach',
    sectionType: 'Technical content',
    status: 'In Process',
    target: 200,
    limit: 250,
    reviewer: 'Assign reviewer',
  },
  {
    id: '5',
    header: 'Design',
    sectionType: 'Technical content',
    status: 'Done',
    target: 120,
    limit: 140,
    reviewer: 'Eddie Lake',
  },
  {
    id: '6',
    header: 'Capabilities',
    sectionType: 'Narrative',
    status: 'In Process',
    target: 90,
    limit: 115,
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: '7',
    header: 'Integration with existing systems',
    sectionType: 'Technical content',
    status: 'Done',
    target: 175,
    limit: 210,
    reviewer: 'Assign reviewer',
  },
  {
    id: '8',
    header: 'Innovation and Advantages',
    sectionType: 'Narrative',
    status: 'Done',
    target: 130,
    limit: 160,
    reviewer: 'Eddie Lake',
  },
  {
    id: '9',
    header: "Overview of EMR's Innovative Solutions",
    sectionType: 'Technical content',
    status: 'In Process',
    target: 160,
    limit: 190,
    reviewer: 'Assign reviewer',
  },
  {
    id: '10',
    header: 'Advanced Algorithms and Machine Learning',
    sectionType: 'Technical content',
    status: 'Done',
    target: 220,
    limit: 270,
    reviewer: 'Jamik Tashpulatov',
  },
];

export function DashboardDataTable({
  data = DEFAULT_DATA,
  onRowSelect,
  onReviewerAssign,
}: DashboardDataTableProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [selectedRows, setSelectedRows] = useState<Set<string>>(() => new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      setSelectedRows(new Set(data.map((row) => row.id)));
      setSelectAll(true);
    }
  };

  const handleRowSelect = (rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === data.length);
    onRowSelect?.(Array.from(newSelected));
  };

  const handleReviewerSelect = (rowId: string, reviewer: string) => {
    onReviewerAssign?.(rowId, reviewer);
    setActiveDropdown(null);
  };

  const reviewers = ['Eddie Lake', 'Jamik Tashpulatov'];

  const sectionTypeStyles: Record<string, { bg: string; text: string }> = {
    'Cover page': {
      bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
      text: isDark ? 'text-blue-400' : 'text-blue-700',
    },
    'Table of contents': {
      bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
      text: isDark ? 'text-purple-400' : 'text-purple-700',
    },
    Narrative: {
      bg: isDark ? 'bg-green-500/10' : 'bg-green-50',
      text: isDark ? 'text-green-400' : 'text-green-700',
    },
    'Technical content': {
      bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50',
      text: isDark ? 'text-orange-400' : 'text-orange-700',
    },
  };

  return (
    <div
      className={`rounded-lg border transition-all duration-200 overflow-hidden ${
        isDark ? 'bg-zinc-900/50 border-zinc-800/50' : 'bg-white border-gray-200'
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr
              className={`border-b ${
                isDark ? 'border-zinc-800/50' : 'border-gray-200'
              } ${isDark ? 'bg-zinc-800/30' : 'bg-gray-50'}`}
            >
              {/* Checkbox Column */}
              <th className="px-4 py-4 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                  className={`w-4 h-4 rounded cursor-pointer accent-blue-500 ${
                    isDark ? 'bg-zinc-700 border-zinc-600' : 'bg-white border-gray-300'
                  } border`}
                />
              </th>

              {/* Header Column */}
              <th
                className={`px-6 py-4 text-left font-semibold text-sm ${
                  isDark ? 'text-zinc-300' : 'text-gray-900'
                }`}
              >
                Header
              </th>

              {/* Section Type Column */}
              <th
                className={`px-6 py-4 text-left font-semibold text-sm ${
                  isDark ? 'text-zinc-300' : 'text-gray-900'
                }`}
              >
                Section Type
              </th>

              {/* Status Column */}
              <th
                className={`px-6 py-4 text-left font-semibold text-sm ${
                  isDark ? 'text-zinc-300' : 'text-gray-900'
                }`}
              >
                Status
              </th>

              {/* Target Column */}
              <th
                className={`px-6 py-4 text-right font-semibold text-sm ${
                  isDark ? 'text-zinc-300' : 'text-gray-900'
                }`}
              >
                Target
              </th>

              {/* Limit Column */}
              <th
                className={`px-6 py-4 text-right font-semibold text-sm ${
                  isDark ? 'text-zinc-300' : 'text-gray-900'
                }`}
              >
                Limit
              </th>

              {/* Reviewer Column */}
              <th
                className={`px-6 py-4 text-left font-semibold text-sm ${
                  isDark ? 'text-zinc-300' : 'text-gray-900'
                }`}
              >
                Reviewer
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                className={`border-b transition-colors duration-150 ${
                  isDark
                    ? 'border-zinc-800/30 hover:bg-zinc-800/30'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                {/* Checkbox with Draggable Handle */}
                <td className="px-4 py-4 w-12">
                  <div className="flex items-center gap-2">
                    <GripVertical
                      className={`w-4 h-4 cursor-grab active:cursor-grabbing flex-shrink-0 ${
                        isDark ? 'text-zinc-500' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleRowSelect(row.id)}
                      aria-label="Select row"
                      className={`w-4 h-4 rounded cursor-pointer accent-blue-500 flex-shrink-0 ${
                        isDark ? 'bg-zinc-700 border-zinc-600' : 'bg-white border-gray-300'
                      } border`}
                    />
                  </div>
                </td>

                {/* Header Cell */}
                <td
                  className={`px-6 py-4 text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {row.header}
                </td>

                {/* Section Type Cell */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      sectionTypeStyles[row.sectionType]?.bg || 'bg-gray-50'
                    } ${sectionTypeStyles[row.sectionType]?.text || 'text-gray-700'}`}
                  >
                    {row.sectionType}
                  </span>
                </td>

                {/* Status Cell */}
                <td className="px-6 py-4">
                  <div
                    className={`flex items-center gap-2 ${
                      row.status === 'In Process'
                        ? isDark
                          ? 'text-zinc-400'
                          : 'text-gray-500'
                        : isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-600'
                    }`}
                  >
                    {row.status === 'Done' ? (
                      <Check className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{row.status}</span>
                  </div>
                </td>

                {/* Target Cell */}
                <td
                  className={`px-6 py-4 text-right text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {row.target}
                </td>

                {/* Limit Cell */}
                <td
                  className={`px-6 py-4 text-right text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {row.limit}
                </td>

                {/* Reviewer Cell */}
                <td className="px-6 py-4 relative">
                  {row.reviewer === 'Assign reviewer' ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === row.id ? null : row.id)}
                        className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors ${
                          isDark
                            ? 'text-zinc-400 hover:text-zinc-300'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Assign reviewer
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === row.id && (
                        <div
                          className={`absolute top-full left-0 mt-2 min-w-max rounded-lg border shadow-lg z-10 ${
                            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                          }`}
                        >
                          {reviewers.map((reviewer) => (
                            <button
                              key={reviewer}
                              type="button"
                              onClick={() => handleReviewerSelect(row.id, reviewer)}
                              className={`block w-full text-left px-4 py-2 text-sm font-medium first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                isDark
                                  ? 'text-white hover:bg-zinc-700'
                                  : 'text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              {reviewer}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span
                      className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {row.reviewer}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardDataTable;
