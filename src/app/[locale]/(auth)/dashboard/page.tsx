/**
 * Admin Dashboard Page
 * Protected route - only accessible to authenticated users
 * Role-based content display
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdminDashboardContent } from '@/components/dashboard/AdminDashboardContent';

type IDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IDashboardPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function DashboardPage(props: IDashboardPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Dashboard' });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('meta_title')}</h1>
      <p className="text-foreground/70">Welcome to your dashboard. This is a protected route.</p>
      
      <AdminDashboardContent />
    </div>
  );
}
