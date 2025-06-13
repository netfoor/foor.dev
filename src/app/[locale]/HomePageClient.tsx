'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { ThemeSelector } from '@/components/theme/ThemeSelector';

/**
 * Client Component para funcionalidad interactiva de la página principal
 */
export default function HomePageClient() {
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Solo ejecutar en el cliente para evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date().toLocaleDateString());
  }, []);
  const handleAuthAction = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  };

  // No renderizar hasta que el componente esté montado para evitar hidratación
  if (!isMounted) {
    return (
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-10 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );  }

  return (
    <>
      {/* ThemeSelector flotante solo en el cliente */}
      {isMounted && (
        <div className="fixed top-4 right-20 z-50">
          <ThemeSelector 
            variant="dropdown" 
            size="sm"
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg"
          />
        </div>
      )}
      
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {isAuthenticated ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {t('welcome')}, {user?.signInDetails?.loginId || 'User'}!
              </h3>
              <p className="text-gray-600">
                {t('navigation.go_to_homepage')}
              </p>
              <button
                onClick={handleAuthAction}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('profile')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {t('welcome')}!
              </h3>
              <p className="text-gray-600">
                {t('forms.placeholder')}
              </p>
              <button
                onClick={handleAuthAction}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('login', { defaultValue: 'Login' })}
              </button>
            </div>
          )}
        </div>

        {/* Demostración de funcionalidades de i18n */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              {t('time.today')}
            </h4>            <p className="text-gray-600">
              {currentDate}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              {t('language')}
            </h4>
            <p className="text-gray-600">
              {t('current_language')}
            </p>          </div>
        </div>
      </div>
    </section>
    </>
  );
}
