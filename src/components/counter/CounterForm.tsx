'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useCounterViewModel } from '@/viewmodels/CounterViewModel';

const counterSchema = z.object({
  increment: z.number().int().min(1).max(100),
});

/**
 * Counter form component using MVVM pattern
 * Handles user input and delegates to ViewModel
 */
export const CounterForm = () => {
  const t = useTranslations('CounterForm');
  const { incrementCounter, isLoading, error } = useCounterViewModel();
  
  const form = useForm({
    resolver: zodResolver(counterSchema),
    defaultValues: {
      increment: 1,
    },
  });

  const handleIncrement = form.handleSubmit(async (data) => {
    await incrementCounter(data.increment);
    form.reset();
  });

  return (
    <form onSubmit={handleIncrement}>
      <p>{t('presentation')}</p>
      <div>
        <label className="text-sm font-bold text-gray-700" htmlFor="increment">
          {t('label_increment')}
          <input
            id="increment"
            type="number"
            className="ml-2 w-32 appearance-none rounded-sm border border-gray-200 px-2 py-1 text-sm leading-tight text-gray-700 focus:ring-3 focus:ring-blue-300/50 focus:outline-hidden"
            {...form.register('increment', { valueAsNumber: true })}
          />
        </label>

        {form.formState.errors.increment && (
          <div className="my-2 text-xs text-red-500 italic">
            {t('error_increment_range')}
          </div>
        )}
      </div>

      {error && (
        <div className="my-2 text-xs text-red-500 italic">
          {error}
        </div>
      )}

      <div className="mt-2">
        <button
          className="rounded-sm bg-blue-500 px-5 py-1 font-bold text-white hover:bg-blue-600 focus:ring-3 focus:ring-blue-300/50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          type="submit"
          disabled={form.formState.isSubmitting || isLoading}
        >
          {t('button_increment')}
        </button>
      </div>
    </form>
  );
};
