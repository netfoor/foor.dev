'use client';

import { ThemeProvider, Theme } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useEffect, useState } from 'react';

export function AmplifyWrapper({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  // Initialize theme and sync with document class
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setColorMode(isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Listen for theme changes from ThemeToggle component
  useEffect(() => {
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('theme');
      if (currentTheme === 'dark') {
        setColorMode('dark');
      } else if (currentTheme === 'light') {
        setColorMode('light');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const theme: Theme = {
    name: 'my-theme',
    overrides: [
      {
        colorMode,
        tokens: {
          colors: {
            background: {
              primary: colorMode === 'dark' ? '#0a0a0a' : '#ffffff',
            },
            font: {
              primary: colorMode === 'dark' ? '#ededed' : '#171717',
            },
          },
        },
      }
    ]
  };

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}