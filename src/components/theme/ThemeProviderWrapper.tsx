/**
 * Componente ThemeProvider wrapper para AWS Amplify UI
 * Integra el tema personalizado con la detección de modo claro/oscuro
 * y sincroniza con las variables CSS globales del proyecto
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider as AmplifyThemeProvider } from '@aws-amplify/ui-react';
import { getTheme, type ThemeMode } from '@/lib/theme/my-custom-app-theme';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';

// Importar estilos base de Amplify UI
import '@aws-amplify/ui-react/styles.css';

// Importar CSS personalizado para sincronización de variables
import './theme-sync.css';

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Componente interno que aplica el tema de Amplify según el modo actual
 */
const AmplifyThemeAdapter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [currentMode, setCurrentMode] = useState<ThemeMode>('light');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Usar el hook solo después de montar para evitar problemas SSR
  let themeContext;
  try {
    themeContext = useTheme();
  } catch {
    // Si no hay contexto disponible, usar modo claro por defecto
    themeContext = { mode: 'light' };
  }
  useEffect(() => {
    if (mounted && themeContext && themeContext.mode) {
      setCurrentMode(themeContext.mode as ThemeMode);
    }
  }, [mounted, themeContext]);

  const currentTheme = getTheme(currentMode);

  return (
    <AmplifyThemeProvider theme={currentTheme} colorMode={currentMode}>
      {children}
    </AmplifyThemeProvider>
  );
};

/**
 * ThemeProvider wrapper principal que combina:
 * - Gestión de estado del tema (claro/oscuro)
 * - ThemeProvider de Amplify UI
 * - Sincronización con variables CSS globales
 */
const ThemeProviderWrapper: React.FC<ThemeProviderWrapperProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AmplifyThemeAdapter>
        {children}
      </AmplifyThemeAdapter>
    </ThemeProvider>
  );
};

export default ThemeProviderWrapper;
