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
  .mission-vision-section {
    margin-bottom: 4rem;
  }

  .mission-vision-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 2rem;
  }

  .mission-card, .vision-card {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.15) 0%, 
      rgba(255, 255, 255, 0.1) 100%);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 2.5rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: default;
  }

  .mission-vision-section.dark-mode .mission-card, 
  .mission-vision-section.dark-mode .vision-card {
    background: linear-gradient(135deg, 
      rgba(30, 41, 59, 0.9) 0%, 
      rgba(51, 65, 85, 0.8) 100%);
    border: 1px solid rgba(148, 163, 184, 0.3);
    backdrop-filter: blur(15px);
  }

  .mission-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.15) 0%, 
      rgba(139, 92, 246, 0.1) 100%);
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
      rgba(139, 92, 246, 0.15) 0%, 
      rgba(236, 72, 153, 0.1) 100%);
    pointer-events: none;
    z-index: 0;
  }

  .mission-card:hover, .vision-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .mission-card:hover::before {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.2) 0%, 
      rgba(139, 92, 246, 0.15) 100%);
  }

  .vision-card:hover::before {
    background: linear-gradient(135deg, 
      rgba(139, 92, 246, 0.2) 0%, 
      rgba(236, 72, 153, 0.15) 100%);
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2rem;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.3) 0%, 
      rgba(255, 255, 255, 0.2) 100%);
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .mission-card:hover .card-icon {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.4) 0%, 
      rgba(139, 92, 246, 0.3) 100%);
    box-shadow: 0 12px 25px rgba(59, 130, 246, 0.2);
  }

  .vision-card:hover .card-icon {
    background: linear-gradient(135deg, 
      rgba(139, 92, 246, 0.4) 0%, 
      rgba(236, 72, 153, 0.3) 100%);
    box-shadow: 0 12px 25px rgba(139, 92, 246, 0.2);
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

  .mission-vision-section.dark-mode .card-title {
    color: #F1F5F9;
  }

  .card-description {
    color: var(--amplify-colors-font-secondary);
    font-size: 1rem;
    line-height: 1.6;
    text-align: left;
  }

  .mission-vision-section.dark-mode .card-description {
    color: #CBD5E1;
  }

  .section-title {
    background: linear-gradient(135deg, 
      var(--amplify-colors-primary-80) 0%, 
      var(--amplify-colors-secondary-80) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    text-align: center;
    margin-bottom: 1rem;
  }

  .mission-vision-section.dark-mode .section-title {
    background: linear-gradient(135deg, 
      #60A5FA 0%, 
      #A78BFA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
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
    <View className={`mission-vision-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
      <style>{missionVisionStyles}</style>
      
      {/* Header */}
      <Flex direction="column" alignItems="center">
        <Heading
          level={2}
          fontSize={{ base: '2rem', medium: '2.5rem' }}
          className="section-title"
        >
          {t('about.journey.title')}
        </Heading>
      </Flex>

      {/* Mission and Vision Cards */}
      <View className="mission-vision-grid">
        {/* Mission Card */}
        <Card className="mission-card">
          <View className="card-content">
            <View className="card-icon">
              <span className="card-emoji">{t('about.journey.mission.icon')}</span>
            </View>
            <Heading level={3} className="card-title">
              {t('about.journey.mission.title')}
            </Heading>
            <Text className="card-description">
              {missionText}
            </Text>
          </View>
        </Card>

        {/* Vision Card */}
        <Card className="vision-card">
          <View className="card-content">
            <View className="card-icon">
              <span className="card-emoji">{t('about.journey.vision.icon')}</span>
            </View>
            <Heading level={3} className="card-title">
              {t('about.journey.vision.title')}
            </Heading>
            <Text className="card-description">
              {visionText}
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );
};

export default MissionVisionSection;
