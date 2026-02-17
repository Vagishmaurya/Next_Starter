'use client';

import type { Package } from '@/lib/api/packages.service';
import { formatDistanceToNow } from 'date-fns';
import {
  Box,
  Building2,
  CalendarDays,
  Container,
  Download,
  ExternalLink,
  Lock,
  Package as PackageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { packagesService } from '@/lib/api/packages.service';
import { usePackagesStore } from '@/store/packagesStore';
import { useThemeStore } from '@/store/themeStore';

type OrganizationPackagesModalProps = {
  organization?: string;
};

export function OrganizationPackagesModal({ organization }: OrganizationPackagesModalProps) {
  const { theme } = useThemeStore();
  const {
    orgPackages,
    orgPackagesLoading,
    orgPackagesError,
    showOrgPackagesModal,
    currentPackageType,
    selectedOrganization,
    setOrgPackages,
    setOrgPackagesLoading,
    setOrgPackagesError,
    setShowOrgPackagesModal,
    setCurrentPackageType,
    setSelectedOrganization,
  } = usePackagesStore();

  const fetchOrgPackages = useCallback(async () => {
    const orgToUse = organization || selectedOrganization;
    if (!orgToUse) {
      return;
    }

    try {
      setOrgPackagesLoading(true);
      setOrgPackagesError(null);

      const response = await packagesService.fetchOrganizationPackages(
        orgToUse,
        currentPackageType
      );
      setOrgPackages(response.data.packages);
    } catch (error) {
      setOrgPackagesError(
        error instanceof Error ? error.message : 'Failed to fetch organization packages'
      );
    } finally {
      setOrgPackagesLoading(false);
    }
  }, [
    organization,
    selectedOrganization,
    currentPackageType,
    setOrgPackages,
    setOrgPackagesLoading,
    setOrgPackagesError,
  ]);

  useEffect(() => {
    if (organization && organization !== selectedOrganization) {
      setSelectedOrganization(organization);
    }
  }, [organization, selectedOrganization, setSelectedOrganization]);

  useEffect(() => {
    if (showOrgPackagesModal && (organization || selectedOrganization)) {
      fetchOrgPackages();
    }
  }, [
    showOrgPackagesModal,
    organization,
    selectedOrganization,
    currentPackageType,
    fetchOrgPackages,
  ]);

  const packageTypeOptions = [
    { value: 'container', label: 'Container', icon: Container },
    { value: 'npm', label: 'NPM', icon: PackageIcon },
    { value: 'maven', label: 'Maven', icon: Box },
    { value: 'nuget', label: 'NuGet', icon: PackageIcon },
  ];

  const getPackageTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'container':
        return theme === 'dark'
          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          : 'bg-blue-50 text-blue-600 border-blue-200';
      case 'npm':
        return theme === 'dark'
          ? 'bg-green-500/10 text-green-400 border-green-500/20'
          : 'bg-green-50 text-green-600 border-green-200';
      case 'maven':
        return theme === 'dark'
          ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
          : 'bg-orange-50 text-orange-600 border-orange-200';
      case 'nuget':
        return theme === 'dark'
          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
          : 'bg-purple-50 text-purple-600 border-purple-200';
      default:
        return theme === 'dark'
          ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
          : 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const currentOrg = organization || selectedOrganization;

  return (
    <Dialog open={showOrgPackagesModal} onOpenChange={setShowOrgPackagesModal}>
      <DialogContent
        className={`max-w-4xl max-h-[80vh] overflow-hidden ${
          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-300'
        }`}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle
            className={`text-xl font-bold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            <Building2 className="h-5 w-5" />
            {currentOrg}'s Packages
            {orgPackages.length > 0 && (
              <span
                className={`text-sm font-normal ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                }`}
              >
                ({orgPackages.length} {currentPackageType} packages)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Package Type Filter */}
        <div className="mb-4">
          <label
            htmlFor="package-type-select"
            className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}
          >
            Package Type
          </label>
          <Select value={currentPackageType} onValueChange={setCurrentPackageType}>
            <SelectTrigger id="package-type-select" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {packageTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-180px)] pr-2">
          {orgPackagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                  Loading {currentPackageType} packages...
                </span>
              </div>
            </div>
          ) : orgPackagesError ? (
            <div
              className={`text-center py-8 px-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}
            >
              <p className="mb-4">{orgPackagesError}</p>
              <Button
                onClick={fetchOrgPackages}
                variant="outline"
                size="sm"
                className={
                  theme === 'dark'
                    ? 'border-red-500/50 text-red-400'
                    : 'border-red-300 text-red-600'
                }
              >
                Retry
              </Button>
            </div>
          ) : orgPackages.length === 0 ? (
            <div
              className={`text-center py-12 px-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-zinc-800/50 border border-zinc-700'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <Container
                className={`h-12 w-12 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                }`}
              />
              <h3
                className={`text-lg font-medium mb-2 ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                }`}
              >
                No {currentPackageType} packages found
              </h3>
              <p className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>
                {currentOrg} doesn't have any {currentPackageType} packages yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orgPackages.map((pkg: Package) => (
                <Card
                  key={pkg.id}
                  className={`p-4 transition-all duration-200 hover:shadow-lg ${
                    theme === 'dark'
                      ? 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className={`text-lg font-semibold truncate ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {pkg.name}
                        </h3>
                        <Badge className={`text-xs ${getPackageTypeColor(pkg.package_type)}`}>
                          {pkg.package_type}
                        </Badge>
                        {pkg.visibility === 'private' && (
                          <Lock
                            className={`h-4 w-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}
                          />
                        )}
                      </div>

                      {pkg.description && (
                        <p
                          className={`text-sm mb-3 line-clamp-2 ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                          }`}
                        >
                          {pkg.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs">
                        <div
                          className={`flex items-center gap-1 ${
                            theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                          }`}
                        >
                          <Download className="h-3 w-3" />
                          <span>{pkg.version_count} versions</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${
                            theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                          }`}
                        >
                          <CalendarDays className="h-3 w-3" />
                          <span>
                            Updated{' '}
                            {formatDistanceToNow(new Date(pkg.updated_at), { addSuffix: true })}
                          </span>
                        </div>

                        {pkg.repository && (
                          <div
                            className={`flex items-center gap-1 ${
                              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                            }`}
                          >
                            <Box className="h-3 w-3" />
                            <span>{pkg.repository.full_name}</span>
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-1 ${
                            theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                          }`}
                        >
                          <Building2 className="h-3 w-3" />
                          <span>{pkg.owner.login}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={`${
                          theme === 'dark'
                            ? 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Link href={pkg.html_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
