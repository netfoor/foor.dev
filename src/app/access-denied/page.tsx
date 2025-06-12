'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

/**
 * Página que se muestra cuando un usuario no tiene permisos suficientes
 */
export default function AccessDeniedPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  
  const handleGoHome = () => {
    router.push('/');
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
    return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Acceso denegado
        </h1>
          <p className="text-gray-600 mb-8">
          {isAuthenticated 
            ? "Tu cuenta está autenticada correctamente, pero no tienes permisos de administrador para acceder a esta sección. El acceso a esta área está restringido a usuarios con rol de administrador en el grupo 'ADMINS' de Cognito. Por favor, contacta al administrador del sistema si necesitas este nivel de acceso."
            : "No tienes permisos suficientes para acceder a esta página. Esta sección está restringida a usuarios con rol de administrador."}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ir al inicio
          </button>
          
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
