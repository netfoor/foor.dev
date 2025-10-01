'use client';

import React from 'react';
import { View, Flex, Text, Card, Heading, Button } from '@aws-amplify/ui-react';
import { ArrowLeft, FileX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import HeaderControls from '@/components/ui/HeaderControls';
import Footer from '@/components/ui/Footer';

interface NotFoundClientProps {
  locale: SupportedLocale;
}

function NotFoundClient({ locale }: NotFoundClientProps): React.JSX.Element {
  const { mode } = useTheme();
  const { t } = useTranslation('common');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();

  const isDark = mode === 'dark';

  return (
    <div
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 50%, rgba(30, 41, 59, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 50%, rgba(248, 250, 252, 0.95) 100%)',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      <HeaderControls />
      
      <View 
        style={{
          padding: '2rem 1rem',
          maxWidth: '800px',
          margin: '0 auto',
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card
          style={{
            padding: '3rem 2rem',
            backgroundColor: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '24px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Flex direction="column" alignItems="center" gap="large">
            {/* Icono */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 242, 242, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <FileX 
                size={64} 
                color={isDark ? '#FCA5A5' : '#B91C1C'} 
              />
            </div>

            {/* Título */}
            <Heading 
              level={1}
              style={{
                color: isDark ? '#F1F5F9' : '#1E293B',
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem'
              }}
            >
              {t('project_not_found')}
            </Heading>

            {/* Descripción */}
            <Text
              style={{
                color: isDark ? '#CBD5E1' : '#64748B',
                fontSize: '1.125rem',
                lineHeight: '1.75',
                maxWidth: '500px'
              }}
            >
              {locale === 'en' && 'The project you are looking for doesn\'t exist or has been moved.'}
              {locale === 'es' && 'El proyecto que buscas no existe o ha sido movido.'}
              {locale === 'ja' && 'お探しのプロジェクトは存在しないか、移動されました。'}
            </Text>

            {/* Botones de acción */}
            <Flex 
              direction={{ base: 'column', medium: 'row' }}
              gap="medium"
              style={{ marginTop: '2rem' }}
            >
              <Button
                style={{
                  backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
                onClick={() => router.push(getLocalizedPath('/projects'))}
              >
                <ArrowLeft size={16} />
                {t('back_to_projects')}
              </Button>

              <Button
                style={{
                  backgroundColor: 'transparent',
                  color: isDark ? '#CBD5E1' : '#64748B',
                  border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
                onClick={() => router.push(getLocalizedPath('/'))}
              >
                {locale === 'en' && 'Go to Home'}
                {locale === 'es' && 'Ir al Inicio'}
                {locale === 'ja' && 'ホームに戻る'}
              </Button>
            </Flex>
          </Flex>
        </Card>
      </View>

      <Footer />
    </div>
  );
}

export default NotFoundClient;
