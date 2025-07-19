'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Heading, Card } from '@aws-amplify/ui-react';
import { Target, Rocket } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';

// Tipos para los datos
type Profile = Schema["Profile"]["type"];

interface MissionVisionSectionProps {
  className?: string;
}

// Estilos personalizados
const missionVisionStyles = `
  .mission-vision-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 2rem;
  }

  .mission-card, .vision-card {
    background-color: var(--amplify-colors-background-tertiary);
    border: 1px solid var(--amplify-colors-border-primary);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: default;
    box-shadow: var(--amplify-shadows-small);
  }

  .mission-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      var(--amplify-colors-brand-primary-10) 0%, 
      var(--amplify-colors-brand-secondary-10) 100%);
    pointer-events: none;
    z-index: 0;
  }

  .vision-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      var(--amplify-colors-brand-secondary-10) 0%, 
      var(--amplify-colors-brand-tertiary-10) 100%);
    pointer-events: none;
    z-index: 0;
  }

  .mission-card:hover, .vision-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--amplify-shadows-medium);
  }

  .mission-card:hover::before {
    background: linear-gradient(135deg, 
      var(--amplify-colors-brand-primary-20) 0%, 
      var(--amplify-colors-brand-secondary-20) 100%);
  }

  .vision-card:hover::before {
    background: linear-gradient(135deg, 
      var(--amplify-colors-brand-secondary-20) 0%, 
      var(--amplify-colors-brand-tertiary-20) 100%);
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--amplify-colors-background-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    border: 1px solid var(--amplify-colors-border-secondary);
    transition: all 0.3s ease;
    box-shadow: var(--amplify-shadows-small);
  }

  .mission-card:hover .card-icon {
    background: linear-gradient(135deg, 
      var(--amplify-colors-brand-primary-40) 0%, 
      var(--amplify-colors-brand-secondary-30) 100%);
    box-shadow: var(--amplify-shadows-medium);
  }

  .vision-card:hover .card-icon {
    background: linear-gradient(135deg, 
      var(--amplify-colors-brand-secondary-40) 0%, 
      var(--amplify-colors-brand-tertiary-30) 100%);
    box-shadow: var(--amplify-shadows-medium);
  }

  .card-emoji {
    font-size: 1.8rem;
    display: block;
  }

  .card-title {
    color: var(--amplify-colors-font-primary);
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-align: center;
  }

  .card-description {
    color: var(--amplify-colors-font-secondary);
    font-size: 1rem;
    line-height: 1.6;
    text-align: left;
  }

  .section-title {
    background: linear-gradient(135deg, 
      var(--amplify-colors-brand-primary-80) 0%, 
      var(--amplify-colors-brand-secondary-80) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    text-align: center;
    margin-bottom: 1rem;
  }

  .section-subtitle {
    color: var(--amplify-colors-font-secondary);
    font-size: 1.125rem;
    text-align: center;
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 768px) {
    .mission-vision-grid {
      grid-template-columns: 1fr;
    }
    
    .mission-card, .vision-card {
      padding: 2rem;
    }
    
    .card-icon {
      width: 50px;
      height: 50px;
    }
    
    .card-emoji {
      font-size: 1.5rem;
    }
    
    .card-title {
      font-size: 1.25rem;
    }
    
    .card-description {
      font-size: 0.95rem;
    }
  }
`;

// Datos predeterminados - ahora usaremos las traducciones
const defaultMissionText = "";
const defaultVisionText = "";

const MissionVisionSection: React.FC<MissionVisionSectionProps> = ({ className = '' }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const { isAuthenticated } = useAuth();

  // Estilos dinámicos basados en el tema
  const titleStyles = {
    backgroundImage: mode === 'dark'
      ? 'linear-gradient(135deg, #93C5FD, #60A5FA)'
      : 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1.5rem',
  };

  const titleHighlightStyles = {
    backgroundImage: mode === 'dark'
      ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
      : 'linear-gradient(135deg, #2563EB, #3B82F6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const missionCardStyles = {
    background: mode === 'dark'
      ? 'rgba(51, 65, 85, 0.8)'
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: mode === 'dark'
      ? '1px solid rgba(148, 163, 184, 0.1)'
      : '1px solid rgba(203, 213, 225, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    transition: 'all 0.3s ease',
    cursor: 'default',
    boxShadow: mode === 'dark'
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  };

  const visionCardStyles = {
    ...missionCardStyles,
  };

  const cardIconStyles = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: mode === 'dark'
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    border: mode === 'dark'
      ? '1px solid rgba(148, 163, 184, 0.2)'
      : '1px solid rgba(203, 213, 225, 0.3)',
    transition: 'all 0.3s ease',
    boxShadow: mode === 'dark'
      ? '0 10px 25px rgba(0, 0, 0, 0.2)'
      : '0 10px 25px rgba(0, 0, 0, 0.1)',
  };

  const cardTitleColor = mode === 'dark' ? '#F8FAFC' : '#0F172A';
  const cardDescriptionColor = mode === 'dark' ? '#CBD5E1' : '#64748B';

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
    gap: '2rem',
    marginTop: '2rem',
  };

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
      console.error('Error fetching profile for mission/vision:', err);
      // No mostrar error, usar datos predeterminados
    }
  };

  // Effect para cargar datos
  useEffect(() => {
    if (!mounted) return;
    fetchProfile();
  }, [mounted, isAuthenticated]);

  if (!mounted) {
    return null;
  }

  const missionText = profile?.mission || t('about.journey.mission.description');
  const visionText = profile?.vision || t('about.journey.vision.description');

  return (
    <View className={className}>
      <style>{missionVisionStyles}</style>
      
      {/* Header */}
      <Flex direction="column" alignItems="center">
        <Text
          as="h2"
          fontSize={{ base: '2rem', medium: '2.5rem' }}
          fontWeight="700"
          textAlign="center"
          lineHeight="1.1"
          style={titleStyles}
        >
          {t('about.journey.title')}{' '}
          <span style={titleHighlightStyles}>
            {t('about.journey.titleHighlight')}
          </span>
        </Text>
      </Flex>

      {/* Mission and Vision Cards */}
      <View style={gridStyles}>
        {/* Mission Card */}
        <View style={missionCardStyles}>
          <View style={{ position: 'relative', zIndex: 1 }}>
            <View style={cardIconStyles}>
              <span style={{ fontSize: '1.8rem' }}>{t('about.journey.mission.icon')}</span>
            </View>
            <Heading 
              level={3} 
              fontSize="1.5rem"
              fontWeight="700"
              marginBottom="1rem"
              textAlign="center"
              style={{ color: cardTitleColor }}
            >
              {t('about.journey.mission.title')}
            </Heading>
            <Text 
              fontSize="1rem"
              lineHeight={1.6}
              textAlign="left"
              style={{ color: cardDescriptionColor }}
            >
              {missionText}
            </Text>
          </View>
        </View>

        {/* Vision Card */}
        <View style={visionCardStyles}>
          <View style={{ position: 'relative', zIndex: 1 }}>
            <View style={cardIconStyles}>
              <span style={{ fontSize: '1.8rem' }}>{t('about.journey.vision.icon')}</span>
            </View>
            <Heading 
              level={3} 
              fontSize="1.5rem"
              fontWeight="700"
              marginBottom="1rem"
              textAlign="center"
              style={{ color: cardTitleColor }}
            >
              {t('about.journey.vision.title')}
            </Heading>
            <Text 
              fontSize="1rem"
              lineHeight={1.6}
              textAlign="left"
              style={{ color: cardDescriptionColor }}
            >
              {visionText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MissionVisionSection;
