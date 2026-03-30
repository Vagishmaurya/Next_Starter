'use client';

import {
  Activity,
  BookOpen,
  GitBranch,
  GitCommit,
  LayoutDashboard,
  Package,
  PlayCircle,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useThemeStore } from '@/store/themeStore';

export default function DocsPage() {
  const { theme } = useThemeStore();

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
            Welcome to the Calance Workflow Automation platform. This tool allows you to manage
            GitHub workflows, view run details, and handle organization-level packages efficiently.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Link href="/projects" className="block">
              <Card
                className={`p-4 hover:border-purple-500 transition-colors cursor-pointer ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}`}
              >
                <h3
                  className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  Explore Projects
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Browse your organization's repositories and their workflow status.
                </p>
              </Card>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'projects',
      title: 'Projects & Repositories',
      icon: LayoutDashboard,
      content: (
        <div className="space-y-4">
          <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
            The <strong>Projects</strong> page is your central hub. It lists all repositories within
            your organization that have GitHub Actions workflows configured.
          </p>
          <ul
            className={`list-disc list-inside space-y-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
          >
            <li>Select a repository to view its branches and workflows.</li>
            <li>
              Use the <strong>Organization Selector</strong> in the header to switch contexts.
            </li>
            <li>
              Click <strong>All Packages</strong> to view organization-wide packages.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'branches',
      title: 'Branch Management',
      icon: GitBranch,
      content: (
        <div className="space-y-4">
          <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
            Inside a project, you can manage specific branches. The default view shows the{' '}
            <strong>Commits</strong> history for the selected branch.
          </p>
          <div
            className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-gray-50 border border-gray-200'}`}
          >
            <h4
              className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              <GitCommit className="h-4 w-4" /> Commits View
            </h4>
            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              View the latest commits, their authors, and associated tags. You can create new tags
              directly from a commit.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'workflows',
      title: 'Workflows',
      icon: PlayCircle,
      content: (
        <div className="space-y-4">
          <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
            Automate your development process with GitHub Actions workflows.
          </p>
          <ul
            className={`list-disc list-inside space-y-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
          >
            <li>
              <strong>Create Workflow:</strong> Use the "Create Workflow" button to set up a new
              automation pipeline.
            </li>
            <li>
              <strong>Edit Workflow:</strong> Modify existing workflow files directly from the UI.
            </li>
            <li>
              <strong>Run Workflow:</strong> Manually trigger workflows with custom inputs.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'actions',
      title: 'Actions & Logs',
      icon: Activity,
      content: (
        <div className="space-y-4">
          <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
            Monitor the execution of your workflows in real-time.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div
              className={`p-3 rounded border ${theme === 'dark' ? 'border-green-500/20 bg-green-500/10' : 'border-green-200 bg-green-50'}`}
            >
              <span
                className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}
              >
                Success
              </span>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Workflow completed successfully.
              </p>
            </div>
            <div
              className={`p-3 rounded border ${theme === 'dark' ? 'border-red-500/20 bg-red-500/10' : 'border-red-200 bg-red-50'}`}
            >
              <span
                className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}
              >
                Failure
              </span>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Workflow failed. Check logs for details.
              </p>
            </div>
          </div>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            Click on any workflow run to see detailed logs, job steps, and execution times.
          </p>
        </div>
      ),
    },
    {
      id: 'packages',
      title: 'Packages',
      icon: Package,
      content: (
        <div className="space-y-4">
          <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
            Manage packages associated with your organization or specific repositories.
          </p>
          <div
            className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}
          >
            <Shield className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Use the <strong>Org Packages</strong> button in a project view to see all packages
              belonging to the organization.
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="hidden md:block w-64 shrink-0">
            <div
              className={`sticky top-24 p-4 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}`}
            >
              <h2
                className={`font-bold mb-4 px-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                Contents
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                      theme === 'dark'
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="mb-8">
              <h1
                className={`text-4xl font-extrabold tracking-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                Documentation
              </h1>
              <p className={`text-xl ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Everything you need to know about using Calance.
              </p>
            </div>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <Card
                  className={`overflow-hidden transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`p-6 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-purple-100 text-purple-600'}`}
                      >
                        <section.icon className="h-6 w-6" />
                      </div>
                      <h2
                        className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                      >
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">{section.content}</div>
                </Card>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
