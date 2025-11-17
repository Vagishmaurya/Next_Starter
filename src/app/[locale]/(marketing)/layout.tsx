/**
 * Marketing Layout
 * Layout for public pages accessible to all users
 */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  return (
    <BaseTemplate
      leftNav={(
        <>
          <li>
            <Link
              href="/"
              className="border-none text-foreground hover:text-foreground/70 transition-colors"
            >
              {t('home_link')}
            </Link>
          </li>
        </>
      )}
      rightNav={(
        <>
          <li>
            <Link
              href="/sign-in/"
              className="border-none text-foreground hover:text-foreground/70 transition-colors"
            >
              {t('sign_in_link')}
            </Link>
          </li>

          <li>
            <Link
              href="/sign-up/"
              className="border-none text-foreground hover:text-foreground/70 transition-colors"
            >
              {t('sign_up_link')}
            </Link>
          </li>

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
