'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Heading, Loader, Alert } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import type { SupportedLocale } from '@/lib/i18n/types';
import ProfileSection from './ProfileSection';
import MissionVisionSection from './MissionVisionSection';
import ExperienceTimeline from './ExperienceTimeline';
import PhilosophySection from './PhilosophySection';
import ConnectSection from './ConnectSection';

// Tipos para los datos
type Profile = Schema["Profile"]["type"];
type Experience = Schema["Experiences"]["type"];

interface AboutSectionProps {
  locale: SupportedLocale;
  className?: string;
}

// Estilos personalizados
const aboutStyles = `
  .about-container {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      rgba(139, 92, 246, 0.05) 25%, 
      rgba(236, 72, 153, 0.05) 50%, 
      rgba(245, 101, 101, 0.05) 75%, 
      rgba(251, 191, 36, 0.1) 100%);
    min-height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .about-container.dark-mode {
    background: linear-gradient(135deg, 
      rgba(15, 23, 42, 1) 0%, 
      rgba(30, 41, 59, 0.98) 25%, 
      rgba(51, 65, 85, 0.95) 50%, 
      rgba(71, 85, 105, 0.98) 75%, 
      rgba(100, 116, 139, 1) 100%);
  }

  .about-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .about-content {
    position: relative;
    z-index: 1;
    padding-bottom: 120px;
  }

  .section-spacing {
    margin-bottom: 4rem;
  }

  @media (max-width: 768px) {
    .section-spacing {
      margin-bottom: 3rem;
    }
    
    .about-content {
      padding-bottom: 80px;
    }
  }
`;

const AboutSection: React.FC<AboutSectionProps> = ({ locale, className = '' }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const { isAuthenticated } = useAuth();

  // Client initialization
  const client = generateClient<Schema>();

  // Effect para marcar como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para obtener datos del perfil
  const fetchProfile = async () => {
    try {
      const authMode = isAuthenticated ? 'userPool' : 'identityPool';
      const { data: profiles } = await client.models.Profile.list({
        authMode,
        filter: {
          isActive: {
            eq: true
          }
        }
      });

      if (profiles && profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    }
  };

  // Función para obtener experiencias
  const fetchExperiences = async () => {
    try {
      const authMode = isAuthenticated ? 'userPool' : 'identityPool';
      const { data: experienceData } = await client.models.Experiences.list({
        authMode
      });

      if (experienceData) {
        // Ordenar por fecha de inicio (más reciente primero)
        const sortedExperiences = [...experienceData].sort((a, b) => {
          if (!a.startDate || !b.startDate) return 0;
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
        setExperiences(sortedExperiences);
      }
    } catch (err) {
      console.error('Error fetching experiences:', err);
      setError('Failed to load experience data');
    }
  };

  // Effect para cargar datos
  useEffect(() => {
    const loadData = async () => {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchProfile(),
          fetchExperiences()
        ]);
      } catch (err) {
        console.error('Error loading about data:', err);
        setError('Failed to load about data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted, isAuthenticated]);

  // Mostrar loader mientras carga
  if (!mounted || loading) {
    return (
      <View className={`about-container ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
        <style>{aboutStyles}</style>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          className="about-content"
          minHeight="50vh"
        >
          <Loader size="large" />
          <Text 
            fontSize="1.125rem" 
            color="var(--amplify-colors-font-tertiary)"
            marginTop="1rem"
          >
            Loading about information...
          </Text>
        </Flex>
      </View>
    );
  }

  // Mostrar error si hay alguno
  if (error) {
    return (
      <View className={`about-container ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
        <style>{aboutStyles}</style>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          className="about-content"
          minHeight="50vh"
          padding="2rem"
        >
          <Alert
            variation="error"
            isDismissible={false}
            hasIcon={true}
            heading="Error loading about information"
          >
            {error}
          </Alert>
        </Flex>
      </View>
    );
  }

  return (
    <View className={`about-container ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
      <style>{aboutStyles}</style>
      <View className="about-content">
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="flex-start"
          padding={{ base: '2rem', medium: '4rem' }}
          maxWidth="1200px"
          margin="0 auto"
        >
          {/* Header */}
            <Flex
            direction="column"
            alignItems="center"
            textAlign="center"
            marginBottom="4rem"
            >
            <Text
              as="h1"
              fontSize={{ base: '2rem', medium: '2.5rem' }}
              fontWeight="700"
              textAlign="center"
              lineHeight="1.1"
              style={{
                backgroundImage: mode === 'dark'
                  ? 'linear-gradient(135deg, #93C5FD, #60A5FA)'
                  : 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem',
              }}
            >
              {t('about.title')}{' '}
              <span style={{ 
                backgroundImage: mode === 'dark'
                  ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                  : 'linear-gradient(135deg, #2563EB, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {t('about.titleHighlight')}
              </span>
            </Text>
            <Text
              fontSize={{ base: '1rem', medium: '1.125rem' }}
              textAlign="center"
              maxWidth="600px"
              style={{
                color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                lineHeight: 1.6,
              }}
            >
              {t('about.subtitle')}
            </Text>
            </Flex>

          {/* Profile Section */}
          <ProfileSection className="section-spacing" />

          {/* Mission and Vision Section */}
          <MissionVisionSection className="section-spacing" />

          {/* Experience Timeline */}
          <ExperienceTimeline className="section-spacing" />

          {/* Philosophy Section */}
          <PhilosophySection className="section-spacing" />

          {/* Connect Section */}
          <ConnectSection className="section-spacing" />
          
        </Flex>
      </View>
    </View>
  );
};

export default AboutSection;
