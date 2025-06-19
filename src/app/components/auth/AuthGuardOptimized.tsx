'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAuthorization, type UserRole } from '@/hooks/useAuthorization';
import { useRouter, usePathname } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { useTranslation } from '@/lib/i18n/client';

interface AuthGuardProps {
  children: React.ReactNode;
  role?: UserRole; // Rol requerido para acceder al componente
  fallback?: React.ReactNode; // Componente a mostrar mientras se verifica la autenticación
  redirectTo?: string; // Ruta a la que redirigir si no está autenticado
}

/**
 * Componente para proteger rutas o componentes basados en autenticación
 * Optimizado para evitar re-renders innecesarios que afectan formularios
 */
export function AuthGuard({
  children,
  role = 'user',
  fallback,
  redirectTo = '/login',
}: AuthGuardProps) {
  console.log('🛡️ AuthGuard render - role:', role);
  
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole } = useAuthorization();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation('auth');
  
  // Usar refs para evitar re-renders innecesarios
  const hasRedirectedRef = useRef(false);
  const initialAuthCheckDone = useRef(false);

  // Get the current locale from the pathname
  const getCurrentLocale = () => {
    const pathParts = pathname.split('/');
    return pathParts[1] || DEFAULT_LOCALE;
  };
  // Memoizar el estado de autorización para evitar recalcular constantemente
  const authState = useMemo(() => {
    const hasRequiredRole = hasRole(role);
    const result = {
      isLoading,
      isAuthenticated,
      hasRequiredRole,
      shouldShowContent: !isLoading && isAuthenticated && hasRequiredRole,
      shouldRedirect: !isLoading && (!isAuthenticated || !hasRequiredRole),
      canProceed: isLoading || (isAuthenticated && hasRequiredRole)
    };
    
    console.log('🛡️ AuthGuard state recalculated:', {
      isLoading,
      isAuthenticated,
      hasRequiredRole,
      shouldShowContent: result.shouldShowContent
    });
    
    return result;
  }, [isLoading, isAuthenticated, hasRole, role]);

  // Efectuar la redirección una sola vez y evitar loops
  useEffect(() => {
    // Solo proceder si el check inicial de auth está completado
    if (!authState.isLoading) {
      initialAuthCheckDone.current = true;
    }

    // Solo redirigir si: 
    // 1. El check inicial está completo
    // 2. No hemos redirigido antes 
    // 3. El usuario debe ser redirigido
    // 4. Estamos en el cliente
    if (
      initialAuthCheckDone.current && 
      !hasRedirectedRef.current && 
      authState.shouldRedirect && 
      typeof window !== 'undefined'
    ) {
      hasRedirectedRef.current = true;
      
      const currentLocale = getCurrentLocale();
      const returnUrl = encodeURIComponent(pathname);
      const localizedRedirect = `/${currentLocale}${redirectTo}`;
      
      // Usar setTimeout para evitar problemas de timing con React
      setTimeout(() => {
        router.push(`${localizedRedirect}?returnUrl=${returnUrl}`);
      }, 0);
    }
  }, [authState.shouldRedirect, authState.isLoading, pathname, redirectTo, router]);

  // Estado de carga, mostrar fallback o spinner
  if (authState.isLoading) {
    return fallback || (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si debe redirigir y ya se ha iniciado el proceso, mostrar mensaje
  if (authState.shouldRedirect && hasRedirectedRef.current) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">{t('redirecting_to_login')}</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado o no tiene el rol requerido, mostrar fallback
  if (!authState.shouldShowContent) {
    return fallback || null;
  }
  
  // Usuario autenticado y con permisos, mostrar el contenido protegido
  // Usar React.memo implícito para evitar re-renders innecesarios de children
  return <>{children}</>;
}
