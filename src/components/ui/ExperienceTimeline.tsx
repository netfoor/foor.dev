'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Heading, Card, Badge, Loader, Alert, Image } from '@aws-amplify/ui-react';
import { Building, MapPin, Calendar, Clock, Briefcase, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';

// Tipos para los datos
type Experience = Schema["Experiences"]["type"];

interface ExperienceTimelineProps {
  className?: string;
}

// Estilos personalizados para la línea del tiempo
const timelineStyles = `
  .timeline-section {
    margin-bottom: 4rem;
  }

  .timeline-section.dark-mode .timeline-container {
    color: #E2E8F0;
  }

  .timeline-container {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    padding-left: 2rem;
  }

  .timeline-line {
    position: absolute;
    left: 1.5rem;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom,
      rgba(59, 130, 246, 0.8) 0%,
      rgba(139, 92, 246, 0.6) 50%,
      rgba(236, 72, 153, 0.4) 100%);
    border-radius: 2px;
    z-index: 1;
  }

  .timeline-section.dark-mode .timeline-line {
    background: linear-gradient(to bottom,
      rgba(99, 102, 241, 0.9) 0%,
      rgba(168, 85, 247, 0.7) 50%,
      rgba(236, 72, 153, 0.6) 100%);
  }

  .timeline-item {
    position: relative;
    margin-bottom: 3rem;
    padding-left: 3rem;
  }

  .timeline-dot {
    position: absolute;
    left: -2.75rem;
    top: 1.5rem;
    width: 1.5rem;
    height: 1.5rem;
    background: linear-gradient(135deg,
      rgba(59, 130, 246, 1) 0%,
      rgba(139, 92, 246, 1) 100%);
    border: 4px solid var(--amplify-colors-background-primary);
    border-radius: 50%;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transition: all 0.3s ease;
  }

  .timeline-dot:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  }

  .timeline-dot-icon {
    color: white;
    font-size: 0.75rem;
  }

  .timeline-card {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: default;
  }

  .timeline-section.dark-mode .timeline-card {
    background: linear-gradient(135deg, 
      rgba(30, 41, 59, 0.9) 0%, 
      rgba(51, 65, 85, 0.8) 100%);
    border: 1px solid rgba(148, 163, 184, 0.3);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }

  .timeline-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.05) 0%, 
      rgba(139, 92, 246, 0.03) 100%);
    pointer-events: none;
    z-index: 0;
  }

  .timeline-section.dark-mode .timeline-card::before {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      rgba(139, 92, 246, 0.08) 100%);
  }

  .timeline-card:hover {
    transform: translateX(10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }

  .timeline-card:hover::before {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      rgba(139, 92, 246, 0.05) 100%);
  }

  .timeline-content {
    position: relative;
    z-index: 1;
  }

  .timeline-date {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.2) 0%, 
      rgba(139, 92, 246, 0.2) 100%);
    color: var(--amplify-colors-font-primary);
    padding: 0.5rem 1rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .timeline-company {
    color: var(--amplify-colors-font-primary);
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .timeline-position {
    color: var(--amplify-colors-font-secondary);
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .timeline-location {
    color: var(--amplify-colors-font-tertiary);
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .timeline-description {
    color: var(--amplify-colors-font-secondary);
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .timeline-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .timeline-skill-badge {
    background: linear-gradient(135deg, 
      rgba(139, 92, 246, 0.9) 0%, 
      rgba(236, 72, 153, 0.9) 100%);
    color: white;
    border: none;
    border-radius: 16px;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .timeline-skill-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  }

  .timeline-activities {
    margin-top: 1rem;
  }

  .timeline-activities-toggle {
    background: transparent;
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 0.5rem 1rem;
    color: var(--amplify-colors-font-primary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .timeline-activities-toggle:hover {
    border-color: rgba(59, 130, 246, 0.6);
    background: rgba(59, 130, 246, 0.1);
  }

  .timeline-activities-list {
    margin-top: 1rem;
    padding-left: 1rem;
  }

  .timeline-activity-item {
    color: var(--amplify-colors-font-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
    position: relative;
    padding-left: 1rem;
  }

  .timeline-activity-item::before {
    content: '•';
    position: absolute;
    left: 0;
    color: rgba(59, 130, 246, 0.7);
    font-weight: bold;
  }

  .timeline-company-image {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .timeline-company-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.3) 0%, 
      rgba(139, 92, 246, 0.3) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(255, 255, 255, 0.2);
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
    margin-bottom: 3rem;
  }

  @media (max-width: 768px) {
    .timeline-container {
      padding-left: 1.5rem;
    }
    
    .timeline-line {
      left: 1rem;
    }
    
    .timeline-dot {
      left: -2.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .timeline-item {
      padding-left: 2.5rem;
      margin-bottom: 2rem;
    }
    
    .timeline-card {
      padding: 1.5rem;
    }
    
    .timeline-company {
      font-size: 1.25rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .timeline-position {
      font-size: 1rem;
    }
    
    .timeline-skills {
      gap: 0.4rem;
    }
    
    .timeline-skill-badge {
      font-size: 0.75rem;
      padding: 0.3rem 0.6rem;
    }
  }
`;

const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({ className = '' }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [experienceImages, setExperienceImages] = useState<{ [key: string]: string }>({});
  const [expandedActivities, setExpandedActivities] = useState<{ [key: string]: boolean }>({});
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
      // Normalize path - remove 'public/' prefix if present
      const normalizedPath = photoKey.startsWith('public/') 
        ? photoKey.slice(7) 
        : photoKey;
      
      const result = await getUrl({
        path: normalizedPath,
      });
      return result.url.toString();
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
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

        // Obtener URLs de imágenes
        const imagePromises = sortedExperiences.map(async (exp) => {
          if (exp.photoKey) {
            const imageUrl = await getImageUrl(exp.photoKey);
            return { id: exp.id, imageUrl };
          }
          return { id: exp.id, imageUrl: null };
        });

        const imageResults = await Promise.all(imagePromises);
        const imageMap: { [key: string]: string } = {};
        imageResults.forEach(({ id, imageUrl }) => {
          if (imageUrl) imageMap[id] = imageUrl;
        });
        setExperienceImages(imageMap);
      }
    } catch (err) {
      console.error('Error fetching experiences:', err);
      setError(t('about.experience.error'));
    }
  };

  // Effect para cargar datos
  useEffect(() => {
    const loadData = async () => {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);

      try {
        await fetchExperiences();
      } catch (err) {
        console.error('Error loading experience data:', err);
        setError(t('about.experience.error'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted, isAuthenticated]);

  // Función para formatear fechas
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return t('about.experience.present');
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateString;
    }
  };

  // Función para alternar actividades expandidas
  const toggleActivities = (experienceId: string) => {
    setExpandedActivities(prev => ({
      ...prev,
      [experienceId]: !prev[experienceId]
    }));
  };

  if (!mounted || loading) {
    return (
      <View className={`timeline-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
        <style>{timelineStyles}</style>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          minHeight="200px"
        >
          <Loader size="large" />
          <Text 
            fontSize="1.125rem" 
            color="var(--amplify-colors-font-tertiary)"
            marginTop="1rem"
          >
            {t('about.experience.loading')}
          </Text>
        </Flex>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`timeline-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
        <style>{timelineStyles}</style>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          minHeight="200px"
        >
          <Alert
            variation="error"
            isDismissible={false}
            hasIcon={true}
            heading={t('about.experience.error')}
          >
            {error}
          </Alert>
        </Flex>
      </View>
    );
  }

  if (experiences.length === 0) {
    return (
      <View className={`timeline-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
        <style>{timelineStyles}</style>
        <Heading
          level={2}
          fontSize={{ base: '2rem', medium: '2.5rem' }}
          className="section-title"
        >
          {t('about.experience.title')}
        </Heading>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          minHeight="200px"
        >
          <Text 
            fontSize="1.125rem" 
            color="var(--amplify-colors-font-secondary)"
          >
            {t('about.experience.noExperience')}
          </Text>
        </Flex>
      </View>
    );
  }

  return (
    <View className={`timeline-section ${mode === 'dark' ? 'dark-mode' : ''} ${className}`}>
      <style>{timelineStyles}</style>
      
      {/* Header */}
      <Text
        as="h2"
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
          marginBottom: '1.5rem',
        }}
      >
        {t('about.experience.title')}{' '}
        <span style={{ 
          backgroundImage: mode === 'dark'
            ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
            : 'linear-gradient(135deg, #2563EB, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {t('about.experience.titleHighlight')}
        </span>
      </Text>

      {/* Timeline */}
      <View className="timeline-container">
        <View className="timeline-line" />
        
        {experiences.map((experience, index) => (
          <View key={experience.id} className="timeline-item">
            <View className="timeline-dot">
              <Briefcase className="timeline-dot-icon" size={12} />
            </View>
            
            <Card className="timeline-card">
              <View className="timeline-content">
                {/* Fecha */}
                <View className="timeline-date">
                  <Calendar size={14} />
                  {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                </View>

                {/* Empresa */}
                <Heading level={3} className="timeline-company">
                  {experienceImages[experience.id] ? (
                    <Image
                      src={experienceImages[experience.id]}
                      alt={experience.company}
                      className="timeline-company-image"
                    />
                  ) : (
                    <View className="timeline-company-placeholder">
                      <Building size={20} color="rgba(255, 255, 255, 0.8)" />
                    </View>
                  )}
                  {experience.company}
                </Heading>

                {/* Posición */}
                <Text className="timeline-position">
                  <Briefcase size={16} />
                  {experience.position}
                </Text>

                {/* Ubicación */}
                {experience.location && (
                  <Text className="timeline-location">
                    <MapPin size={14} />
                    {experience.location}
                  </Text>
                )}

                {/* Descripción */}
                {experience.description && (
                  <Text className="timeline-description">
                    {experience.description}
                  </Text>
                )}

                {/* Skills */}
                {experience.skills && experience.skills.length > 0 && (
                  <View className="timeline-skills">
                    {experience.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} className="timeline-skill-badge">
                        {skill}
                      </Badge>
                    ))}
                  </View>
                )}

                {/* Actividades */}
                {experience.activities && experience.activities.length > 0 && (
                  <View className="timeline-activities">
                    <button
                      className="timeline-activities-toggle"
                      onClick={() => toggleActivities(experience.id)}
                    >
                      <Star size={14} />
                      {t('about.experience.labels.activities')}
                      {expandedActivities[experience.id] ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                    
                    {expandedActivities[experience.id] && (
                      <View className="timeline-activities-list">
                        {experience.activities.map((activity, activityIndex) => (
                          <Text key={activityIndex} className="timeline-activity-item">
                            {activity}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </Card>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ExperienceTimeline;
