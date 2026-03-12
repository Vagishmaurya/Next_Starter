'use client';

import { useEffect, useRef, useState } from 'react';

type UseScrollProgressOptions = {
  externalRef?: React.RefObject<HTMLDivElement | null>;
};

/**
 * Returns a scroll progress value (0 to 1) based on how far
 * the element has been scrolled past.
 * 0 = element is in its natural position (not scrolled)
 * 1 = element has been fully scrolled past
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}) {
  const { externalRef } = options;
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = externalRef || internalRef;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = element.getBoundingClientRect();
          const elementHeight = element.offsetHeight;

          // 0 = top of element is at top of viewport (initial state for Hero)
          // 1 = top of element is elementHeight pixels above viewport (scrolled away)
          const raw = -rect.top / elementHeight;
          setProgress(Math.max(0, Math.min(1, raw)));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref, progress };
}
