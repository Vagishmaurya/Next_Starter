'use client';

import { useTranslations } from 'next-intl';
import { useCounterViewModel } from '@/viewmodels/CounterViewModel';
import { useEffect } from 'react';

/**
 * Display current counter value
 */
export const CurrentCount = () => {
  const t = useTranslations('CurrentCount');
  const { count, isLoading, fetchCount } = useCounterViewModel();

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return (
    <div>
      <h2 className="text-2xl font-bold">
        {t('display')}
        {' '}
        <span className="text-blue-500">{count}</span>
      </h2>
      {isLoading && <p className="text-sm text-gray-600">{t('loading')}</p>}
    </div>
  );
};
