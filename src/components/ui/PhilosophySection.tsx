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
    background-color: var(--amplify-colors-background-tertiary);
    border-radius: 16px;
    padding: 3rem;
    position: relative;
    overflow: hidden;
    margin-top: 2rem;
    border: 1px solid var(--amplify-colors-border-primary);
    box-shadow: var(--amplify-shadows-medium);
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
      var(--amplify-colors-brand-secondary-20) 0%, 
      var(--amplify-colors-brand-tertiary-20) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2rem;
    border: 3px solid var(--amplify-colors-border-tertiary);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .philosophy-icon:hover {
    transform: scale(1.1);
    box-shadow: var(--amplify-shadows-medium);
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

  .philosophy-quote::before {
    content: '"';
    position: absolute;
    left: -30px;
    top: -10px;
    font-size: 4rem;
    color: var(--amplify-colors-brand-secondary-30);
    font-family: Georgia, serif;
    line-height: 1;
  }

  .philosophy-quote::after {
    content: '"';
    position: absolute;
    right: -30px;
    bottom: -30px;
    font-size: 4rem;
    color: var(--amplify-colors-brand-secondary-30);
    font-family: Georgia, serif;
    line-height: 1;
  }

  .philosophy-author {
    color: var(--amplify-colors-font-secondary);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 1.5rem;
  }

  .philosophy-decoration {
    width: 100px;
    height: 2px;
    background: linear-gradient(to right, 
      var(--amplify-colors-brand-secondary-50) 0%, 
      var(--amplify-colors-brand-tertiary-50) 100%);
    margin: 2rem auto;
    border-radius: 1px;
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

  const containerStyles = {
    background: mode === 'dark'
      ? 'rgba(51, 65, 85, 0.8)'
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: mode === 'dark'
      ? '1px solid rgba(148, 163, 184, 0.1)'
      : '1px solid rgba(203, 213, 225, 0.2)',
    borderRadius: '16px',
    padding: '3rem',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    marginTop: '2rem',
    boxShadow: mode === 'dark'
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  };

  const iconStyles = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: mode === 'dark'
      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))'
      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
    border: mode === 'dark'
      ? '3px solid rgba(148, 163, 184, 0.2)'
      : '3px solid rgba(203, 213, 225, 0.3)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  };

  const quoteColor = mode === 'dark' ? '#F8FAFC' : '#0F172A';
  const authorColor = mode === 'dark' ? '#CBD5E1' : '#64748B';
  const quoteAccentColor = mode === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)';
  const iconColor = mode === 'dark' ? '#A78BFA' : '#8B5CF6';

  const decorationStyles = {
    width: '100px',
    height: '2px',
    background: mode === 'dark'
      ? 'linear-gradient(to right, rgba(139, 92, 246, 0.5), rgba(168, 85, 247, 0.5))'
      : 'linear-gradient(to right, rgba(139, 92, 246, 0.4), rgba(168, 85, 247, 0.4))',
    margin: '2rem auto',
    borderRadius: '1px',
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
    <View className={`philosophy-section ${className}`}>
      <style>{philosophyStyles}</style>
      
      {/* Header */}
      <Text
        as="h2"
        fontSize={{ base: '2rem', medium: '2.5rem' }}
        fontWeight="700"
        textAlign="center"
        lineHeight="1.1"
        style={titleStyles}
      >
        {t('about.philosophy.title')}{' '}
        <span style={titleHighlightStyles}>
          {t('about.philosophy.titleHighlight')}
        </span>
      </Text>

      {/* Philosophy Container */}
      <View style={containerStyles}>
        <View style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center' as const,
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* Icon */}
          <View style={iconStyles}>
            <Quote size={32} color={iconColor} />
          </View>

          {/* Quote */}
          <Text 
            fontSize="1.25rem"
            lineHeight={1.8}
            fontWeight="400"
            fontStyle="italic"
            marginBottom="2rem"
            style={{ 
              color: quoteColor,
              position: 'relative'
            }}
          >
            {philosophyText}
          </Text>

          {/* Decoration line */}
          <View style={decorationStyles} />

          {/* Author */}
          <Text 
            fontSize="1rem"
            fontWeight="600"
            marginTop="1.5rem"
            style={{ 
              color: authorColor,
              textTransform: 'uppercase' as const,
              letterSpacing: '1px'
            }}
          >
            {t('about.philosophy.author')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PhilosophySection;
