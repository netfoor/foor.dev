/**
 * Hook personalizado para gestión de tema (modo claro/oscuro)
 * Proporciona funcionalidad para cambiar entre temas y persistir la preferencia del usuario
 */

'use client';

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { ThemeMode } from '@/lib/theme/my-custom-app-theme';

// Claves para localStorage
const THEME_STORAGE_KEY = 'amplify-ui-theme-mode';
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

// Contexto para el tema
interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isSystemMode: boolean;
  setSystemMode: (useSystem: boolean) => void;
  systemPreference: ThemeMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook para usar el contexto de tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Retornar valores por defecto en lugar de lanzar error
    return {
      mode: 'light',
      setMode: () => {},
      toggleMode: () => {},
      isSystemMode: false,
      setSystemMode: () => {},
      systemPreference: 'light'
    };
  }
  return context;
};

// Provider para el contexto de tema
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado para el modo del tema
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isSystemMode, setIsSystemMode] = useState(false);
  const [systemPreference, setSystemPreference] = useState<ThemeMode>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Detectar preferencia del sistema
  const detectSystemTheme = useCallback((): ThemeMode => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
  }, []);

  // Cargar configuración guardada
  const loadSavedTheme = useCallback((): { mode: ThemeMode; isSystem: boolean } => {
    if (typeof window === 'undefined') {
      return { mode: 'light', isSystem: false };
    }

    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        return {
          mode: config.mode || 'light',
          isSystem: config.isSystem || false,
        };
      }
    } catch (error) {
      console.warn('Error loading saved theme:', error);
    }

    return { mode: 'light', isSystem: false };
  }, []);

  // Guardar configuración
  const saveThemeConfig = useCallback((mode: ThemeMode, isSystem: boolean) => {
    if (typeof window === 'undefined') return;

    try {
      const config = { mode, isSystem };
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Error saving theme config:', error);
    }
  }, []);

  // Aplicar tema al documento
  const applyThemeToDocument = useCallback((themeMode: ThemeMode) => {
    if (typeof window === 'undefined') return;

    // Actualizar atributo data-theme en el elemento html
    document.documentElement.setAttribute('data-theme', themeMode);
    
    // Actualizar clase para compatibilidad con Tailwind CSS dark mode
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Actualizar meta theme-color para mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeMode === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, []);

  // Establecer modo del tema
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    setIsSystemMode(false);
    applyThemeToDocument(newMode);
    saveThemeConfig(newMode, false);
  }, [applyThemeToDocument, saveThemeConfig]);

  // Alternar entre modos
  const toggleMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  }, [mode, setMode]);

  // Establecer si usar modo del sistema
  const setSystemMode = useCallback((useSystem: boolean) => {
    setIsSystemMode(useSystem);
    if (useSystem) {
      const currentSystemTheme = detectSystemTheme();
      setModeState(currentSystemTheme);
      applyThemeToDocument(currentSystemTheme);
      saveThemeConfig(currentSystemTheme, true);
    }
  }, [detectSystemTheme, applyThemeToDocument, saveThemeConfig]);

  // Efecto para inicialización (solo en cliente)
  useEffect(() => {
    const currentSystemTheme = detectSystemTheme();
    setSystemPreference(currentSystemTheme);

    const { mode: savedMode, isSystem: savedIsSystem } = loadSavedTheme();

    if (savedIsSystem) {
      setIsSystemMode(true);
      setModeState(currentSystemTheme);
      applyThemeToDocument(currentSystemTheme);
    } else {
      setModeState(savedMode);
      applyThemeToDocument(savedMode);
    }

    setIsHydrated(true);
  }, [detectSystemTheme, loadSavedTheme, applyThemeToDocument]);

  // Efecto para escuchar cambios en el tema del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemPreference(newSystemTheme);
      
      if (isSystemMode) {
        setModeState(newSystemTheme);
        applyThemeToDocument(newSystemTheme);
        saveThemeConfig(newSystemTheme, true);
      }
    };

    // Agregar listener
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [isSystemMode, applyThemeToDocument, saveThemeConfig]);  // No renderizar hasta que esté hidratado para evitar mismatches
  if (!isHydrated) {
    return React.createElement('div', null, children);
  }

  const contextValue: ThemeContextType = {
    mode,
    setMode,
    toggleMode,
    isSystemMode,
    setSystemMode,
    systemPreference,
  };
  return React.createElement(
    ThemeContext.Provider,
    { value: contextValue },
    children
  );
};

// Hook simplificado solo para obtener el modo actual
export const useThemeMode = (): ThemeMode => {
  const { mode } = useTheme();
  return mode;
};

// Hook para verificar si es modo oscuro
export const useIsDarkMode = (): boolean => {
  const { mode } = useTheme();
  return mode === 'dark';
};
