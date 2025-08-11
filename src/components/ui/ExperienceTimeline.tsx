'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Heading, Card, Badge, Loader, Alert } from '@aws-amplify/ui-react';
import { Building, MapPin, Calendar, Clock, Briefcase, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';

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
    background-color: var(--amplify-colors-brand-primary);
    opacity: 0.7;
    border-radius: 2px;
    z-index: 1;
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
    background-color: var(--amplify-colors-brand-primary);
    border: 4px solid var(--amplify-colors-background-primary);
    border-radius: 50%;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--amplify-shadows-small);
    transition: all 0.3s ease;
  }

  .timeline-dot:hover {
    transform: scale(1.2);
    box-shadow: var(--amplify-shadows-medium);
  }

  .timeline-dot-icon {
    color: var(--amplify-colors-font-inverse);
    font-size: 0.75rem;
  }

  .timeline-card {
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

  .timeline-card:hover {
    transform: translateX(10px);
    box-shadow: var(--amplify-shadows-medium);
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
      var(--amplify-colors-brand-primary-10) 0%, 
      var(--amplify-colors-brand-secondary-10) 100%);
    color: var(--amplify-colors-font-primary);
    padding: 0.5rem 1rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    border: 1px solid var(--amplify-colors-brand-primary-20);
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
      var(--amplify-colors-brand-secondary) 0%, 
      var(--amplify-colors-brand-tertiary) 100%);
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
    box-shadow: var(--amplify-shadows-small);
  }

  .timeline-activities {
    margin-top: 1rem;
  }

  .timeline-activities-toggle {
    background: transparent;
    border: 2px solid var(--amplify-colors-brand-primary-20);
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
    border-color: var(--amplify-colors-brand-primary-40);
    background: var(--amplify-colors-brand-primary-10);
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
    color: var(--amplify-colors-brand-primary-60);
    font-weight: bold;
  }

  .timeline-company-image {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    border: 2px solid var(--amplify-colors-border-tertiary);
  }

  .timeline-company-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, 
      var(--amplify-colors-brand-primary-20) 0%, 
      var(--amplify-colors-brand-secondary-20) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--amplify-colors-border-tertiary);
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
  const [expandedActivities, setExpandedActivities] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const timelineLineStyles = {
    position: 'absolute' as const,
    left: '1.5rem',
    top: 0,
    bottom: 0,
    width: '4px',
    background: mode === 'dark' ? '#3B82F6' : '#F59E0B',
    opacity: 0.7,
    borderRadius: '2px',
    zIndex: 1,
  };

  const timelineDotStyles = {
    position: 'absolute' as const,
    left: '-2.75rem',
    top: '1.5rem',
    width: '1.5rem',
    height: '1.5rem',
    backgroundColor: mode === 'dark' ? '#3B82F6' : '#F59E0B',
    border: mode === 'dark' ? '4px solid #0F172A' : '4px solid #F8FAFC',
    borderRadius: '50%',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: mode === 'dark' 
      ? '0 10px 25px rgba(59, 130, 246, 0.3)' 
      : '0 10px 25px rgba(245, 158, 11, 0.3)',
    transition: 'all 0.3s ease',
  };

  const cardStyles = {
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

  const dateTagStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: mode === 'dark'
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
    color: mode === 'dark' ? '#E2E8F0' : '#1F2937',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '1rem',
    border: mode === 'dark'
      ? '1px solid rgba(59, 130, 246, 0.3)'
      : '1px solid rgba(59, 130, 246, 0.2)',
  };

  const companyNameColor = mode === 'dark' ? '#F8FAFC' : '#0F172A';
  const positionColor = mode === 'dark' ? '#CBD5E1' : '#64748B';
  const locationColor = mode === 'dark' ? '#94A3B8' : '#6B7280';
  const descriptionColor = mode === 'dark' ? '#E2E8F0' : '#374151';
  const loadingTextColor = mode === 'dark' ? '#CBD5E1' : '#64748B';

  const skillBadgeStyles = {
    backgroundColor: mode === 'dark' ? '#1E40AF' : '#3B82F6',
    color: '#FFFFFF',
    padding: '0.3rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    margin: '0.25rem',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    border: 'none',
  };

  const activitiesButtonStyles = {
    background: mode === 'dark'
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(59, 130, 246, 0.1)',
    color: mode === 'dark' ? '#93C5FD' : '#2563EB',
    border: mode === 'dark'
      ? '1px solid rgba(59, 130, 246, 0.3)'
      : '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    transition: 'all 0.3s ease',
  };

  const companyImagePlaceholderStyles = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: mode === 'dark'
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: mode === 'dark'
      ? '2px solid rgba(148, 163, 184, 0.2)'
      : '2px solid rgba(203, 213, 225, 0.3)',
  };

  // Client initialization
  const client = generateClient<Schema>();

  // Effect para marcar como montado
  useEffect(() => {
    setMounted(true);
  }, []);



  // Función para obtener experiencias
  const fetchExperiences = async () => {
    try {
      const authMode = isAuthenticated ? 'userPool' : 'apiKey';
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
      <View className={`timeline-section ${className}`}>
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
            marginTop="1rem"
            style={{ color: loadingTextColor }}
          >
            {t('about.experience.loading')}
          </Text>
        </Flex>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`timeline-section ${className}`}>
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
      <View className={`timeline-section ${className}`}>
        <style>{timelineStyles}</style>
        <Heading
          level={2}
          fontSize={{ base: '2rem', medium: '2.5rem' }}
          style={titleStyles}
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
            style={{ color: positionColor }}
          >
            {t('about.experience.noExperience')}
          </Text>
        </Flex>
      </View>
    );
  }

  return (
    <View className={`timeline-section ${className}`}>
      <style>{timelineStyles}</style>
      
      {/* Header */}
      <Text
        as="h2"
        fontSize={{ base: '2rem', medium: '2.5rem' }}
        fontWeight="700"
        textAlign="center"
        lineHeight="1.1"
        style={titleStyles}
      >
        {t('about.experience.title')}{' '}
        <span style={titleHighlightStyles}>
          {t('about.experience.titleHighlight')}
        </span>
      </Text>

      {/* Timeline */}
      <View style={{
        position: 'relative',
        maxWidth: '800px',
        margin: '0 auto',
        paddingLeft: '2rem'
      }}>
        <View style={timelineLineStyles} />
        
        {experiences.map((experience, index) => (
          <View key={experience.id} style={{
            position: 'relative',
            marginBottom: '3rem',
            paddingLeft: '3rem'
          }}>
            <View style={timelineDotStyles}>
              <Briefcase size={12} color="#FFFFFF" />
            </View>
            
            <View style={cardStyles}>
              <View style={{ position: 'relative', zIndex: 1 }}>
                {/* Fecha */}
                <View style={dateTagStyles}>
                  <Calendar size={14} />
                  {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                </View>

                {/* Empresa */}
                <Heading 
                  level={3} 
                  fontSize="1.5rem"
                  fontWeight="700"
                  marginBottom="0.5rem"
                  style={{ 
                    color: companyNameColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  {experience.photoKey ? (
                    <OptimizedImage
                      s3Key={experience.photoKey}
                      alt={experience.company}
                      className="timeline-company-image"
                      showPlaceholder={false}
                    />
                  ) : (
                    <View style={companyImagePlaceholderStyles}>
                      <Building size={20} color={mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'} />
                    </View>
                  )}
                  {experience.company}
                </Heading>

                {/* Posición */}
                <Text 
                  fontSize="1.125rem"
                  fontWeight="600"
                  marginBottom="1rem"
                  style={{ 
                    color: positionColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Briefcase size={16} />
                  {experience.position}
                </Text>

                {/* Ubicación */}
                {experience.location && (
                  <Text 
                    fontSize="0.95rem"
                    marginBottom="1.5rem"
                    style={{ 
                      color: locationColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <MapPin size={14} />
                    {experience.location}
                  </Text>
                )}

                {/* Descripción */}
                {experience.description && (
                  <Text 
                    fontSize="1rem"
                    lineHeight={1.6}
                    marginBottom="1.5rem"
                    style={{ color: descriptionColor }}
                  >
                    {experience.description}
                  </Text>
                )}

                {/* Skills */}
                {experience.skills && experience.skills.length > 0 && (
                  <View style={{
                    display: 'flex',
                    flexWrap: 'wrap' as const,
                    gap: '0.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    {experience.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} style={skillBadgeStyles}>
                        {skill}
                      </span>
                    ))}
                  </View>
                )}

                {/* Actividades */}
                {experience.activities && experience.activities.length > 0 && (
                  <View>
                    <button
                      style={activitiesButtonStyles}
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
                      <View style={{
                        marginTop: '1rem',
                        paddingLeft: '1rem'
                      }}>
                        {experience.activities.map((activity, activityIndex) => (
                          <Text 
                            key={activityIndex} 
                            fontSize="0.9rem"
                            lineHeight={1.5}
                            marginBottom="0.5rem"
                            style={{ 
                              color: descriptionColor,
                              position: 'relative',
                              paddingLeft: '1rem'
                            }}
                          >
                            <span style={{
                              position: 'absolute',
                              left: 0,
                              color: mode === 'dark' ? '#60A5FA' : '#3B82F6',
                              fontWeight: 'bold'
                            }}>•</span>
                            {activity}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ExperienceTimeline;
