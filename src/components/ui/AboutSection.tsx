'use client';

import React from 'react';
import { Heading, Text, Flex, View, Card } from '@aws-amplify/ui-react';
import { useTranslation } from '@/lib/i18n/client';
import { useTheme } from '@/hooks/useTheme';

interface AboutSectionProps {
  className?: string;
}

/**
 * Componente AboutSection - Sección sobre el perfil profesional
 * Enfocado en: AWS Cloud Engineer, experiencia internacional, liderazgo comunitario
 * SEO optimizado con headings estructurados y contenido relevante
 */
export const AboutSection: React.FC<AboutSectionProps> = ({ className = '' }) => {
  const { t } = useTranslation('homepage');
  const { mode } = useTheme();

  return (
    <View 
      as="section"
      id="about"
      className={className}
      padding={{ base: "3rem 1rem", medium: "4rem 2rem" }}
      style={{
        background: mode === 'dark' 
          ? 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
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
            radial-gradient(circle at 20% 80%, #3B82F6 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, #06B6D4 0%, transparent 50%)
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
          direction={{ base: 'column', large: 'row' }}
          gap={{ base: '2rem', large: '3rem' }}
          alignItems="flex-start"
        >
          {/* Left column - Main content */}
          <View flex={{ large: '7' }}>            <Heading
              level={2}
              fontSize={{ base: "1.75rem", medium: "2.25rem" }}
              fontWeight="700"
              marginBottom="1.5rem"
              style={{
                backgroundImage: mode === 'dark'
                  ? 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)'
                  : 'linear-gradient(135deg, #1E293B 0%, #3B82F6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}
            >
              {t('about.whoAmI')} <Text as="span" color="primary.80">{t('about.whoAmIHighlight')}</Text>
            </Heading>

            <Flex direction="column" gap="1.5rem" marginBottom="2rem">
              <Text
                color={mode === 'dark' ? '#CBD5E1' : '#475569'}
                lineHeight="1.7"
                fontSize={{ base: "1rem", medium: "1.125rem" }}
              >
                {t('about.description1')}
              </Text>
              <Text
                color={mode === 'dark' ? '#CBD5E1' : '#475569'}
                lineHeight="1.7"
                fontSize={{ base: "1rem", medium: "1.125rem" }}
              >
                {t('about.description2')}
              </Text>
            </Flex>

            {/* Quote section */}
            <View
              padding="1.5rem"
              marginBlock="2rem"
              style={{
                borderLeft: `4px solid ${mode === 'dark' ? '#3B82F6' : '#2563EB'}`,
                background: mode === 'dark' 
                  ? 'rgba(30, 41, 59, 0.5)' 
                  : 'rgba(248, 250, 252, 0.8)',
                borderRadius: '0 8px 8px 0',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Text
                color={mode === 'dark' ? '#E2E8F0' : '#334155'}
                fontStyle="italic"
                fontSize={{ base: "1rem", medium: "1.125rem" }}
                lineHeight="1.6"
              >
                "{t('about.quote')}"
              </Text>
            </View>
          </View>

          {/* Right column - Highlights */}
          <View flex={{ large: '5' }}>
            <Card
              padding="2rem"
              borderRadius="16px"
              style={{
                background: mode === 'dark' 
                  ? 'rgba(30, 41, 59, 0.6)' 
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: mode === 'dark' 
                  ? '1px solid rgba(71, 85, 105, 0.3)' 
                  : '1px solid rgba(226, 232, 240, 0.5)',
                boxShadow: mode === 'dark'
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <Heading
                level={3}
                fontSize={{ base: "1.25rem", medium: "1.5rem" }}
                fontWeight="600"
                color={mode === 'dark' ? '#F1F5F9' : '#1E293B'}
                marginBottom="1.5rem"
              >
                {t('about.highlights.title')}
              </Heading>
              
              <Flex direction="column" gap="1.25rem">                {/* Japan Highlight */}
                <Flex alignItems="flex-start" gap="1rem">
                  <View style={{ flexShrink: 0, fontSize: "1.5rem" }}>🇯🇵</View>
                  <View>
                    <Text
                      color={mode === 'dark' ? '#F1F5F9' : '#1E293B'}
                      fontWeight="600"
                      fontSize={{ base: "0.95rem", medium: "1rem" }}
                      marginBottom="0.25rem"
                    >
                      {t('about.highlights.japan.title')}
                    </Text>
                    <Text 
                      color={mode === 'dark' ? '#94A3B8' : '#64748B'}
                      fontSize={{ base: "0.875rem", medium: "0.95rem" }}
                      lineHeight="1.5"
                    >
                      {t('about.highlights.japan.description')}
                    </Text>
                  </View>
                </Flex>                {/* Award Highlight */}
                <Flex alignItems="flex-start" gap="1rem">
                  <View style={{ flexShrink: 0, fontSize: "1.5rem" }}>🏆</View>
                  <View>
                    <Text
                      color={mode === 'dark' ? '#F1F5F9' : '#1E293B'}
                      fontWeight="600"
                      fontSize={{ base: "0.95rem", medium: "1rem" }}
                      marginBottom="0.25rem"
                    >
                      {t('about.highlights.award.title')}
                    </Text>
                    <Text 
                      color={mode === 'dark' ? '#94A3B8' : '#64748B'}
                      fontSize={{ base: "0.875rem", medium: "0.95rem" }}
                      lineHeight="1.5"
                    >
                      {t('about.highlights.award.description')}
                    </Text>
                  </View>
                </Flex>                {/* Community Highlight */}
                <Flex alignItems="flex-start" gap="1rem">
                  <View style={{ flexShrink: 0, fontSize: "1.5rem" }}>🌍</View>
                  <View>
                    <Text
                      color={mode === 'dark' ? '#F1F5F9' : '#1E293B'}
                      fontWeight="600"
                      fontSize={{ base: "0.95rem", medium: "1rem" }}
                      marginBottom="0.25rem"
                    >
                      {t('about.highlights.community.title')}
                    </Text>
                    <Text 
                      color={mode === 'dark' ? '#94A3B8' : '#64748B'}
                      fontSize={{ base: "0.875rem", medium: "0.95rem" }}
                      lineHeight="1.5"
                    >
                      {t('about.highlights.community.description')}
                    </Text>
                  </View>
                </Flex>                {/* Speaker Highlight */}
                <Flex alignItems="flex-start" gap="1rem">
                  <View style={{ flexShrink: 0, fontSize: "1.5rem" }}>💬</View>
                  <View>
                    <Text
                      color={mode === 'dark' ? '#F1F5F9' : '#1E293B'}
                      fontWeight="600"
                      fontSize={{ base: "0.95rem", medium: "1rem" }}
                      marginBottom="0.25rem"
                    >
                      {t('about.highlights.speaker.title')}
                    </Text>
                    <Text 
                      color={mode === 'dark' ? '#94A3B8' : '#64748B'}
                      fontSize={{ base: "0.875rem", medium: "0.95rem" }}
                      lineHeight="1.5"
                    >
                      {t('about.highlights.speaker.description')}
                    </Text>
                  </View>
                </Flex>                {/* Academic Highlight */}
                <Flex alignItems="flex-start" gap="1rem">
                  <View style={{ flexShrink: 0, fontSize: "1.5rem" }}>📖</View>
                  <View>
                    <Text
                      color={mode === 'dark' ? '#F1F5F9' : '#1E293B'}
                      fontWeight="600"
                      fontSize={{ base: "0.95rem", medium: "1rem" }}
                      marginBottom="0.25rem"
                    >
                      {t('about.highlights.academic.title')}
                    </Text>
                    <Text 
                      color={mode === 'dark' ? '#94A3B8' : '#64748B'}
                      fontSize={{ base: "0.875rem", medium: "0.95rem" }}
                      lineHeight="1.5"
                    >
                      {t('about.highlights.academic.description')}
                    </Text>
                  </View>
                </Flex>
              </Flex>
            </Card>
          </View>
        </Flex>
      </View>
    </View>
  );
};

export default AboutSection;
