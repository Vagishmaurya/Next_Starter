'use client';

import { useEffect, useRef, useState } from 'react';

type UseInViewOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  externalRef?: React.RefObject<HTMLDivElement | null>;
};

export function useInView(options: UseInViewOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px', once = true, externalRef } = options;
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = externalRef || internalRef;
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isInView };
}
