/**
 * Hello Component
 * Welcome message for authenticated users
 * Displays user email and personalized greeting
 */

import { getTranslations } from 'next-intl/server';
import { useAuth } from '@/hooks/useAuth';

export const Hello = async () => {
  const t = await getTranslations('Dashboard');

  return (
    <>
      <p>
        {t('hello_message')}
      </p>
      <p>
        {t('welcome_to_app')}
      </p>
    </>
  );
};
