/**
 * PostHog Analytics Provider (Optional)
 * Conditionally provides PostHog analytics if configured
 * Can be disabled by not setting NEXT_PUBLIC_POSTHOG_KEY
 */

'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { Env } from '@/libs/Env';

export const PostHogProvider = (props: { children: React.ReactNode }) => {
  useEffect(() => {
    if (Env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(Env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: Env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: true,
      });
    }
  }, []);

  if (!Env.NEXT_PUBLIC_POSTHOG_KEY) {
    return props.children;
  }

  return (
    <PHProvider client={posthog}>
      {props.children}
    </PHProvider>
  );
};
