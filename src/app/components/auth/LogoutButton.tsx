'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/lib/i18n/client';

interface LogoutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

/**
 * Botón para cerrar sesión
 */
export function LogoutButton({
  className = '',
  variant = 'secondary',
  fullWidth = false,
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();
  const { t } = useTranslation('auth');
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };
  
  // Estilo base del botón
  let buttonStyle = 'px-4 py-2 rounded-md transition-colors font-medium flex items-center justify-center';
  
  // Añadir estilos según la variante
  if (variant === 'primary') {
    buttonStyle += ' bg-blue-600 text-white hover:bg-blue-700';
  } else if (variant === 'secondary') {
    buttonStyle += ' bg-gray-200 text-gray-800 hover:bg-gray-300';
  } else if (variant === 'outline') {
    buttonStyle += ' border border-gray-300 text-gray-800 hover:bg-gray-100';
  }
  
  // Añadir ancho completo si se especifica
  if (fullWidth) {
    buttonStyle += ' w-full';
  }
  
  // Combinar con la clase personalizada
  buttonStyle = `${buttonStyle} ${className}`;
  
  return (
    <button
      className={buttonStyle}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('loading_state')}
        </>
      ) : (
        t('logout')
      )}
    </button>
  );
}
