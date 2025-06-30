'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Heading, Badge, Loader, Alert, Image } from '@aws-amplify/ui-react';
import { User, MapPin, Mail, Globe, Award, Star } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';

// Tipos para los datos
type Profile = Schema["Profile"]["type"];

interface ProfileSectionProps {
  className?: string;
}

// Estilos personalizados
const profileStyles = `
  .profile-section {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.15) 0%, 
      rgba(139, 92, 246, 0.1) 50%, 
      rgba(236, 72, 153, 0.15) 100%);
    border-radius: 24px;
    padding: 3rem;
    position: relative;
    overflow: hidden;
    margin-bottom: 4rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .profile-section.dark-mode {
    background: linear-gradient(135deg, 
      rgba(30, 41, 59, 0.9) 0%, 
      rgba(51, 65, 85, 0.8) 50%, 
      rgba(71, 85, 105, 0.9) 100%);
    border: 1px solid rgba(148, 163, 184, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .profile-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .profile-section.dark-mode::before {
    background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%);
  }

  .profile-content {
    position: relative;
    z-index: 1;
  }

  .profile-image {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    border: 6px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
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
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.4) 0%, 
      rgba(139, 92, 246, 0.4) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 6px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .flag-badge {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 1) 0%, 
      rgba(139, 92, 246, 1) 100%);
    color: white;
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
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .dark-mode .flag-badge {
    background: linear-gradient(135deg, 
      rgba(99, 102, 241, 0.9) 0%, 
      rgba(168, 85, 247, 0.9) 100%);
    color: #F1F5F9;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
  }

  .flag-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
  }

  .dark-mode .flag-badge:hover {
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.6);
  }

  .profile-name {
    background: linear-gradient(135deg, 
      var(--amplify-colors-primary-80) 0%, 
      var(--amplify-colors-secondary-80) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .dark-mode .profile-name {
    background: linear-gradient(135deg, 
      #60A5FA 0%, 
      #A78BFA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
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

  .dark-mode .current-position {
    color: #CBD5E1;
  }

  .profile-description {
    color: var(--amplify-colors-font-primary);
    font-size: 1.125rem;
    line-height: 1.7;
    margin-bottom: 2.5rem;
    max-width: 800px;
  }

  .dark-mode .profile-description {
    color: #E2E8F0;
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
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
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

  // Función para obtener URL de imagen desde S3
  const getImageUrl = async (photoKey: string | null | undefined): Promise<string | null> => {
    if (!photoKey) return null;
    
    try {
      const result = await getUrl({
        key: photoKey,
      });
      return result.url.toString();
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  };

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

        // Obtener URL de la imagen si existe
        if (profileData.profilePhotoKey) {
          const imageUrl = await getImageUrl(profileData.profilePhotoKey);
          setProfileImageUrl(imageUrl);
        }
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
      <View className={`profile-section ${className}`}>
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
            color="var(--amplify-colors-font-tertiary)"
            marginTop="1rem"
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
      <View className={`profile-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
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
      <View className={`profile-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
        <style>{profileStyles}</style>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          className="profile-content"
          textAlign="center"
        >
          <View className="profile-image-placeholder">
            <User size={60} color="rgba(255, 255, 255, 0.8)" />
          </View>
          
          <Heading
            level={2}
            fontSize={{ base: '2.5rem', medium: '3rem' }}
            className="profile-name"
          >
            Fortino Romero Mantilla
          </Heading>
          
          <Text className="current-position">
            <Award size={20} />
            Cloud Engineer | AWS Advocate | DevOps Enthusiast
          </Text>
          
          <Text className="profile-description">
            {t('about.description1')}
          </Text>
        </Flex>
      </View>
    );
  }

  return (
    <View className={`profile-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
      <style>{profileStyles}</style>
      <Flex 
        direction="column" 
        alignItems="center" 
        justifyContent="center"
        className="profile-content"
        textAlign="center"
      >
        {/* Imagen de perfil */}
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={profile.name || 'Profile'}
            className="profile-image"
          />
        ) : (
          <View className="profile-image-placeholder">
            <User size={60} color="rgba(255, 255, 255, 0.8)" />
          </View>
        )}
        
        {/* Nombre */}
        <Heading
          level={2}
          fontSize={{ base: '2.5rem', medium: '3rem' }}
          className="profile-name"
        >
          {profile.name || 'Fortino Romero Mantilla'}
        </Heading>
        
        {/* Posición actual */}
        <Text className="current-position">
          <Award size={20} />
          {profile.currentPosition || 'Cloud Engineer | AWS Advocate | DevOps Enthusiast'}
        </Text>
        
        {/* Descripción */}
        <Text className="profile-description">
          {profile.description || t('about.description1')}
        </Text>
        
        {/* Flags/Badges */}
        {profile.flags && profile.flags.length > 0 && (
          <Flex className="flags-container">
            {profile.flags.map((flag, index) => (
              <Badge key={index} className="flag-badge">
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
