import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/useAppStore';

type ThemeType = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemeType>('light');
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  useEffect(() => {
    const newTheme = isDarkMode ? 'dark' : 'light';
    setThemeState(newTheme);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return { theme, toggle, isDarkMode };
};
