'use client';

import React, { useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useThemeStore } from '@/store/themeStore';

/**
 * Projected Visitors Graph Component
 * Displays future visitor analytics with time range filter buttons
 * Shows two overlapping area charts with grey gradient fills
 */

type GraphDataPoint = {
  date: string;
  visitors1: number;
  visitors2: number;
};

type ProjectedVisitorsGraphProps = {
  title?: string;
  description?: string;
  data?: GraphDataPoint[];
  height?: number;
};

// Sample data for next 3 months (Nov 21, 2025 to Feb 21, 2026)
const DEFAULT_DATA: GraphDataPoint[] = [
  { date: 'Nov 21', visitors1: 2100, visitors2: 1800 },
  { date: 'Nov 23', visitors1: 1900, visitors2: 1600 },
  { date: 'Nov 25', visitors1: 2200, visitors2: 1900 },
  { date: 'Nov 27', visitors1: 1800, visitors2: 1500 },
  { date: 'Nov 29', visitors1: 2400, visitors2: 2100 },
  { date: 'Dec 1', visitors1: 2100, visitors2: 1800 },
  { date: 'Dec 3', visitors1: 2300, visitors2: 2000 },
  { date: 'Dec 5', visitors1: 2000, visitors2: 1700 },
  { date: 'Dec 7', visitors1: 2500, visitors2: 2200 },
  { date: 'Dec 9', visitors1: 2200, visitors2: 1900 },
  { date: 'Dec 11', visitors1: 2400, visitors2: 2100 },
  { date: 'Dec 13', visitors1: 2100, visitors2: 1800 },
  { date: 'Dec 15', visitors1: 2600, visitors2: 2300 },
  { date: 'Dec 17', visitors1: 2900, visitors2: 2600 },
  { date: 'Dec 19', visitors1: 2400, visitors2: 2100 },
  { date: 'Dec 21', visitors1: 2700, visitors2: 2400 },
  { date: 'Dec 23', visitors1: 3100, visitors2: 2800 },
  { date: 'Dec 25', visitors1: 2800, visitors2: 2500 },
  { date: 'Dec 27', visitors1: 2300, visitors2: 2000 },
  { date: 'Dec 29', visitors1: 2500, visitors2: 2200 },
  { date: 'Dec 31', visitors1: 2900, visitors2: 2600 },
  { date: 'Jan 2', visitors1: 2600, visitors2: 2300 },
  { date: 'Jan 4', visitors1: 2100, visitors2: 1800 },
  { date: 'Jan 6', visitors1: 2800, visitors2: 2500 },
  { date: 'Jan 8', visitors1: 2600, visitors2: 2300 },
  { date: 'Jan 10', visitors1: 2100, visitors2: 1800 },
  { date: 'Jan 12', visitors1: 2400, visitors2: 2100 },
  { date: 'Jan 14', visitors1: 1800, visitors2: 1500 },
  { date: 'Jan 16', visitors1: 2200, visitors2: 1900 },
  { date: 'Jan 18', visitors1: 2500, visitors2: 2200 },
  { date: 'Jan 20', visitors1: 2300, visitors2: 2000 },
  { date: 'Jan 22', visitors1: 2100, visitors2: 1800 },
  { date: 'Jan 24', visitors1: 2800, visitors2: 2500 },
  { date: 'Jan 26', visitors1: 2600, visitors2: 2300 },
  { date: 'Jan 28', visitors1: 3000, visitors2: 2700 },
  { date: 'Jan 30', visitors1: 2700, visitors2: 2400 },
  { date: 'Feb 1', visitors1: 2500, visitors2: 2200 },
  { date: 'Feb 3', visitors1: 2400, visitors2: 2100 },
  { date: 'Feb 5', visitors1: 2800, visitors2: 2500 },
  { date: 'Feb 7', visitors1: 2900, visitors2: 2600 },
  { date: 'Feb 9', visitors1: 2600, visitors2: 2300 },
  { date: 'Feb 11', visitors1: 2400, visitors2: 2100 },
  { date: 'Feb 13', visitors1: 2800, visitors2: 2500 },
  { date: 'Feb 15', visitors1: 2500, visitors2: 2200 },
  { date: 'Feb 17', visitors1: 2900, visitors2: 2600 },
  { date: 'Feb 19', visitors1: 2700, visitors2: 2400 },
  { date: 'Feb 21', visitors1: 2800, visitors2: 2500 },
];

type TimeRange = 'next-3-months' | 'next-30-days' | 'next-7-days';

export function ProjectedVisitorsGraph({
  title = 'Projected Visitors',
  description = 'Total for the next 3 months',
  data = DEFAULT_DATA,
  height = 400,
}: ProjectedVisitorsGraphProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [activeRange, setActiveRange] = useState<TimeRange>('next-3-months');

  const filterDataByRange = (range: TimeRange) => {
    switch (range) {
      case 'next-7-days':
        return data.slice(0, 7);
      case 'next-30-days':
        return data.slice(0, 30);
      case 'next-3-months':
      default:
        return data;
    }
  };

  const filteredData = filterDataByRange(activeRange);

  const timeRangeButtons: Array<{ label: string; value: TimeRange }> = [
    { label: 'Next 3 months', value: 'next-3-months' },
    { label: 'Next 30 days', value: 'next-30-days' },
    { label: 'Next 7 days', value: 'next-7-days' },
  ];

  return (
    <div
      className={`rounded-lg border transition-all duration-200 overflow-hidden
        ${
          isDark
            ? 'bg-zinc-900/50 border-zinc-800/50 shadow-lg'
            : 'bg-white border-gray-200 shadow-sm'
        }`}
    >
      <div className="p-6 sm:p-8">
        {/* Header Section - Title and Time Range Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          {/* Title and Description */}
          <div className="min-w-0">
            <h2
              className={`text-xl sm:text-2xl font-bold mb-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {title}
            </h2>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{description}</p>
          </div>

          {/* Time Range Filter Buttons */}
          <div
            className={`flex gap-2 rounded-lg p-1 flex-wrap sm:flex-nowrap border ${
              isDark ? 'bg-zinc-800/30 border-zinc-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            {timeRangeButtons.map((button) => (
              <button
                key={button.value}
                type="button"
                onClick={() => setActiveRange(button.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeRange === button.value
                    ? isDark
                      ? 'bg-zinc-700/80 text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm border border-gray-300'
                    : isDark
                      ? 'text-zinc-400 hover:text-zinc-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider Line */}
        <div className={`mb-6 ${isDark ? 'border-zinc-800/50' : 'border-gray-200'} border-t`}></div>

        {/* Chart Container */}
        <div className="w-full" style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
              {/* Gradient Definitions */}
              <defs>
                {/* First Area Gradient - Darker Grey */}
                <linearGradient id="colorVisitors1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? '#6b7280' : '#a0aec0'} stopOpacity={0.7} />
                  <stop
                    offset="95%"
                    stopColor={isDark ? '#4b5563' : '#cbd5e0'}
                    stopOpacity={0.15}
                  />
                </linearGradient>

                {/* Second Area Gradient - Lighter Grey */}
                <linearGradient id="colorVisitors2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? '#9ca3af' : '#cbd5e0'} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={isDark ? '#6b7280' : '#e2e8f0'} stopOpacity={0.1} />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <CartesianGrid
                strokeDasharray="0"
                stroke={isDark ? '#3f3f46' : '#e5e7eb'}
                vertical={false}
              />

              {/* X-Axis */}
              <XAxis
                dataKey="date"
                stroke={isDark ? '#71717a' : '#9ca3af'}
                style={{
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  fontWeight: '400',
                }}
                tick={{ fill: isDark ? '#71717a' : '#9ca3af' }}
                axisLine={false}
                interval={Math.floor(filteredData.length / 12) || 0}
              />

              {/* Y-Axis */}
              <YAxis
                stroke={isDark ? '#71717a' : '#9ca3af'}
                style={{
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  fontWeight: '400',
                }}
                tick={{ fill: isDark ? '#71717a' : '#9ca3af' }}
                axisLine={false}
                width={40}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#27272a' : '#ffffff',
                  border: `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  boxShadow: isDark
                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: isDark ? '#fafafa' : '#000000' }}
                formatter={(value: any) => [
                  `${typeof value === 'number' ? value.toLocaleString() : value}`,
                  'Visitors',
                ]}
                cursor={{
                  stroke: isDark ? '#52525b' : '#d1d5db',
                  strokeWidth: 1,
                  strokeDasharray: '5 5',
                }}
              />

              {/* First Area Chart - Darker */}
              <Area
                type="monotone"
                dataKey="visitors1"
                fill="url(#colorVisitors1)"
                stroke={isDark ? '#6b7280' : '#9ca3af'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={800}
              />

              {/* Second Area Chart - Lighter (Overlapping) */}
              <Area
                type="monotone"
                dataKey="visitors2"
                fill="url(#colorVisitors2)"
                stroke={isDark ? '#9ca3af' : '#cbd5e0'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={800}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ProjectedVisitorsGraph;
