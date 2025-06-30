'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Heading } from '@aws-amplify/ui-react';
import { Quote } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';

// Tipos para los datos
type Profile = Schema["Profile"]["type"];

interface PhilosophySectionProps {
  className?: string;
}

// Estilos personalizados
const philosophyStyles = `
  .philosophy-section {
    margin-bottom: 4rem;
  }

  .philosophy-container {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      rgba(139, 92, 246, 0.05) 25%, 
      rgba(236, 72, 153, 0.05) 50%, 
      rgba(245, 101, 101, 0.05) 75%, 
      rgba(251, 191, 36, 0.1) 100%);
    border-radius: 24px;
    padding: 4rem;
    position: relative;
    overflow: hidden;
    margin-top: 2rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .philosophy-section.dark-mode .philosophy-container {
    background: linear-gradient(135deg, 
      rgba(30, 41, 59, 0.9) 0%, 
      rgba(51, 65, 85, 0.8) 25%, 
      rgba(71, 85, 105, 0.8) 50%, 
      rgba(100, 116, 139, 0.8) 75%, 
      rgba(148, 163, 184, 0.9) 100%);
    border: 1px solid rgba(148, 163, 184, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .philosophy-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .philosophy-section.dark-mode .philosophy-container::before {
    background: radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 60%);
  }

  .philosophy-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
  }

  .philosophy-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, 
      rgba(139, 92, 246, 0.2) 0%, 
      rgba(236, 72, 153, 0.2) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2rem;
    border: 3px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .philosophy-icon:hover {
    transform: scale(1.1);
    box-shadow: 0 15px 35px rgba(139, 92, 246, 0.3);
  }

  .philosophy-quote {
    color: var(--amplify-colors-font-primary);
    font-size: 1.25rem;
    line-height: 1.8;
    font-weight: 400;
    font-style: italic;
    position: relative;
    margin-bottom: 2rem;
  }

  .philosophy-section.dark-mode .philosophy-quote {
    color: #E2E8F0;
  }

  .philosophy-quote::before {
    content: '"';
    position: absolute;
    left: -30px;
    top: -10px;
    font-size: 4rem;
    color: rgba(139, 92, 246, 0.3);
    font-family: Georgia, serif;
    line-height: 1;
  }

  .philosophy-section.dark-mode .philosophy-quote::before {
    color: rgba(139, 92, 246, 0.5);
  }

  .philosophy-quote::after {
    content: '"';
    position: absolute;
    right: -30px;
    bottom: -30px;
    font-size: 4rem;
    color: rgba(139, 92, 246, 0.3);
    font-family: Georgia, serif;
    line-height: 1;
  }

  .philosophy-section.dark-mode .philosophy-quote::after {
    color: rgba(139, 92, 246, 0.5);
  }

  .philosophy-author {
    color: var(--amplify-colors-font-secondary);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 1.5rem;
  }

  .philosophy-section.dark-mode .philosophy-author {
    color: #94A3B8;
  }

  .philosophy-decoration {
    width: 100px;
    height: 2px;
    background: linear-gradient(to right, 
      rgba(139, 92, 246, 0.5) 0%, 
      rgba(236, 72, 153, 0.5) 100%);
    margin: 2rem auto;
    border-radius: 1px;
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

  .philosophy-section.dark-mode .section-title {
    background: linear-gradient(135deg, 
      #60A5FA 0%, 
      #A78BFA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    .philosophy-container {
      padding: 2.5rem 2rem;
    }
    
    .philosophy-icon {
      width: 60px;
      height: 60px;
    }
    
    .philosophy-quote {
      font-size: 1.125rem;
      line-height: 1.7;
    }
    
    .philosophy-quote::before,
    .philosophy-quote::after {
      font-size: 3rem;
    }
    
    .philosophy-quote::before {
      left: -20px;
      top: -5px;
    }
    
    .philosophy-quote::after {
      right: -20px;
      bottom: -25px;
    }
    
    .philosophy-author {
      font-size: 0.9rem;
    }
  }
`;

// Texto predeterminado de filosofía - ahora usaremos las traducciones
const defaultPhilosophyText = "";

const PhilosophySection: React.FC<PhilosophySectionProps> = ({ className = '' }) => {
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
      console.error('Error fetching profile for philosophy:', err);
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

  const philosophyText = profile?.philosophy || t('about.philosophy.description');

  return (
    <View className={`philosophy-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
      <style>{philosophyStyles}</style>
      
      {/* Header */}
      <Heading
        level={2}
        fontSize={{ base: '2rem', medium: '2.5rem' }}
        className="section-title"
      >
        {t('about.philosophy.title')}
      </Heading>

      {/* Philosophy Container */}
      <View className="philosophy-container">
        <View className="philosophy-content">
          {/* Icon */}
          <View className="philosophy-icon">
            <Quote size={32} color="rgba(139, 92, 246, 0.8)" />
          </View>

          {/* Quote */}
          <Text className="philosophy-quote">
            {philosophyText}
          </Text>

          {/* Decoration line */}
          <View className="philosophy-decoration" />

          {/* Author */}
          <Text className="philosophy-author">
            {t('about.philosophy.author')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PhilosophySection;
