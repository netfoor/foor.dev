import React from 'react';
import { getTranslations } from '@/lib/i18n/server';
import AccessDeniedClient from './AccessDeniedClient';

/**
 * Página que se muestra cuando un usuario no tiene permisos suficientes
 * Server Component con traducciones
 */
export default async function AccessDeniedPage() {
  // Cargar traducciones para common y auth namespaces
  const [tCommon, tAuth] = await Promise.all([
    getTranslations('common'),
    getTranslations('auth')
  ]);

  // Preparar las traducciones para el cliente
  const translations = {
    title: tAuth('errors.forbidden'),
    authenticatedMessage: tAuth('errors.account_locked'),
    unauthenticatedMessage: tAuth('errors.unauthorized'), 
    goHome: tCommon('home'),
    logout: tAuth('logout'),
    contactSupport: tCommon('errors.contact_support')
  };

  return <AccessDeniedClient translations={translations} />;
}
