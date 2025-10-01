/**
 * Componente selector de modo de tema (claro/oscuro)
 * Permite al usuario alternar entre modos y usar preferencia del sistema
 * Integrado con persistencia automática en localStorage
 */

'use client';

import React, { useState } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeMode } from '@/lib/theme/my-custom-app-theme';

interface ThemeSelectorProps {
  variant?: 'dropdown' | 'toggle' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

/**
 * Componente principal del selector de tema
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = 'dropdown',
  size = 'md',
  showLabels = true,
  className = '',
}) => {
  const { mode, setMode, toggleMode, isSystemMode, setSystemMode, systemPreference } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Configuración de tamaños
  const sizeClasses = {
    sm: 'text-sm p-2',
    md: 'text-base p-2.5',
    lg: 'text-lg p-3',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  // Obtener icono según el modo
  const getIcon = (themeMode: ThemeMode | 'system', size: number) => {
    switch (themeMode) {
      case 'light':
        return <Sun size={size} />;
      case 'dark':
        return <Moon size={size} />;
      case 'system':
        return <Monitor size={size} />;
      default:
        return <Sun size={size} />;
    }
  };

  // Obtener etiqueta según el modo
  const getLabel = (themeMode: ThemeMode | 'system') => {
    switch (themeMode) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Oscuro';
      case 'system':
        return 'Sistema';
      default:
        return 'Claro';
    }
  };

  // Manejar selección de modo
  const handleModeSelect = (selectedMode: ThemeMode | 'system') => {
    if (selectedMode === 'system') {
      setSystemMode(true);
    } else {
      setMode(selectedMode);
    }
    setIsOpen(false);
  };

  // Variante toggle (simple)
  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleMode}
        className={`
          ${sizeClasses[size]}
          ${className}
          inline-flex items-center justify-center
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600
          rounded-lg shadow-sm
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200
        `}
        title={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}
        aria-label={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}
      >
        {getIcon(mode, iconSizes[size])}
        {showLabels && (
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            {getLabel(mode)}
          </span>
        )}
      </button>
    );
  }

  // Variante buttons (todos los modos visibles)
  if (variant === 'buttons') {
    const currentMode = isSystemMode ? 'system' : mode;
    
    return (
      <div className={`inline-flex rounded-lg border border-gray-300 dark:border-gray-600 ${className}`}>
        {(['light', 'dark', 'system'] as const).map((themeMode) => {
          const isActive = currentMode === themeMode;
          
          return (
            <button
              key={themeMode}
              onClick={() => handleModeSelect(themeMode)}
              className={`
                ${sizeClasses[size]}
                inline-flex items-center justify-center
                first:rounded-l-lg last:rounded-r-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
              title={`Cambiar a modo ${getLabel(themeMode)}`}
              aria-label={`Cambiar a modo ${getLabel(themeMode)}`}
              aria-pressed={isActive}
            >
              {getIcon(themeMode, iconSizes[size])}
              {showLabels && (
                <span className="ml-1.5">
                  {getLabel(themeMode)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Variante dropdown (por defecto)
  const currentDisplayMode = isSystemMode ? 'system' : mode;
  
  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          inline-flex items-center justify-center
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600
          rounded-lg shadow-sm
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200
          min-w-[120px]
        `}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Seleccionar modo de tema"
      >
        {getIcon(currentDisplayMode, iconSizes[size])}
        {showLabels && (
          <span className="ml-2 flex-1 text-left text-gray-700 dark:text-gray-300">
            {getLabel(currentDisplayMode)}
          </span>
        )}
        <svg
          className={`ml-2 h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar el dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div
            className="
              absolute right-0 z-20 mt-2 w-48
              bg-white dark:bg-gray-800 
              border border-gray-300 dark:border-gray-600
              rounded-lg shadow-lg
              divide-y divide-gray-100 dark:divide-gray-700
              focus:outline-none
            "
            role="menu"
          >
            {(['light', 'dark', 'system'] as const).map((themeMode) => {
              const isActive = currentDisplayMode === themeMode;
              
              return (
                <button
                  key={themeMode}
                  onClick={() => handleModeSelect(themeMode)}
                  className={`
                    w-full px-4 py-3 text-left
                    inline-flex items-center
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none
                    first:rounded-t-lg last:rounded-b-lg
                    transition-colors duration-150
                    ${isActive 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}
                  role="menuitem"
                  aria-current={isActive ? 'true' : 'false'}
                >
                  {getIcon(themeMode, 16)}
                  <span className="ml-3 flex-1">
                    {getLabel(themeMode)}
                    {themeMode === 'system' && (
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                        ({getLabel(systemPreference)})
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <Check size={16} className="text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Componente compacto para espacios reducidos
 */
export const CompactThemeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <ThemeSelector
      variant="toggle"
      size="sm"
      showLabels={false}
      className={className}
    />
  );
};

/**
 * Componente para mostrar el modo actual (solo lectura)
 */
export const ThemeDisplay: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { mode, isSystemMode, systemPreference } = useTheme();
  const displayMode = isSystemMode ? 'system' : mode;
  
  return (
    <div className={`inline-flex items-center text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {displayMode === 'light' && <Sun size={16} />}
      {displayMode === 'dark' && <Moon size={16} />}
      {displayMode === 'system' && <Monitor size={16} />}
      <span className="ml-2">
        Modo {displayMode === 'light' ? 'claro' : displayMode === 'dark' ? 'oscuro' : 'sistema'}
        {isSystemMode && (
          <span className="ml-1 text-xs">
            ({systemPreference === 'light' ? 'claro' : 'oscuro'})
          </span>
        )}
      </span>
    </div>
  );
};

export default ThemeSelector;
