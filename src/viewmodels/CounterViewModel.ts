'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api/client';

/**
 * ViewModel for Counter page
 * Manages counter state and API calls
 */
export const useCounterViewModel = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incrementCounter = useCallback(async (increment: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.put('/counter', { increment });
      setCount(response.data.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to increment counter';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/counter');
      setCount(response.data.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch counter';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    count,
    isLoading,
    error,
    incrementCounter,
    fetchCount,
  };
};
