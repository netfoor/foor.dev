/**
 * Tema personalizado simplificado para AWS Amplify UI Components
 * Compatible con @aws-amplify/ui-react v6.11.2
 */

import { createTheme } from '@aws-amplify/ui-react';

export type ThemeMode = 'light' | 'dark';

// Tema simple para modo claro
const lightTheme = createTheme({
  name: 'my-custom-app-theme-light',
  tokens: {
    colors: {
      brand: {
        primary: {
          '10': '#f0f9ff',
          '20': '#e0f2fe', 
          '40': '#38bdf8',
          '60': '#0284c7',
          '100': '#075985'
        }
      }
    }
  }
});

// Tema simple para modo oscuro
const darkTheme = createTheme({
  name: 'my-custom-app-theme-dark',
  tokens: {
    colors: {
      brand: {
        primary: {
          '10': '#075985',
          '20': '#0284c7', 
          '40': '#38bdf8',
          '60': '#7dd3fc',
          '100': '#f0f9ff'
        }
      }
    }
  }
});

/**
 * Obtiene el tema basado en el modo especificado
 */
export const getTheme = (mode: ThemeMode) => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Hook simplificado para obtener solo el modo actual del tema
 */
export const useThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  
  // Detectar el modo desde el DOM o localStorage
  const savedMode = localStorage.getItem('amplify-ui-theme-mode') as ThemeMode;
  if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
    return savedMode;
  }
  
  // Fallback a preferencia del sistema
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default getTheme;
