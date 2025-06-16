'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heading, Text, Flex, View, Alert } from '@aws-amplify/ui-react';
import { useAuth } from '@/context/auth-context';
import { LoginButton } from '../../components/auth/LoginButton';
import { useTranslation } from '@/lib/i18n/client';
import { useTheme } from '@/hooks/useTheme';
import type { SupportedLocale } from '@/lib/i18n/types';

interface LoginPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;

}

function LoginContent({ locale, returnUrl }: { locale: SupportedLocale; returnUrl: string }) {
  const { t } = useTranslation('auth');
  const { isAuthenticated, isLoading } = useAuth();
  const { mode } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  }, [isAuthenticated, isLoading, returnUrl, router]);

  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      className="min-h-[calc(100vh-60px)]" // Ajustado para la altura exacta del navbar
      style={{ paddingTop: '5rem' }} // Padding adicional para separación visual
    >
      <View
        backgroundColor={mode === 'dark' ? 'var(--amplify-colors-neutral-90)' : 'var(--amplify-colors-white)'}
        borderRadius="medium"
        padding="xl"
        width="100%"
        maxWidth="28rem"
        boxShadow="medium"
        className="mx-4" // Add horizontal margin for mobile
      >
        {/* Sección de Branding */}
        <Flex
          direction="column"
          alignItems="center"
          textAlign="center"
          gap="2rem"
          marginBottom="2rem"
        >
          <View>
            <Heading
              level={1}
              fontSize={{ base: "2rem", medium: "2.5rem" }}
              fontWeight="700"
              marginBottom="0.5rem"
              style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)'
                  : 'linear-gradient(135deg, #1E293B 0%, #3B82F6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundImage: mode === 'dark'
                  ? 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)'
                  : 'linear-gradient(135deg, #1E293B 0%, #3B82F6 100%)'
              }}
            >
              {t('login.title')}
            </Heading>
            <Text
              fontSize={{ base: "1rem", medium: "1.125rem" }}
              color={mode === 'dark' ? '#CBD5E1' : '#475569'}
              lineHeight="1.6"
            >
              {t('login.subtitle')}
            </Text>
          </View>

          {/* Icono de Branding de AWS/Cloud */}
          <View
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: mode === 'dark'
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
              border: mode === 'dark'
                ? '2px solid rgba(59, 130, 246, 0.3)'
                : '2px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <svg 
              width="50"
              height="50"
              viewBox="0 0 24 24" 
              fill="none"
              stroke={mode === 'dark' ? '#60A5FA' : '#3B82F6'}
              strokeWidth="1.5"
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 7h-9"/>
              <path d="M14 17H5"/>
              <circle cx="17" cy="17" r="3"/>
              <circle cx="7" cy="7" r="3"/>
            </svg>
          </View>
        </Flex>

        {/* Mensaje de Error */}
        {error && (
          <Alert
            variation="error"
            isDismissible={false}
            style={{
              background: mode === 'dark' 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(254, 242, 242, 0.8)',
              border: mode === 'dark'
                ? '1px solid rgba(239, 68, 68, 0.3)'
                : '1px solid rgba(254, 226, 226, 0.8)',
              borderRadius: '12px',
              color: mode === 'dark' ? '#FCA5A5' : '#DC2626'
            }}
            className="mb-4"
          >
            {error === 'session_error' 
              ? t('errors.session_error')
              : t('errors.login_error')}
          </Alert>
        )}
      
        {/* Sección de Login */}
        <View width="100%" marginBottom="1.5rem">
          <LoginButton 
            fullWidth 
            redirectUri={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
          />
        </View>
          {/* Términos */}
        <Text
          fontSize="0.875rem"
          color={mode === 'dark' ? '#94A3B8' : '#64748B'}
          lineHeight="1.5"
          textAlign="center"
          marginBottom="1.5rem"
        >
          {t('login.terms_agreement')}
        </Text>

        {/* Características de AWS/Cloud */}
        <View
          width="100%"
          style={{
            background: mode === 'dark' 
              ? 'rgba(71, 85, 105, 0.1)' 
              : 'rgba(248, 250, 252, 0.5)',
            borderRadius: '12px',
            border: mode === 'dark'
              ? '1px solid rgba(71, 85, 105, 0.2)'
              : '1px solid rgba(226, 232, 240, 0.5)'
          }}
          padding="1.5rem"
        >          <Text
            fontSize="0.875rem"
            fontWeight="600"
            color={mode === 'dark' ? '#E2E8F0' : '#374151'}
            marginBottom="0.75rem"
            textAlign="center"
          >
            {t('login.security_header')}
          </Text>
          <Flex
            direction="column"
            gap="0.5rem"
            alignItems="center"
          >
            <Text
              fontSize="0.75rem"
              color={mode === 'dark' ? '#94A3B8' : '#6B7280'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>☁️</span> {t('login.features.aws')}
            </Text>
            <Text
              fontSize="0.75rem"
              color={mode === 'dark' ? '#94A3B8' : '#6B7280'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>🔒</span> {t('login.features.secure')}
            </Text>
            <Text
              fontSize="0.75rem"
              color={mode === 'dark' ? '#94A3B8' : '#6B7280'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>⚡</span> {t('login.features.fast')}
            </Text>
          </Flex>
        </View>
      </View>
    </Flex>
  );
}

/**
 * Página de login localizada con diseño moderno
 * Integra temas, AWS Amplify UI y responsive design
 */
export default function LoginPage({ params }: LoginPageProps) {
  const searchParams = useSearchParams();
  const locale = React.use(params).locale;
  const returnUrl = searchParams.get('returnUrl') || `/${locale}/admin`;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent locale={locale} returnUrl={returnUrl} />
    </Suspense>
  );
}
