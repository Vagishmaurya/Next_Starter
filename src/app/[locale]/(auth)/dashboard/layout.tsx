/**
 * Dashboard Layout
 * Protected layout for authenticated users
 * Includes navigation for dashboard pages
 */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { useAuth } from '@/hooks/useAuth';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
    <BaseTemplate
      leftNav={(
        <>
          <li>
            <Link
              href="/dashboard/"
              className="border-none text-foreground hover:text-foreground/70 transition-colors"
            >
              {t('dashboard_link')}
            </Link>
          </li>
        </>
      )}
      rightNav={(
        <>
          <li>
            <ThemeToggle />
          </li>

          <li>
            <LocaleSwitcher />
          </li>
        </>
      )}
    >
      <div className="py-5 text-xl [&_p]:my-6">{props.children}</div>
    </BaseTemplate>
  );
}
