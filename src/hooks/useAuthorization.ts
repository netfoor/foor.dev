'use client';

import { useAuth } from "@/context/auth-context";
import { useCallback } from "react";

/**
 * Tipos de roles disponibles en la aplicación
 */
export type UserRole = 'admin' | 'user' | 'guest';

/**
 * Interfaz para políticas de autorización
 */
export interface AuthorizationPolicy {
  requiredRole: UserRole;
  requiredPermissions?: string[];
}

/**
 * Hook para manejar la autorización basada en roles
 */
export function useAuthorization() {
  const { isAuthenticated, isAdmin } = useAuth();
  
  /**
   * Comprueba si el usuario tiene permisos basados en una política
   * @param policy - Política de autorización a comprobar
   * @returns true si el usuario cumple con la política
   */
  const checkPolicy = useCallback((policy: AuthorizationPolicy): boolean => {
    // Si no está autenticado, es un invitado
    if (!isAuthenticated) {
      return policy.requiredRole === 'guest';
    }
    
    // Comprobar roles específicos
    if (policy.requiredRole === 'admin' && !isAdmin) {
      return false;
    }
    
    // El usuario está autenticado, cumple con el rol 'user' o 'admin' si isAdmin es true
    return policy.requiredRole === 'user' || (policy.requiredRole === 'admin' && isAdmin);
  }, [isAuthenticated, isAdmin]);
  
  /**
   * Verifica si el usuario tiene el rol especificado
   * @param role - Rol a verificar
   * @returns true si el usuario tiene el rol
   */
  const hasRole = useCallback((role: UserRole): boolean => {
    if (role === 'guest') return true;
    if (!isAuthenticated) return false;
    if (role === 'user') return true;
    if (role === 'admin') return isAdmin;
    return false;
  }, [isAuthenticated, isAdmin]);
  
  /**
   * Verifica si el usuario es administrador
   * @returns true si el usuario es administrador
   */
  const isUserAdmin = useCallback((): boolean => {
    return isAuthenticated && isAdmin;
  }, [isAuthenticated, isAdmin]);
  
  return {
    checkPolicy,
    hasRole,
    isUserAdmin
  };
}
