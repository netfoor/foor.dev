'use client';

import React from 'react';
import { Text, Flex, View } from '@aws-amplify/ui-react';
import { useTranslation } from '@/lib/i18n/client';
import { useTheme } from '@/hooks/useTheme';

interface FooterProps {
  className?: string;
}

/**
 * Componente Footer - Pie de página sencillo y elegante
 * Incluye copyright, enlaces sociales y branding
 * SEO optimizado con estructura semántica
 */
export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { t } = useTranslation('common');
  const { mode } = useTheme();

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      key: 'github', 
      url: 'https://github.com/netfoor',
      label: 'GitHub',
      icon: 'https://img.icons8.com/3d-fluency/94/github.png'
    },
    { 
      key: 'linkedin', 
      url: 'https://linkedin.com/in/fortino-romero-mantilla',
      label: 'LinkedIn',
      icon: 'https://img.icons8.com/3d-fluency/94/linkedin--v2.png'
    },
    { 
      key: 'instagram', 
      url: 'https://instagram.com/foor.rm',
      label: 'Instagram',
      icon: 'https://img.icons8.com/3d-fluency/94/instagram-new.png'
    },
    { 
      key: 'email', 
      url: 'mailto:fortino.rom@gmail.com',
      label: 'Email',
      icon: 'https://img.icons8.com/3d-fluency/94/gmail.png'
    }
  ];

  return (
    <View 
      as="footer"
      className={className}
      padding={{ base: "2rem 1rem", medium: "2.5rem 2rem" }}
      style={{
        background: mode === 'dark' 
          ? 'linear-gradient(180deg, #0F172A 0%, #020617 100%)'
          : 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
        borderTop: mode === 'dark' 
          ? '1px solid rgba(71, 85, 105, 0.3)' 
          : '1px solid rgba(226, 232, 240, 0.8)',
        position: 'relative'
      }}
    >
      {/* Background subtle pattern */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: mode === 'dark' ? 0.05 : 0.03,
          background: `
            radial-gradient(circle at 25% 25%, #3B82F6 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #06B6D4 0%, transparent 50%)
          `,
          zIndex: 0
        }}
      />

      <View 
        maxWidth="1200px" 
        margin="0 auto"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Flex
          direction={{ base: 'column', medium: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap="1.5rem"
        >
          {/* Left side - Branding */}
          <Flex
            direction="column"
            alignItems={{ base: 'center', medium: 'flex-start' }}
            gap="0.5rem"
          >            <Text
              fontSize={{ base: "1.125rem", medium: "1.25rem" }}
              fontWeight="700"
              style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundImage: mode === 'dark'
                  ? 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)'
                  : 'linear-gradient(135deg, #1E293B 0%, #3B82F6 100%)'
              }}
            >
              foor.dev
            </Text>
            <Text
              fontSize={{ base: "0.875rem", medium: "0.95rem" }}
              color={mode === 'dark' ? '#94A3B8' : '#64748B'}
              textAlign={{ base: 'center', medium: 'left' }}
            >
              {t('footer.tagline')}
            </Text>
          </Flex>

          {/* Center - Social Links */}
          <Flex
            gap="1.5rem"
            alignItems="center"
            justifyContent="center"
            wrap="wrap"
          >
            {socialLinks.map((link) => (
              <View key={link.key}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t('footer.social.visit')} ${link.label}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    color: mode === 'dark' ? '#CBD5E1' : '#475569',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = mode === 'dark' 
                      ? 'rgba(59, 130, 246, 0.1)' 
                      : 'rgba(59, 130, 246, 0.05)';
                    e.currentTarget.style.color = mode === 'dark' ? '#60A5FA' : '#3B82F6';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = mode === 'dark' ? '#CBD5E1' : '#475569';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img src={link.icon} alt={link.label} style={{ width: '24px', height: '24px' }} />
                  <Text
                    fontSize="0.875rem"
                    display={{ base: 'none', medium: 'inline' }}
                  >
                    {link.label}
                  </Text>
                </a>
              </View>
            ))}
          </Flex>

          {/* Right side - Copyright */}
          <Flex
            direction="column"
            alignItems={{ base: 'center', medium: 'flex-end' }}
            gap="0.25rem"
          >
            <Text
              fontSize="0.875rem"
              color={mode === 'dark' ? '#94A3B8' : '#64748B'}
              textAlign={{ base: 'center', medium: 'right' }}
            >
              © {currentYear} Fortino Romero Mantilla
            </Text>
            <Text
              fontSize="0.75rem"
              color={mode === 'dark' ? '#64748B' : '#94A3B8'}
              textAlign={{ base: 'center', medium: 'right' }}
            >
              {t('footer.rights')}
            </Text>
          </Flex>
        </Flex>

        {/* Bottom section - Additional info */}
        <View
          marginTop="1.5rem"
          paddingTop="1rem"
          style={{
            borderTop: mode === 'dark' 
              ? '1px solid rgba(71, 85, 105, 0.2)' 
              : '1px solid rgba(226, 232, 240, 0.6)'
          }}
        >
          <Flex
            direction={{ base: 'column', medium: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            gap="1rem"
          >
            <Text
              fontSize="0.75rem"
              color={mode === 'dark' ? '#64748B' : '#94A3B8'}
              textAlign={{ base: 'center', medium: 'left' }}
            >
              {t('footer.built')}
            </Text>
            <Flex
              gap="1rem"
              alignItems="center"
              justifyContent="center"
              wrap="wrap"
            >
              <Text
                fontSize="0.75rem"
                color={mode === 'dark' ? '#64748B' : '#94A3B8'}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>⚡</span> Next.js
              </Text>
              <Text
                fontSize="0.75rem"
                color={mode === 'dark' ? '#64748B' : '#94A3B8'}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>☁️</span> AWS Amplify
              </Text>
              <Text
                fontSize="0.75rem"
                color={mode === 'dark' ? '#64748B' : '#94A3B8'}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>🎨</span> AWS UI React
              </Text>
            </Flex>
          </Flex>
        </View>
      </View>
    </View>
  );
};

export default Footer;
    