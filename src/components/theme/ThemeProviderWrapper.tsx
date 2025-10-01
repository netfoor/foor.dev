/**
 * Componente ThemeProvider wrapper para AWS Amplify UI
 * Integra el tema personalizado con la detección de modo claro/oscuro
 * Sin componentes intermedios para evitar problemas de hidratación
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider as AmplifyThemeProvider } from '@aws-amplify/ui-react';
import { getTheme, type ThemeMode } from '@/lib/theme/my-custom-app-theme';
import { ThemeProvider } from '@/hooks/useTheme';

// Importar estilos base de Amplify UI
import '@aws-amplify/ui-react/styles.css';

// Importar CSS personalizado para sincronización de variables
import './theme-sync.css';

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider wrapper simplificado que evita problemas de hidratación
 * Renderiza con tema por defecto hasta que el sistema esté listo
 */
const ThemeProviderWrapper: React.FC<ThemeProviderWrapperProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Durante la hidratación, usar tema por defecto para evitar mismatches
  if (!mounted) {
    const defaultTheme = getTheme('light');
    return (
      <ThemeProvider>
        <AmplifyThemeProvider theme={defaultTheme} colorMode="light">
          {children}
        </AmplifyThemeProvider>
      </ThemeProvider>
    );
  }

  // Después de montar, permitir que ThemeProvider gestione todo
  return (
    <ThemeProvider>
      <AmplifyThemeProvider theme={getTheme('light')} colorMode="light">
        {children}
      </AmplifyThemeProvider>
    </ThemeProvider>
  );
};

export default ThemeProviderWrapper;
