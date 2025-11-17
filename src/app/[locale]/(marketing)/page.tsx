/**
 * Home Page
 * Public landing page accessible to all users
 * Shows welcome message and links to sign in/sign up
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function HomePage(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">{t('meta_title')}</h1>
        <p className="text-lg text-foreground/80">{t('meta_description')}</p>
      </section>

      <section className="flex gap-4">
        <Button asChild>
          <Link href="/sign-up/">Get Started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/sign-in/">Sign In</Link>
        </Button>
      </section>

      <section className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold">Features</h2>
        <ul className="space-y-2 text-foreground/80">
          <li>- Authentication with OAuth/SSO support</li>
          <li>- Role-based access control (RBAC)</li>
          <li>- Dark/Light mode theming</li>
          <li>- MVVM architecture pattern</li>
          <li>- Zustand state management</li>
          <li>- Axios API integration with interceptors</li>
        </ul>
      </section>
    </div>
  );
}
