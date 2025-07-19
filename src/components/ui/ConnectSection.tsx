'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Heading, Button } from '@aws-amplify/ui-react';
import { Linkedin, Github, Twitter, Mail, ExternalLink, Heart } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';

// Tipos para los datos
type Profile = Schema["Profile"]["type"];

interface ConnectSectionProps {
    className?: string;
}

// Estilos personalizados
const connectStyles = `
    .connect-section {
        margin-bottom: 4rem;
    }

    .connect-container {
        background-color: var(--amplify-colors-background-tertiary);
        border-radius: 16px;
        padding: 3rem;
        position: relative;
        overflow: hidden;
        margin-top: 2rem;
        text-align: center;
        border: 1px solid var(--amplify-colors-border-primary);
        box-shadow: var(--amplify-shadows-medium);
    }

    .connect-content {
        position: relative;
        z-index: 1;
        max-width: 800px;
        margin: 0 auto;
    }

    .connect-subtitle {
        color: var(--amplify-colors-font-secondary);
        font-size: 1.25rem;
        margin-bottom: 3rem;
        font-weight: 400;
    }

    .connect-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }

    .connect-button {
        background: linear-gradient(135deg, 
            var(--amplify-colors-background-secondary-hover) 0%, 
            var(--amplify-colors-background-secondary) 100%);
        backdrop-filter: blur(10px);
        border: 2px solid var(--amplify-colors-border-tertiary);
        border-radius: 16px;
        padding: 1.5rem;
        color: var(--amplify-colors-font-primary);
        text-decoration: none;
        transition: all 0.3s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        min-height: 140px;
        justify-content: center;
    }

    .connect-button:hover {
        transform: translateY(-5px);
        box-shadow: var(--amplify-shadows-medium);
        border-color: var(--amplify-colors-border-hover);
    }

    .connect-button-linkedin {
        border-color: #0A66C2;
    }

    .connect-button-linkedin:hover {
        background: linear-gradient(135deg, 
            rgba(10, 102, 194, 0.15) 0%, 
            rgba(10, 102, 194, 0.05) 100%);
        border-color: #0A66C2;
    }

    .connect-button-github {
        border-color: var(--amplify-colors-border-secondary);
    }

    .connect-button-github:hover {
        background: linear-gradient(135deg, 
            var(--amplify-colors-background-secondary-hover) 0%, 
            var(--amplify-colors-background-secondary) 100%);
        border-color: var(--amplify-colors-border-focus);
    }

    .connect-button-twitter {
        border-color: #1DA1F2;
    }

    .connect-button-twitter:hover {
        background: linear-gradient(135deg, 
            rgba(29, 161, 242, 0.15) 0%, 
            rgba(29, 161, 242, 0.05) 100%);
        border-color: #1DA1F2;
    }

    .connect-button-email {
        border-color: #EA580C;
    }

    .connect-button-email:hover {
        background: linear-gradient(135deg, 
            rgba(234, 88, 12, 0.15) 0%, 
            rgba(234, 88, 12, 0.05) 100%);
        border-color: #EA580C;
    }

    .connect-button-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, 
            var(--amplify-colors-background-secondary-hover) 0%, 
            var(--amplify-colors-background-secondary) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .connect-button:hover .connect-button-icon {
        transform: scale(1.1);
    }

    .connect-button-text {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
        color: var(--amplify-colors-font-primary);
    }

    .connect-button-description {
        font-size: 0.875rem;
        color: var(--amplify-colors-font-tertiary);
        margin: 0;
        text-align: center;
    }

    .connect-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--amplify-colors-border-primary);
    }

    .connect-footer-text {
        color: var(--amplify-colors-font-tertiary);
        font-size: 0.9rem;
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
        .connect-container {
            padding: 2.5rem 2rem;
        }
        
        .connect-buttons {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .connect-button {
            padding: 1.25rem;
            min-height: 120px;
        }
        
        .connect-button-icon {
            width: 35px;
            height: 35px;
        }
        
        .connect-subtitle {
            font-size: 1.125rem;
            margin-bottom: 2rem;
        }
    }
`;

// Enlaces predeterminados
const defaultLinks = {
    linkedin: "https://linkedin.com/in/fortino-romero-mantilla",
    github: "https://github.com/fortino-romero",
    twitter: "https://twitter.com/fortino_romero",
    email: "fortino.rom@gmail.com"
};

const ConnectSection: React.FC<ConnectSectionProps> = ({ className = '' }) => {
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
        textAlign: 'center' as const,
        boxShadow: mode === 'dark'
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    };

    const subtitleColor = mode === 'dark' ? '#CBD5E1' : '#64748B';
    const footerTextColor = mode === 'dark' ? '#94A3B8' : '#64748B';
    const heartColor = mode === 'dark' ? '#A78BFA' : '#8B5CF6';

    const getButtonStyles = (platform: string) => ({
        background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.8), rgba(51, 65, 85, 0.8))'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9))',
        backdropFilter: 'blur(10px)',
        border: mode === 'dark'
            ? `2px solid ${getBorderColor(platform, true)}`
            : `2px solid ${getBorderColor(platform, false)}`,
        borderRadius: '16px',
        padding: '1.5rem',
        color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '1rem',
        minHeight: '140px',
        justifyContent: 'center',
    });

    const getBorderColor = (platform: string, isDark: boolean) => {
        const colors = {
            linkedin: '#0A66C2',
            github: isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.4)',
            twitter: '#1DA1F2',
            email: '#EA580C'
        };
        return colors[platform as keyof typeof colors] || (isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.4)');
    };

    const getIconBackgroundStyles = () => ({
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.8), rgba(51, 65, 85, 0.8))'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
    });

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
            console.error('Error fetching profile for connect:', err);
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

    // Usar enlaces del perfil o predeterminados
    const links = {
        linkedin: profile?.linkedinUrl || defaultLinks.linkedin,
        github: profile?.githubUrl || defaultLinks.github,
        twitter: profile?.twitterUrl || defaultLinks.twitter,
        email: profile?.emailContact || defaultLinks.email
    };

    const handleEmailClick = () => {
        window.location.href = `mailto:${links.email}`;
    };

    const handleLinkClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

  return (
    <View className={`connect-section ${className}`}>
      <style>{connectStyles}</style>
      
      {/* Header */}
      <Text
        as="h2"
        fontSize={{ base: '2rem', medium: '2.5rem' }}
        fontWeight="700"
        textAlign="center"
        lineHeight="1.1"
        style={titleStyles}
      >
        {t('about.connect.title')}{' '}
        <span style={titleHighlightStyles}>
          {t('about.connect.titleHighlight')}
        </span>
      </Text>

      {/* Connect Container */}
      <View style={containerStyles}>
        <View style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Subtitle */}
          <Text 
            fontSize="1.25rem"
            marginBottom="3rem"
            fontWeight="400"
            style={{ color: subtitleColor }}
          >
            {t('about.connect.subtitle')}
          </Text>

          {/* Social Buttons */}
          <View style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {/* LinkedIn */}
            <button
              style={getButtonStyles('linkedin')}
              onClick={() => handleLinkClick(links.linkedin)}
            >
              <View style={getIconBackgroundStyles()}>
                <Linkedin size={20} color="#0A66C2" />
              </View>
              <Text 
                fontSize="1rem"
                fontWeight="600"
                margin="0"
                style={{ color: mode === 'dark' ? '#F8FAFC' : '#0F172A' }}
              >
                {t('about.connect.actions.linkedin')}
              </Text>
              <Text 
                fontSize="0.875rem"
                margin="0"
                textAlign="center"
                style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
              >
                Professional networking
              </Text>
            </button>

            {/* GitHub */}
            <button
              style={getButtonStyles('github')}
              onClick={() => handleLinkClick(links.github)}
            >
              <View style={getIconBackgroundStyles()}>
                <Github size={20} color={mode === 'dark' ? '#F8FAFC' : '#0F172A'} />
              </View>
              <Text 
                fontSize="1rem"
                fontWeight="600"
                margin="0"
                style={{ color: mode === 'dark' ? '#F8FAFC' : '#0F172A' }}
              >
                {t('about.connect.actions.github')}
              </Text>
              <Text 
                fontSize="0.875rem"
                margin="0"
                textAlign="center"
                style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
              >
                Code repositories
              </Text>
            </button>

            {/* Twitter */}
            <button
              style={getButtonStyles('twitter')}
              onClick={() => handleLinkClick(links.twitter)}
            >
              <View style={getIconBackgroundStyles()}>
                <Twitter size={20} color="#1DA1F2" />
              </View>
              <Text 
                fontSize="1rem"
                fontWeight="600"
                margin="0"
                style={{ color: mode === 'dark' ? '#F8FAFC' : '#0F172A' }}
              >
                {t('about.connect.actions.twitter')}
              </Text>
              <Text 
                fontSize="0.875rem"
                margin="0"
                textAlign="center"
                style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
              >
                Tech thoughts & updates
              </Text>
            </button>

            {/* Email */}
            <button
              style={getButtonStyles('email')}
              onClick={handleEmailClick}
            >
              <View style={getIconBackgroundStyles()}>
                <Mail size={20} color="#EA580C" />
              </View>
              <Text 
                fontSize="1rem"
                fontWeight="600"
                margin="0"
                style={{ color: mode === 'dark' ? '#F8FAFC' : '#0F172A' }}
              >
                {t('about.connect.actions.email')}
              </Text>
              <Text 
                fontSize="0.875rem"
                margin="0"
                textAlign="center"
                style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
              >
                Direct collaboration
              </Text>
            </button>
          </View>

          {/* Footer */}
          <View style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)'
          }}>
            <Heart size={16} color={heartColor} />
            <Text 
              fontSize="0.9rem"
              style={{ color: footerTextColor }}
            >
              Let's build something amazing together
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ConnectSection;
