'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useLocalizedPath } from '@/lib/i18n/client';

interface AccessDeniedClientProps {
  translations: {
    title: string;
    authenticatedMessage: string;
    unauthenticatedMessage: string;
    goHome: string;
    logout: string;
    contactSupport: string;
  };
}

/**
 * Client Component para la página de acceso denegado
 * Maneja la interacción del usuario con traducciones
 */
export default function AccessDeniedClient({ translations }: AccessDeniedClientProps) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const getLocalizedPath = useLocalizedPath();
  
  const handleGoHome = () => {
    const homePath = getLocalizedPath('/');
    router.push(homePath);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      const loginPath = getLocalizedPath('/login');
      router.push(loginPath);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-16 h-16 text-red-500"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {translations.title}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {isAuthenticated 
            ? translations.authenticatedMessage
            : translations.unauthenticatedMessage
          }
          {' '}
          {translations.contactSupport}.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label={translations.goHome}
          >
            {translations.goHome}
          </button>
          
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label={translations.logout}
            >
              {translations.logout}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
