'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAuthorization, type UserRole } from '@/hooks/useAuthorization';
import { useRouter, usePathname } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

interface AuthGuardProps {
  children: React.ReactNode;
  role?: UserRole;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard completamente estable - NO re-renderiza una vez que el usuario está autenticado
 * Solución definitiva para evitar loops infinitos con otros providers
 */
export function AuthGuardStable({
  children,
  role = 'user',
  fallback,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole } = useAuthorization();
  const router = useRouter();
  const pathname = usePathname();
  
  // Estado inicial - una vez establecido, no cambia más
  const [authResult, setAuthResult] = useState<{
    status: 'loading' | 'authorized' | 'unauthorized';
    initialCheckDone: boolean;
  }>({
    status: 'loading',
    initialCheckDone: false
  });
  
  const hasRedirectedRef = useRef(false);

  // Get current locale
  const getCurrentLocale = () => {
    const pathParts = pathname.split('/');
    return pathParts[1] || DEFAULT_LOCALE;
  };

  // Verificación inicial de auth - SOLO UNA VEZ
  useEffect(() => {
    // Solo procesar si no hemos hecho el check inicial
    if (!authResult.initialCheckDone && !isLoading) {
      const isAuthorized = isAuthenticated && hasRole(role);
        isAuthenticated,
        hasRequiredRole: hasRole(role),
        isAuthorized
      });
      
      setAuthResult({
        status: isAuthorized ? 'authorized' : 'unauthorized',
        initialCheckDone: true
      });
      
      // Si no está autorizado, redirigir UNA SOLA VEZ
      if (!isAuthorized && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        const currentLocale = getCurrentLocale();
        const returnUrl = encodeURIComponent(pathname);
        const localizedRedirect = `/${currentLocale}${redirectTo}`;
        
        setTimeout(() => {
          router.push(`${localizedRedirect}?returnUrl=${returnUrl}`);
        }, 100);
      }
    }
  }, [isLoading, isAuthenticated, hasRole, role, authResult.initialCheckDone, pathname, redirectTo, router]);

  // Mostrar loading mientras se hace el check inicial
  if (!authResult.initialCheckDone || authResult.status === 'loading') {
    return fallback || (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autorizado, mostrar mensaje de redirección
  if (authResult.status === 'unauthorized') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Redirecting to login...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  // Usuario autorizado - renderizar children y NUNCA MÁS cambiar
  return <>{children}</>;
}
