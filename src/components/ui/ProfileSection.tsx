'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Heading, Badge, Loader, Alert } from '@aws-amplify/ui-react';
import { User, MapPin, Mail, Globe, Award, Star } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';

// Tipos para los datos
type Profile = Schema["Profile"]["type"];

interface ProfileSectionProps {
  className?: string;
}

// Estilos personalizados
const profileStyles = `
  .profile-content {
    position: relative;
    z-index: 1;
  }

  /* Responsive container padding for the profile card */
  .profile-card {
    padding: 2rem;
  }
  @media (max-width: 640px) {
    .profile-card {
      /* Reduce horizontal padding on small screens to use more width */
      padding-left: 1.25rem;
      padding-right: 1.25rem;
      padding-top: 1.25rem;
      padding-bottom: 1.25rem;
    }
  }

  .profile-image {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    border: 6px solid var(--amplify-colors-border-primary);
    box-shadow: var(--amplify-shadows-medium);
    transition: all 0.3s ease;
  }

  .profile-image:hover {
    transform: scale(1.05);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  }

  .profile-image-placeholder {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-color: var(--amplify-colors-brand-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 6px solid var(--amplify-colors-border-primary);
    box-shadow: var(--amplify-shadows-medium);
  }

  .flag-badge {
    background-color: var(--amplify-colors-brand-primary);
    color: var(--amplify-colors-font-inverse);
    border: none;
    border-radius: 20px;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0.25rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    cursor: default;
    box-shadow: var(--amplify-shadows-small);
  }

  .flag-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
  }

  .profile-name {
    color: var(--amplify-colors-font-primary);
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .current-position {
    color: var(--amplify-colors-font-secondary);
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .profile-description {
    color: var(--amplify-colors-font-primary);
    font-size: 1.125rem;
    line-height: 1.7;
    margin-bottom: 2.5rem;
    max-width: 800px;
  }

  .flags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .profile-section {
      padding: 2rem;
      text-align: center;
    }
    
    .profile-image, .profile-image-placeholder {
      width: 150px;
      height: 150px;
    }
    
    .profile-name {
      font-size: 2rem;
    }
    
    .current-position {
      font-size: 1rem;
      justify-content: center;
    }
    
    .profile-description {
      font-size: 1rem;
      text-align: left;
    }
    
    .flags-container {
      justify-content: center;
    }
  }
`;

const ProfileSection: React.FC<ProfileSectionProps> = ({ className = '' }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const { isAuthenticated } = useAuth();

  // Estilos dinámicos basados en el tema
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
    position: 'relative' as const,
    overflow: 'hidden' as const,
    marginBottom: '4rem',
    boxShadow: mode === 'dark'
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  };

  const imageStyles = {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: mode === 'dark' ? '6px solid rgba(148, 163, 184, 0.3)' : '6px solid rgba(203, 213, 225, 0.4)',
    boxShadow: mode === 'dark' 
      ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
      : '0 25px 50px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
  };

  const imagePlaceholderStyles = {
    ...imageStyles,
    backgroundColor: mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const nameColor = mode === 'dark' ? '#F8FAFC' : '#0F172A';
  const positionColor = mode === 'dark' ? '#CBD5E1' : '#64748B';
  const descriptionColor = mode === 'dark' ? '#E2E8F0' : '#334155';
  const loadingTextColor = mode === 'dark' ? '#CBD5E1' : '#64748B';

  const badgeStyles = {
    backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '20px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    cursor: 'default',
    boxShadow: mode === 'dark'
      ? '0 10px 25px rgba(59, 130, 246, 0.3)'
      : '0 10px 25px rgba(37, 99, 235, 0.2)',
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
        const profileData = profiles[0];
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(t('about.profile.error'));
    }
  };

  // Effect para cargar datos
  useEffect(() => {
    const loadData = async () => {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);

      try {
        await fetchProfile();
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError(t('about.profile.error'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted, isAuthenticated]);

  // Mostrar loader mientras carga
  if (!mounted || loading) {
    return (
      <View 
  className={`profile-card ${className}`}
        style={containerStyles}
      >
        <style>{profileStyles}</style>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          className="profile-content"
          minHeight="200px"
        >
          <Loader size="large" />
          <Text 
            fontSize="1.125rem" 
            marginTop="1rem"
            style={{ color: loadingTextColor }}
          >
            {t('about.profile.loading')}
          </Text>
        </Flex>
      </View>
    );
  }

  // Mostrar error si hay alguno
  if (error) {
    return (
      <View 
  className={`profile-card ${className}`}
        style={containerStyles}
      >
        <style>{profileStyles}</style>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          className="profile-content"
          minHeight="200px"
        >
          <Alert
            variation="error"
            isDismissible={false}
            hasIcon={true}
            heading={t('about.profile.error')}
          >
            {error}
          </Alert>
        </Flex>
      </View>
    );
  }

  // Si no hay datos de perfil, mostrar versión por defecto
  if (!profile) {
    return (
      <View 
  className={`profile-card ${className}`}
        style={containerStyles}
      >
        <style>{profileStyles}</style>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          className="profile-content"
          textAlign="center"
        >
          <View style={imagePlaceholderStyles}>
            <User size={60} color={mode === 'dark' ? '#A78BFA' : '#8B5CF6'} />
          </View>
          
          <Heading
            level={2}
            fontSize={{ base: '2.5rem', medium: '3rem' }}
            style={{ color: nameColor, fontWeight: '800', marginBottom: '0.5rem' }}
          >
            Fortino Romero Mantilla
          </Heading>
          
          <Text 
            fontSize="1.25rem"
            fontWeight="500"
            marginBottom="2rem"
            style={{ 
              color: positionColor,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Award size={20} />
            Software Engineer | AWS Advocate | MLOps Enthusiast
          </Text>
          
          <Text 
            fontSize="1.125rem"
            lineHeight={1.7}
            maxWidth="800px"
            style={{ color: descriptionColor }}
          >
            {t('about.description1')}
          </Text>
        </Flex>
      </View>
    );
  }

  return (
    <View 
  className={`profile-card ${className}`}
      style={containerStyles}
    >
      <style>{profileStyles}</style>
      <style jsx global>{`
        .profile-image {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          object-fit: cover;
          border: ${mode === 'dark' ? '6px solid rgba(148, 163, 184, 0.3)' : '6px solid rgba(203, 213, 225, 0.4)'};
          box-shadow: ${mode === 'dark' ? '0 25px 50px rgba(0, 0, 0, 0.3)' : '0 25px 50px rgba(0, 0, 0, 0.15)'};
          transition: all 0.3s ease;
        }
        .profile-image:hover {
          transform: scale(1.05);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }
        @media (max-width: 768px) {
          .profile-image {
            width: 150px;
            height: 150px;
          }
        }
      `}</style>
      <Flex 
        direction="column" 
        alignItems="center" 
        justifyContent="center"
        className="profile-content"
        textAlign="center"
      >
        {/* Imagen de perfil */}
        {profile.profilePhotoKey ? (
          <OptimizedImage
            s3Key={profile.profilePhotoKey}
            alt={profile.name || 'Profile'}
            className="profile-image"
          />
        ) : (
          <View style={imagePlaceholderStyles}>
            <User size={60} color={mode === 'dark' ? '#A78BFA' : '#8B5CF6'} />
          </View>
        )}
        
        {/* Nombre */}
        <Heading
          level={2}
          fontSize={{ base: '2.5rem', medium: '3rem' }}
          style={{ color: nameColor, fontWeight: '800', marginBottom: '0.5rem' }}
        >
          {profile.name || 'Fortino Romero Mantilla'}
        </Heading>
        
        {/* Posición actual */}
        <Text 
          fontSize="1.25rem"
          fontWeight="500"
          marginBottom="2rem"
          style={{ 
            color: positionColor,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Award size={20} />
          {profile.currentPosition || 'Software Engineer | AWS Advocate | MLOps Enthusiast'}
        </Text>
        
        {/* Descripción */}
        <Text 
          fontSize="1.125rem"
          lineHeight={1.7}
          marginBottom="2.5rem"
          maxWidth="800px"
          style={{ color: descriptionColor }}
        >
          {profile.description || t('about.description1')}
        </Text>
        
        {/* Flags/Badges */}
        {profile.flags && profile.flags.length > 0 && (
          <Flex 
            wrap="wrap"
            gap="0.5rem"
            justifyContent="center"
            marginTop="2rem"
          >
            {profile.flags.map((flag, index) => (
              <Badge key={index} style={badgeStyles}>
                <Star size={16} />
                {flag}
              </Badge>
            ))}
          </Flex>
        )}
      </Flex>
    </View>
  );
};

export default ProfileSection;
