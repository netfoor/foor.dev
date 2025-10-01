'use client';

import React from 'react';
import { Button } from '@aws-amplify/ui-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';

interface LoginButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  redirectUri?: string;
}

/**
 * Botón para iniciar sesión con el Hosted UI de Cognito
 * Diseño moderno con AWS Amplify UI y temas integrados
 */
export function LoginButton({
  className = '',
  variant = 'primary',
  fullWidth = false,
  redirectUri,
}: LoginButtonProps) {
  const { login, isLoading, isAuthenticated } = useAuth();
  const { mode } = useTheme();
  const router = useRouter();
  const { t } = useTranslation('auth');
    const handleLogin = async () => {
    try {
      // Si ya está autenticado, redirigir directamente a /admin
      if (isAuthenticated) {
        router.push('/admin');
        return;
      }
      
      // Pasar el redirectUri al método login
      await login(redirectUri);
    } catch (error) {
      // Verificar si el error es porque el usuario ya está autenticado
      if (error instanceof Error && 
          (error.name === 'UserAlreadyAuthenticatedException' || 
          error.message?.includes('already a signed in user') ||
          error.message?.includes('already authenticated'))) {
        
        // Redirigir a la página principal si ya está autenticado
        router.push('/admin');
      } else {
        console.error('Error iniciando sesión:', error);
      }
    }
  };

  return (
    <Button      onClick={handleLogin}
      isLoading={isLoading}
      loadingText={t('loading_state')}
      size="large"
      className={className}      style={{
        width: fullWidth ? '100%' : 'auto',
        backgroundImage: mode === 'dark'
          ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
          : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        border: 'none',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '1rem',
        padding: '1rem 2rem',
        color: '#FFFFFF',
        transition: 'all 0.3s ease',
        boxShadow: mode === 'dark'
          ? '0 4px 12px rgba(59, 130, 246, 0.3)'
          : '0 4px 12px rgba(37, 99, 235, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        const target = e.target as HTMLElement;
        target.style.transform = 'translateY(-2px)';
        target.style.boxShadow = mode === 'dark'
          ? '0 6px 16px rgba(59, 130, 246, 0.4)'
          : '0 6px 16px rgba(37, 99, 235, 0.3)';
      }}
      onMouseLeave={(e) => {
        const target = e.target as HTMLElement;
        target.style.transform = 'translateY(0)';
        target.style.boxShadow = mode === 'dark'
          ? '0 4px 12px rgba(59, 130, 246, 0.3)'
          : '0 4px 12px rgba(37, 99, 235, 0.2)';
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeOpacity="0.3"
            />
            <path 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              strokeOpacity="0.7"
            />
          </svg>
          {t('loading_state')}
        </span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10,17 15,12 10,7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          {t('loginWithAWS')}
        </span>
      )}
      
      {/* Subtle animation overlay */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Button>
  );
}
