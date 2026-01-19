import { useCallback, useState } from 'react';
import { useAppStore } from '@/lib/stores/useAppStore';

type UseApiOptions = {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  // added
};

export const useApi = () => {
  const [error, setError] = useState<Error | null>(null);
  const setLoading = useAppStore((state) => state.setLoading);

  const request = useCallback(
    async (apiCall: () => Promise<any>, options?: UseApiOptions) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        options?.onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return { request, error };
};
