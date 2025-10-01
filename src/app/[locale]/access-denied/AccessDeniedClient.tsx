'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heading, Text, Flex, View, Button } from '@aws-amplify/ui-react';
import { useAuth } from '@/context/auth-context';
import { useLocalizedPath, useTranslation } from '@/lib/i18n/client';
import { useTheme } from '@/hooks/useTheme';

/**
 * Client Component para la página de acceso denegado
 * Diseño moderno con temas, AWS Amplify UI y responsive
 */
export default function AccessDeniedClient() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const getLocalizedPath = useLocalizedPath();
  const { mode } = useTheme();
  const { t: tAuth } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  
  const handleGoHome = () => {
    const homePath = getLocalizedPath('/');
    router.push(homePath);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      const loginPath = getLocalizedPath('/login');
      router.push(loginPath);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View 
      as="section"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
        position: 'relative'
      }}
    >
      {/* Background decorative elements */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: mode === 'dark' ? 0.1 : 0.05,
          background: `
            radial-gradient(circle at 20% 30%, #EF4444 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, #F59E0B 0%, transparent 50%)
          `,
          zIndex: 0
        }}
      />

      <View 
        maxWidth="500px" 
        width="100%"
        style={{ 
          position: 'relative', 
          zIndex: 1,
          background: mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.8)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: mode === 'dark' 
            ? '1px solid rgba(71, 85, 105, 0.3)' 
            : '1px solid rgba(226, 232, 240, 0.5)',
          boxShadow: mode === 'dark'
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        padding={{ base: "2rem", medium: "3rem" }}
      >
        <Flex
          direction="column"
          alignItems="center"
          textAlign="center"
          gap="2rem"
        >
          {/* Icon Section */}
          <View
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: mode === 'dark'
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
              border: mode === 'dark'
                ? '2px solid rgba(239, 68, 68, 0.3)'
                : '2px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <svg 
              width="60"
              height="60"
              viewBox="0 0 24 24" 
              fill="none"
              stroke={mode === 'dark' ? '#EF4444' : '#DC2626'}
              strokeWidth="1.5"
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
          </View>

          {/* Title */}
          <Heading
            level={1}
            fontSize={{ base: "1.875rem", medium: "2.25rem" }}
            fontWeight="700"
            marginBottom="0.5rem"            style={{
              color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
              backgroundImage: mode === 'dark'
                ? 'linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%)'
                : 'linear-gradient(135deg, #1E293B 0%, #475569 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {tAuth('access_denied.title')}
          </Heading>
            {/* Message */}
          <Text
            fontSize={{ base: "1rem", medium: "1.125rem" }}
            color={mode === 'dark' ? '#CBD5E1' : '#475569'}
            lineHeight="1.6"
            marginBottom="1rem"
          >
            {isAuthenticated 
              ? tAuth('access_denied.authenticated_message')
              : tAuth('access_denied.unauthenticated_message')
            }
            {' '}
            {tCommon('errors.contact_support')}.
          </Text>
          
          {/* Action Buttons */}
          <Flex
            direction="column"
            gap="1rem"
            width="100%"
          >
            <Button
              onClick={handleGoHome}
              variation="primary"
              size="large"
              style={{
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                  : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                padding: '0.875rem 2rem',
                transition: 'all 0.2s ease',
                boxShadow: mode === 'dark'
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                  : '0 4px 12px rgba(37, 99, 235, 0.2)'
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
              aria-label={tCommon('home')}
            >
              {tCommon('home')}
            </Button>
            
            {isAuthenticated && (
              <Button
                onClick={handleLogout}
                variation="link"
                size="large"
                style={{
                  color: mode === 'dark' ? '#94A3B8' : '#64748B',
                  background: mode === 'dark' 
                    ? 'rgba(71, 85, 105, 0.1)' 
                    : 'rgba(226, 232, 240, 0.3)',
                  border: mode === 'dark'
                    ? '1px solid rgba(71, 85, 105, 0.3)'
                    : '1px solid rgba(226, 232, 240, 0.5)',
                  borderRadius: '12px',
                  fontWeight: '500',
                  fontSize: '1rem',
                  padding: '0.875rem 2rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.background = mode === 'dark' 
                    ? 'rgba(71, 85, 105, 0.2)' 
                    : 'rgba(226, 232, 240, 0.5)';
                  target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.background = mode === 'dark' 
                    ? 'rgba(71, 85, 105, 0.1)' 
                    : 'rgba(226, 232, 240, 0.3)';
                  target.style.transform = 'translateY(0)';
                }}
                aria-label={tAuth('logout')}
              >
                {tAuth('logout')}
              </Button>
            )}
          </Flex>
        </Flex>
      </View>
    </View>
  );
}
