'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAuthorization, type UserRole } from '@/hooks/useAuthorization';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  role?: UserRole; // Rol requerido para acceder al componente
  fallback?: React.ReactNode; // Componente a mostrar mientras se verifica la autenticación
  redirectTo?: string; // Ruta a la que redirigir si no está autenticado
}

/**
 * Componente para proteger rutas o componentes basados en autenticación
 */
export function AuthGuard({
  children,
  role = 'user',
  fallback,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole } = useAuthorization();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Usar useEffect para manejar las redirecciones
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasRole(role))) {
      setShouldRedirect(true);
    } else {
      setShouldRedirect(false);
    }
  }, [isAuthenticated, isLoading, hasRole, role]);

  // Efectuar la redirección en un useEffect separado
  useEffect(() => {
    if (shouldRedirect && typeof window !== 'undefined') {
      const returnUrl = encodeURIComponent(pathname);
      
      console.log(`AuthGuard: Redirigiendo a ${redirectTo}?returnUrl=${returnUrl} 
        (isAuthenticated: ${isAuthenticated}, hasRole: ${hasRole(role)})`);
      
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
    }
  }, [shouldRedirect, pathname, redirectTo, router, isAuthenticated, hasRole, role]);
  
  // Estado de carga, mostrar fallback o spinner
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si debe redirigir, mostrar mensaje de redirección
  if (shouldRedirect) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Redirigiendo al login...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado o no tiene el rol requerido, mostrar fallback
  if (!isAuthenticated || !hasRole(role)) {
    return fallback || null;
  }
  
  // Usuario autenticado y con permisos, mostrar el contenido protegido
  return <>{children}</>;
}
