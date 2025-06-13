'use client';

import { useAuth } from '@/context/auth-context';
import { LoginButton } from '../../components/auth/LoginButton';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';

interface LoginPageProps {
  params: {
    locale: SupportedLocale;
  };
}

/**
 * Página de login localizada
 */
export default function LoginPage({ params: { locale } }: LoginPageProps) {
  const { t } = useTranslation('auth');
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || `/${locale}/admin`;
  const error = searchParams.get('error');  
  
  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    // Guardar returnUrl en localStorage para recuperarlo después del login
    if (typeof window !== 'undefined' && returnUrl) {
      localStorage.setItem('returnUrl', returnUrl);
      console.log('Login: Guardando returnUrl en localStorage:', returnUrl);
    }
    
    if (isAuthenticated && !isLoading) {
      console.log('Usuario ya autenticado en login page, redirigiendo a:', returnUrl);
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, returnUrl]);
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('login.title')}
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('login.subtitle')}
          </p>
        </div>
        
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error === 'session_error' 
              ? t('errors.session_error')
              : t('errors.login_error')}
          </div>
        )}
        
        <div className="mt-8 space-y-6">
          <div>
            <LoginButton 
              fullWidth 
              className="py-3" 
              redirectUri={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
            />
          </div>
          
          <div className="text-sm text-center mt-4">
            <p>
              Al iniciar sesión, aceptas nuestros términos y condiciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
