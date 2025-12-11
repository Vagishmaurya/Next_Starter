'use client';

import { Activity, ChevronDown, Clock, Eye, GitBranch, Github, Plus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { DashboardStatsGrid } from '@/components/DashboardCards';
import DashboardDataTable from '@/components/DashboardDataTable';
import { ProjectedVisitorsGraph } from '@/components/DashboardGraph';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrganizationsStore } from '@/store/organizationsStore';
import { useThemeStore } from '@/store/themeStore';
import { useOrganizationsViewModel } from '@/viewmodels/OrganizationsViewModel';

type Project = {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'building';
  lastDeployed: string;
  visitors: number;
  icon: React.ReactNode;
};

const _demoProjects: Project[] = [
  {
    id: '1',
    name: 'My App',
    domain: 'myapp.calance.app',
    status: 'active',
    lastDeployed: '2 hours ago',
    visitors: 1234,
    icon: <Activity className="h-5 w-5" />,
  },
  {
    id: '2',
    name: 'Blog Platform',
    domain: 'blog.calance.app',
    status: 'active',
    lastDeployed: '1 day ago',
    visitors: 5621,
    icon: <GitBranch className="h-5 w-5" />,
  },
  {
    id: '3',
    name: 'Dashboard Project',
    domain: 'dashboard-proj.calance.app',
    status: 'building',
    lastDeployed: 'Building...',
    visitors: 342,
    icon: <Settings className="h-5 w-5" />,
  },
];

function _ProjectCard({ project, theme }: { project: Project; theme: 'light' | 'dark' }) {
  const statusConfig = {
    active: {
      bg: theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50',
      text: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700',
      dot: theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500',
      label: 'Production',
    },
    inactive: {
      bg: theme === 'dark' ? 'bg-gray-500/10' : 'bg-gray-50',
      text: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      dot: theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500',
      label: 'Inactive',
    },
    building: {
      bg: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50',
      text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      dot: theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500',
      label: 'Building',
    },
  };

  const config = statusConfig[project.status];

  return (
    <div
      className={`rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden
      ${
        theme === 'dark'
          ? 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/80'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
      }`}
    >
      <div className="p-5">
        {/* Project Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`p-2 rounded-lg flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-100'}`}
          >
            <div className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
              {project.icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-base mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {project.name}
            </h3>
            <p
              className={`text-xs truncate ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}
            >
              {project.domain}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${config.dot} ${project.status === 'building' ? 'animate-pulse' : ''}`}
            ></span>
            {config.label}
          </div>
        </div>

        {/* Stats Grid */}
        <div
          className={`grid grid-cols-2 gap-3 pt-3 border-t ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-100'}`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <Clock
                className={`h-3 w-3 flex-shrink-0 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
              />
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                Last Deploy
              </p>
            </div>
            <p
              className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-900'}`}
            >
              {project.lastDeployed}
            </p>
          </div>
          <div className="text-right min-w-0">
            <div className="flex items-center justify-end gap-1 mb-1">
              <Eye
                className={`h-3 w-3 flex-shrink-0 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}
              />
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                Visitors
              </p>
            </div>
            <p
              className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {project.visitors.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalanceDashboard() {
  const router = useRouter();
  const { fetchOrganizations } = useOrganizationsViewModel();
  const { setOrganizations } = useOrganizationsStore();
  const { theme } = useThemeStore();

  const handleFromGithub = async () => {
    try {
      // Fetch organizations from ViewModel
      const orgs = await fetchOrganizations();

      // Store organizations in Zustand store
      if (orgs && Array.isArray(orgs)) {
        setOrganizations(orgs);
      }

      // Navigate to projects page
      router.push('/projects');
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      // Still navigate even if fetch fails, projects page will have fallback
      router.push('/projects');
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'
      }`}
    >
      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">
          <div className="min-w-0">
            <h1
              className={`text-3xl sm:text-4xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              Dashboard
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Manage and monitor your deployments
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={`gap-2 text-sm flex items-center ${
                    theme === 'dark'
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Add New
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                }`}
              >
                <DropdownMenuItem
                  onClick={handleFromGithub}
                  className={`gap-2 cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white text-black hover:bg-gray-100 focus:bg-gray-100'
                      : 'hover:bg-gray-100 focus:bg-gray-100'
                  }`}
                >
                  <Github className="h-4 w-4" />
                  <span>From GitHub</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="">
          <DashboardStatsGrid />
        </div>

        {/* Visitors Graph */}
        <div className="mb-12">
          <ProjectedVisitorsGraph />
        </div>

        {/* Data Table */}
        <div className="mb-12">
          <DashboardDataTable />
        </div>

        {/* Empty State Message */}
        <div className="mt-8 sm:mt-12 text-center">
          <p
            className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-600'}`}
          >
            Create your first project to get started with deployment
          </p>
        </div>
      </div>
    </div>
  );
}
