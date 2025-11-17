'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Env } from '@/libs/Env';

export const CurrentCount = () => {
  const t = useTranslations('CurrentCount');
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      if (!Env.NEXT_PUBLIC_API_URL) {
        setError('API URL not configured');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${Env.NEXT_PUBLIC_API_URL}/api/counter`);
        const data = await response.json();
        setCount(data.count ?? 0);
      } catch (err) {
        console.error('Failed to fetch counter:', err);
        setError('Failed to load counter');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();
  }, []);

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      {t('count', { count })}
    </div>
  );
};
