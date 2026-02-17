'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { useThemeStore } from '@/store/themeStore';

/**
 * Dashboard Stats Card Component
 * Reusable card component for displaying key metrics with trend indicators
 */

type StatsCardProps = {
  title: string;
  value: string | number;
  trend?: {
    percentage: number;
    isPositive: boolean;
  };
  status?: string;
  description?: string;
  variant?: 'default' | 'revenue' | 'customers' | 'accounts' | 'growth';
};

export function StatsCard({
  title,
  value,
  trend,
  status,
  description,
  variant = 'default',
}: StatsCardProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // Variant-specific styling
  const variantStyles = {
    default: {
      accentBg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
      accentText: isDark ? 'text-blue-400' : 'text-blue-600',
      accentDot: isDark ? 'bg-blue-400' : 'bg-blue-500',
    },
    revenue: {
      accentBg: isDark ? 'bg-green-500/10' : 'bg-green-50',
      accentText: isDark ? 'text-green-400' : 'text-green-600',
      accentDot: isDark ? 'bg-green-400' : 'bg-green-500',
    },
    customers: {
      accentBg: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
      accentText: isDark ? 'text-purple-400' : 'text-purple-600',
      accentDot: isDark ? 'bg-purple-400' : 'bg-purple-500',
    },
    accounts: {
      accentBg: isDark ? 'bg-orange-500/10' : 'bg-orange-50',
      accentText: isDark ? 'text-orange-400' : 'text-orange-600',
      accentDot: isDark ? 'bg-orange-400' : 'bg-orange-500',
    },
    growth: {
      accentBg: isDark ? 'bg-pink-500/10' : 'bg-pink-50',
      accentText: isDark ? 'text-pink-400' : 'text-pink-600',
      accentDot: isDark ? 'bg-pink-400' : 'bg-pink-500',
    },
  };

  const _styles = variantStyles[variant];

  const trendColor = trend?.isPositive
    ? isDark
      ? 'text-emerald-400'
      : 'text-emerald-600'
    : isDark
      ? 'text-red-400'
      : 'text-red-600';

  const trendBg = trend?.isPositive
    ? isDark
      ? 'bg-emerald-500/10'
      : 'bg-emerald-50'
    : isDark
      ? 'bg-red-500/10'
      : 'bg-red-50';

  return (
    <div
      className={`rounded-lg border transition-all duration-200 overflow-hidden
        ${
          isDark
            ? 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/80'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
        }`}
    >
      <div className="p-6">
        {/* Header: Title and Trend Indicator */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
            {title}
          </h3>
          {trend && (
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${trendBg} ${trendColor}`}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span>{Math.abs(trend.percentage)}%</span>
            </div>
          )}
        </div>

        {/* Main Value */}
        <div className="mb-3">
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>

        {/* Status Message */}
        {status && (
          <div className="mb-4">
            <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>{status}</p>
          </div>
        )}

        {/* Divider */}
        {description && (
          <div
            className={`border-t mb-3 ${isDark ? 'border-zinc-800/50' : 'border-gray-100'}`}
          ></div>
        )}

        {/* Description */}
        {description && (
          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-600'}`}>{description}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Example Dashboard Stats Grid
 * Demonstrates the StatsCard component with 4 different metric cards
 */

export function DashboardStatsGrid() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className={`transition-colors duration-200 ${isDark ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Section */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Revenue Card */}
          <StatsCard
            title="Total Revenue"
            value="$45,231.89"
            trend={{
              percentage: 20.1,
              isPositive: true,
            }}
            status="Trending up this month"
            description="Revenue for the last 12 months"
            variant="revenue"
          />

          {/* New Customers Card */}
          <StatsCard
            title="New Customers"
            value="2,543"
            trend={{
              percentage: 15.3,
              isPositive: true,
            }}
            status="Up 15% from last month"
            description="Customer acquisitions"
            variant="customers"
          />

          {/* Active Accounts Card */}
          <StatsCard
            title="Active Accounts"
            value="8,234"
            trend={{
              percentage: 8.2,
              isPositive: false,
            }}
            status="Down 8% this period"
            description="Currently active users"
            variant="accounts"
          />

          {/* Growth Rate Card */}
          <StatsCard
            title="Growth Rate"
            value="12.5%"
            trend={{
              percentage: 25.5,
              isPositive: true,
            }}
            status="Accelerating growth"
            description="Month-over-month growth"
            variant="growth"
          />
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
