'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

interface LoginButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  redirectUri?: string;
}

/**
 * Botón para iniciar sesión con el Hosted UI de Cognito
 */
export function LoginButton({
  className = '',
  variant = 'primary',
  fullWidth = false,
  redirectUri,
}: LoginButtonProps) {
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const handleLogin = async () => {    try {
      // Si ya está autenticado, redirigir directamente a /admin
      if (isAuthenticated) {
        console.log('Usuario ya está autenticado, redirigiendo directamente a /admin');
        router.push('/admin');
        return;
      }
      
      console.log('LoginButton: Iniciando sesión con redirectUri:', redirectUri);
      
      // Pasar el redirectUri al método login
      await login(redirectUri);
    } catch (error) {
      // Verificar si el error es porque el usuario ya está autenticado
      if (error instanceof Error && 
          (error.name === 'UserAlreadyAuthenticatedException' || 
          error.message?.includes('already a signed in user') ||
          error.message?.includes('already authenticated'))) {
        console.log('Usuario ya autenticado, redirigiendo a página principal');
        
        // Redirigir a la página principal si ya está autenticado
        router.push('/admin');
      } else {
        console.error('Error iniciando sesión:', error);
      }
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
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Iniciando sesión...
        </>
      ) : (
        'Iniciar sesión'
      )}
    </button>
  );
}
