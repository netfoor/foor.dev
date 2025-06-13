import React from 'react';
import { getTranslations, getCurrentLocale } from '@/lib/i18n/server';
import { I18nProvider } from '@/components/providers/I18nProvider';
import ProfilePageClient from './ProfilePageClient';

/**
 * Página de perfil que demuestra el uso completo del sistema de i18n
 * Server Component que carga traducciones y las pasa al Client Component
 */
export default async function ProfilePage() {
  // Obtener locale actual
  const locale = await getCurrentLocale();
  
  // Cargar múltiples namespaces de traducciones
  const [tProfile, tCommon, tAuth] = await Promise.all([
    getTranslations('profile'),
    getTranslations('common'),
    getTranslations('auth')
  ]);

  // Preparar traducciones iniciales para el Client Component
  const initialTranslations = {
    profile: {
      title: tProfile('title'),
      edit_profile: tProfile('edit_profile'),
      save_changes: tProfile('save_changes'),
      personal_information: tProfile('personal_information'),
      account_settings: tProfile('account_settings'),
      fields: {
        first_name: tProfile('fields.first_name'),
        last_name: tProfile('fields.last_name'),
        email: tProfile('fields.email'),
        phone: tProfile('fields.phone'),
        bio: tProfile('fields.bio')
      }
    },
    common: {
      save: tCommon('save'),
      cancel: tCommon('cancel'),
      edit: tCommon('edit'),
      loading: tCommon('loading'),
      success: tCommon('success'),
      error: tCommon('error')
    }
  };

  return (
    <I18nProvider locale={locale} namespace="profile">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProfilePageClient initialTranslations={initialTranslations} />
        </div>
      </div>
    </I18nProvider>
  );
}
