import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/libs/I18nRouting';
import { AppConfig } from '@/utils/AppConfig';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div>
      {props.children}
    </div>
  );
}
