'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@aws-amplify/ui-react';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Componente simplificado para alternar entre modos claro y oscuro
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);
  
  // Agregar verificación para el contexto del tema
  let mode = 'light';
  let toggleMode = () => {};
  try {
    const themeContext = useTheme();
    mode = themeContext.mode;
    toggleMode = themeContext.toggleMode;
  } catch {
    console.warn('Theme context is not available in ThemeToggle. Defaulting to light mode.');
  }

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuración de tamaños
  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 26,
  };

  // Configuración de colores basados en el modo
  const iconColor = mode === 'light' ? '#F59E0B' : '#93C5FD'; // amber-500 / blue-300
  
  // No renderizar nada durante la hidratación para evitar desajustes
  if (!mounted) return null;

  // Función para manejar el clic y quitar el foco
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleMode();
    // Quitar el foco después del clic
    e.currentTarget.blur();
  };

  return (
    <Button
      onClick={handleClick}
      variation="link"
      ariaLabel={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}
      padding="0.5rem"
      borderRadius="50%"
      backgroundColor="transparent"
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        minWidth: 'auto',
        minHeight: 'auto',
        outline: 'none'
      }}
    >
      {mode === 'light' ? (
        <Sun size={iconSizes[size]} color={iconColor} />
      ) : (
        <Moon size={iconSizes[size]} color={iconColor} />
      )}
    </Button>
  );
};
