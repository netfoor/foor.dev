'use client';

import React from 'react';
import { AuthGuardStable } from '@/app/components/auth/AuthGuardStable';
import { LogoutButton } from '@/app/components/auth/LogoutButton';
import { UserProfile } from '@/app/components/auth/UserProfile';
import Link from 'next/link';

/**
 * Layout para la sección de administración
 * Verifica que el usuario esté autenticado y tenga permisos de administrador
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuardStable role="admin" redirectTo="/login">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col"> {/* Adjust for main navbar */}
        {/* Barra de navegación superior del admin */}
        <header className="bg-white shadow-md sticky top-16 z-10"> {/* Sticky below main navbar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 items-center"> {/* Reduced height */}
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <UserProfile />
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex flex-1">
          {/* Barra lateral de navegación */}
          <aside className="w-64 bg-gray-800 text-white">
            <div className="p-4 sticky top-30"> {/* Sticky below both navbars */}
              <h2 className="text-lg font-semibold mb-4">Menú</h2>
              
              <nav className="space-y-1">
                <Link 
                  href="/admin" 
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/users" 
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Usuarios
                </Link>
                <Link 
                  href="/admin/settings" 
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Configuración
                </Link>
              </nav>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 p-6 bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </AuthGuardStable>
  );
}
