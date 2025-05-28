//This component grant context to use ThemeProvider from Amplify This is the father
'use client';

import { ThemeProvider, Theme } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
  colorMode: 'light' | 'dark';
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAmplifyTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAmplifyTheme must be used inside AmplifyWrapper');
  return context;
};

export function AmplifyWrapper({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Update the debug info display
    const updateDebugInfo = () => {
      const debugElement = document.getElementById('theme-debug');
      if (debugElement) {
        debugElement.textContent = `Theme: ${colorMode} | HTML classes: ${document.documentElement.className} | data-theme: ${document.documentElement.getAttribute('data-theme')}`;
      }
    };

    // Debug logs for initial theme setup
    console.log('AmplifyWrapper: Initializing theme');
    
    const saved = localStorage.getItem('theme');
    console.log('AmplifyWrapper: Saved theme from localStorage:', saved);
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('AmplifyWrapper: System prefers dark mode:', prefersDark);
    
    const mode = saved === 'dark' || (!saved && prefersDark) ? 'dark' : 'light';
    console.log('AmplifyWrapper: Setting initial theme mode to:', mode);
    
    setColorMode(mode);
    
    // Apply theme to document and body
    document.documentElement.setAttribute('data-theme', mode);
    document.body.setAttribute('data-amplify-color-mode', mode);
    document.body.style.setProperty('--amplify-colors-background-primary', mode === 'dark' ? '#1a1a1a' : '#ffffff');
    document.body.style.setProperty('--amplify-colors-font-primary', mode === 'dark' ? '#ffffff' : '#000000');
    
    console.log('AmplifyWrapper: Set data-theme attribute to:', mode);
    
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('amplify-dark-mode');
      console.log('AmplifyWrapper: Added dark class to HTML element');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('amplify-dark-mode');
      console.log('AmplifyWrapper: Removed dark class from HTML element');
    }
    
    // Log current document classes for debugging
    console.log('AmplifyWrapper: HTML element classes:', document.documentElement.className);
    
    updateDebugInfo();
  }, [colorMode]);

  const toggleTheme = () => {
    const newMode = colorMode === 'dark' ? 'light' : 'dark';
    console.log('AmplifyWrapper: Toggle theme from', colorMode, 'to', newMode);
    
    setColorMode(newMode);
    localStorage.setItem('theme', newMode);
    console.log('AmplifyWrapper: Saved new theme to localStorage:', newMode);
    
    // Apply theme to document and body
    document.documentElement.setAttribute('data-theme', newMode);
    document.body.setAttribute('data-amplify-color-mode', newMode);
    document.body.style.setProperty('--amplify-colors-background-primary', newMode === 'dark' ? '#1a1a1a' : '#ffffff');
    document.body.style.setProperty('--amplify-colors-font-primary', newMode === 'dark' ? '#ffffff' : '#000000');
    
    console.log('AmplifyWrapper: Set data-theme attribute to:', newMode);
    
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('amplify-dark-mode');
      console.log('AmplifyWrapper: Added dark class to HTML element');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('amplify-dark-mode');
      console.log('AmplifyWrapper: Removed dark class from HTML element');
    }
    
    // Log current document classes for debugging
    console.log('AmplifyWrapper: HTML element classes after toggle:', document.documentElement.className);
    
    // Update debug info
    const debugElement = document.getElementById('theme-debug');
    if (debugElement) {
      debugElement.textContent = `Theme: ${newMode} | HTML classes: ${document.documentElement.className} | data-theme: ${document.documentElement.getAttribute('data-theme')}`;
    }
  };

  const theme: Theme = {
    name: 'amplify-theme',
    overrides: [
      {
        colorMode,
        tokens: {
          colors: {
            background: {
              primary: colorMode === 'dark' ? '#1a1a1a' : '#ffffff',
              secondary: colorMode === 'dark' ? '#2a2a2a' : '#f5f5f5',
              tertiary: colorMode === 'dark' ? '#333333' : '#eeeeee',
            },
            font: {
              primary: colorMode === 'dark' ? '#ffffff' : '#000000',
              secondary: colorMode === 'dark' ? '#a0a0a0' : '#666666',
              interactive: colorMode === 'dark' ? '#5bafdf' : '#007eb9',
            },
            brand: {
              primary: {
                10: colorMode === 'dark' ? '#D9F2FF' : '#C4DBFF',
                20: colorMode === 'dark' ? '#B5E6FF' : '#A8CAFF',
                40: colorMode === 'dark' ? '#8DD9FF' : '#80B0FF',
                60: colorMode === 'dark' ? '#66CCFF' : '#5B95FF',
                80: colorMode === 'dark' ? '#40BFFF' : '#357BFF',
                90: colorMode === 'dark' ? '#26B5FF' : '#1B6EFF',
                100: colorMode === 'dark' ? '#0CAFFF' : '#0162FF',
              }
            }
          }
        }
      },
    ],
  };
  
  console.log('AmplifyWrapper: Current theme configuration:', {
    colorMode,
    primaryBackground: colorMode === 'dark' ? '#1a1a1a' : '#ffffff',
    secondaryBackground: colorMode === 'dark' ? '#2a2a2a' : '#f5f5f5',
  });

  return (
    <ThemeContext.Provider value={{ colorMode, toggleTheme }}>
      <div className={colorMode === 'dark' ? 'dark' : ''} style={{ minHeight: '100vh' }}>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </div>
    </ThemeContext.Provider>
  );
}
