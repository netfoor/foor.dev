'use client';

import React from 'react';
import Image from 'next/image';
import { Heading, Text, Flex, View } from '@aws-amplify/ui-react';
import { useTranslation } from '@/lib/i18n/client';
import { useTheme } from '@/hooks/useTheme';

interface HeroProps {
  className?: string;
}

/**
 * Componente Hero optimizado para SEO - AWS Cloud Engineer
 * Enfocado en: AWS, Cloud, Serverless, DevOps
 * Keywords: Cloud Engineer, AWS Advocate, DevOps, Serverless
 */
export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  const { t } = useTranslation('homepage');
  const { mode } = useTheme();

  return (
    <View 
      as="section"
      className={className}
      padding={{ base: "2rem", medium: "4rem" }}
      style={{
        height: "100vh",    
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)'
      }}
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
        maxWidth="1200px"
        margin="0 auto"
      >
        {/* Imagen de perfil */}
        <View 
          width="150px" 
          height="150px" 
          marginBottom="1.5rem" 
          position="relative" 
          style={{ 
            zIndex: 1,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${mode === 'dark' ? '#93C5FD' : '#F59E0B'}`,
            boxShadow: mode === 'dark' 
              ? '0 20px 25px -5px rgba(147, 197, 253, 0.3)' 
              : '0 20px 25px -5px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Image
            src="/images/profile.jpg"
            alt={t('hero.name')}
            className="object-cover"
            fill
            priority
            sizes="150px"
          />
        </View>

        {/* Título Principal - H1 SEO Optimizado */}
        <Heading 
          level={1}
          fontWeight="bold"
          marginBottom="0.5rem"
          textAlign="center"
          fontSize={{ base: '1.5rem', medium: '1.875rem', large: '2.25rem' }}
          style={{
            color: mode === 'dark' ? '#E2E8F0' : '#1F2937',
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, #93C5FD, #60A5FA)' 
              : 'linear-gradient(135deg, #F59E0B, #D97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {t('hero.name')}
        </Heading>

        {/* Subtítulo con keywords SEO */}
        <Text
          marginTop="0.5rem"
          marginBottom="2rem"
          textAlign="center"
          fontSize={{ base: '1rem', medium: '1.125rem' }}
          fontWeight="500"
          style={{
            color: mode === 'dark' ? '#94A3B8' : '#6B7280'
          }}
        >
          {t('hero.title')}
        </Text>

        {/* Descripción adicional SEO */}
        <Text
          marginBottom="2rem"
          textAlign="center"
          fontSize={{ base: '0.875rem', medium: '1rem' }}
          maxWidth="600px"
          style={{
            color: mode === 'dark' ? '#64748B' : '#64748B',
            lineHeight: '1.6'
          }}
        >
          {t('hero.description')}
        </Text>

        {/* Redes sociales */}
        <Flex
          direction="row"
          gap="2rem"
          marginTop="2rem"
          justifyContent="center"
        >
          <a 
            href="https://instagram.com/foor.rm" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label={t('hero.social.instagram')}
          >
            <img
              src="https://img.icons8.com/3d-fluency/94/instagram-new.png"
              alt={t('hero.social.instagram')}
              width={32}
              height={32}
              style={{
                transition: 'transform 0.2s',
                filter: mode === 'dark' ? 'brightness(0.9)' : 'none'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>
          <a 
            href="mailto:fortino.rom@gmail.com"
            aria-label={t('hero.social.email')}
          >
            <img
              src="https://img.icons8.com/3d-fluency/94/gmail.png"
              alt={t('hero.social.email')}
              width={32}
              height={32}
              style={{
                transition: 'transform 0.2s',
                filter: mode === 'dark' ? 'brightness(0.9)' : 'none'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>
          <a 
            href="https://linkedin.com/in/fortino-romero-mantilla" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label={t('hero.social.linkedin')}
          >
            <img
              src="https://img.icons8.com/3d-fluency/94/linkedin--v2.png"
              alt={t('hero.social.linkedin')}
              width={32}
              height={32}
              style={{
                transition: 'transform 0.2s',
                filter: mode === 'dark' ? 'brightness(0.9)' : 'none'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>
          <a 
            href="https://github.com/netfoor" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label={t('hero.social.github')}
          >
            <img
              src="https://img.icons8.com/3d-fluency/94/github.png"
              alt={t('hero.social.github')}
              width={32}
              height={32}
              style={{
                transition: 'transform 0.2s',
                filter: mode === 'dark' ? 'brightness(0.9)' : 'none'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>
        </Flex>

        {/* Schema.org JSON-LD para SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Fortino Romero Mantilla",
              "jobTitle": "Cloud Engineer",
              "description": "AWS Advocate and DevOps Enthusiast specializing in serverless architecture and cloud solutions",
              "url": "https://foor.dev",
              "sameAs": [
                "https://linkedin.com/in/fortino-romero-mantilla",
                "https://github.com/netfoor",
                "https://instagram.com/foor.rm"
              ],
              "knowsAbout": [
                "AWS",
                "Cloud Computing",
                "Serverless",
                "DevOps",
                "Infrastructure as Code",
                "Cloud Architecture"
              ]
            })
          }}
        />
      </Flex>
    </View>
  );
};

export default Hero;
