'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Card, Button, Badge, Loader, Alert } from '@aws-amplify/ui-react';
import { ExternalLink, MapPin, Code, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';

// Tipos para el proyecto
type Project = Schema["Projects"]["type"];

interface FeaturedProjectsProps {
  className?: string;
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ className = '' }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);  
  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Function to handle card click navigation
  const handleCardClick = (project: Project, event: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons or links
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    const projectPath = getLocalizedPath(`/projects/${project.slug || project.id}`);
    router.push(projectPath);
  };

  // Verificar si el componente está montado para evitar hidratación mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Solo ejecutar en el cliente después de que esté montado
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);
          // Generar el cliente solo en el cliente
        const client = generateClient<Schema>();
          const { data: projectsData, errors } = await client.models.Projects.list({
          limit: 3,
        });

        if (errors) {
          console.error('Error fetching projects:', JSON.stringify(errors, null, 2));
          // Continue processing - GraphQL may return partial data with errors
        }        // Sort by createdAt descending to get most recent first
        const sortedProjects = (projectsData || [])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);

        setProjects(sortedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }    fetchProjects();
  }, [mounted]); // Solo mounted como dependencia

  const getCategoryColor = (category: string | null | undefined) => {
    switch (category) {
      case 'Hackathon': return mode === 'dark' ? '#FF6B6B' : '#DC2626';
      case 'Research': return mode === 'dark' ? '#4ECDC4' : '#059669';
      case 'Professional': return mode === 'dark' ? '#45B7D1' : '#2563EB';
      case 'Academic': return mode === 'dark' ? '#96CEB4' : '#16A34A';
      case 'Personal': return mode === 'dark' ? '#FECA57' : '#D97706';
      default: return mode === 'dark' ? '#6B7280' : '#4B5563';
    }
  };

  // Si no está montado aún, mostrar estado de carga
  if (!mounted) {
    return (
      <View
        as="section"
        padding={{ base: '3rem 1rem', medium: '4rem 2rem' }}
        style={{
          backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
        }}
      >
        <Flex direction="column" alignItems="center" gap="2rem" maxWidth="1200px" margin="0 auto">
          <Loader size="large" />
        </Flex>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        as="section"
        padding={{ base: '3rem 1rem', medium: '4rem 2rem' }}
        style={{
          backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
        }}
      >        <Flex direction="column" alignItems="center" gap="2rem" maxWidth="1200px" margin="0 auto">
          <Flex direction="column" alignItems="center" gap="1rem" textAlign="center">
            <Text
              fontSize={{ base: '2rem', medium: '2.5rem' }}
              fontWeight="700"
              style={{
                backgroundImage: mode === 'dark' 
                  ? 'linear-gradient(135deg, #93C5FD, #60A5FA)' 
                  : 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('projects.title')} <span style={{ 
                backgroundImage: mode === 'dark' 
                  ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' 
                  : 'linear-gradient(135deg, #2563EB, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{t('projects.titleHighlight')}</span>
            </Text>
          </Flex>
          <Loader size="large" />
        </Flex>
      </View>
    );
  }

  if (error) {
    return (
      <View
        as="section"
        padding={{ base: '3rem 1rem', medium: '4rem 2rem' }}
        style={{
          backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
        }}
      >
        <Flex direction="column" alignItems="center" gap="2rem" maxWidth="1200px" margin="0 auto">
          <Text color="error.60">{t('projects.error')}</Text>
        </Flex>
      </View>
    );
  }

  return (
    <View
      as="section"
      padding={{ base: '6rem 1rem', medium: '7rem 2rem' }}
      style={{
        backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
      }}
    >
      <style jsx global>{`
        .project-image-container {
          width: 100%;
          height: 200px;
          position: relative;
          overflow: hidden;
        }
        .project-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .project-card:hover .project-image {
          transform: scale(1.05);
        }
      `}</style>
      <Flex direction="column" alignItems="center" gap="3rem" maxWidth="1200px" margin="0 auto">
        {/* Header */}        <Flex direction="column" alignItems="center" gap="1rem" textAlign="center">
          <Text
            fontSize={{ base: '2rem', medium: '2.5rem' }}
            fontWeight="700"
            style={{
              backgroundImage: mode === 'dark' 
                ? 'linear-gradient(135deg, #93C5FD, #60A5FA)' 
                : 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('projects.title')} <span style={{ 
              backgroundImage: mode === 'dark' 
                ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' 
                : 'linear-gradient(135deg, #2563EB, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{t('projects.titleHighlight')}</span>
          </Text>
          
          <Text
            fontSize={{ base: '1rem', medium: '1.125rem' }}
            maxWidth="600px"
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
              lineHeight: 1.6,
            }}
          >
            {t('projects.description')}
          </Text>
        </Flex>

        {/* Featured Projects Grid */}
        {projects.length > 0 ? (
          <Flex 
            direction={{ base: 'column', medium: 'row' }}
            gap="1.5rem"
            width="100%"
            wrap="wrap"
            justifyContent="center"
          >            {projects.map((project) => (
              <Card
                key={project.id}
                variation="elevated"
                onClick={(event) => handleCardClick(project, event)}
                style={{
                  flex: '1',
                  minWidth: '320px',
                  maxWidth: '380px',
                  backgroundColor: mode === 'dark' 
                    ? 'rgba(30, 41, 59, 0.8)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: mode === 'dark' 
                    ? '1px solid rgba(148, 163, 184, 0.1)' 
                    : '1px solid rgba(203, 213, 225, 0.2)',
                  borderRadius: '16px',
                  boxShadow: mode === 'dark'
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                    : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                className="hover:scale-105 project-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
                  e.currentTarget.style.boxShadow = mode === 'dark'
                    ? '0 25px 35px -5px rgba(0, 0, 0, 0.4), 0 15px 15px -5px rgba(0, 0, 0, 0.3)'
                    : '0 25px 35px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = mode === 'dark'
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                    : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                }}
              >
                {/* Project Image */}
                {project.photoKey ? (
                  <View className="project-image-container">
                    <OptimizedImage
                      s3Key={project.photoKey}
                      alt={project.title || 'Project image'}
                      className="project-image"
                    />
                    <View
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                      }}
                    >
                      {project.categories && (
                        <Badge
                          size="small"
                          style={{
                            backgroundColor: getCategoryColor(project.categories),
                            color: 'white',
                            fontWeight: '600',
                            borderRadius: '8px',
                            padding: '4px 8px',
                          }}
                        >
                          {t(`projects.categories.${project.categories}`)}
                        </Badge>
                      )}
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <ImageIcon 
                      size={48} 
                      color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} 
                    />
                    <View
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                      }}
                    >
                      {project.categories && (
                        <Badge
                          size="small"
                          style={{
                            backgroundColor: getCategoryColor(project.categories),
                            color: 'white',
                            fontWeight: '600',
                            borderRadius: '8px',
                            padding: '4px 8px',
                          }}
                        >
                          {t(`projects.categories.${project.categories}`)}
                        </Badge>
                      )}
                    </View>
                  </View>
                )}

                <Flex direction="column" padding="1.5rem" gap="1rem">
                  {/* Title and Description */}
                  <Flex direction="column" gap="0.5rem">
                    <Text
                      fontSize="1.25rem"
                      fontWeight="700"
                      style={{
                        color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                        lineHeight: 1.3,
                      }}
                    >
                      {project.title}
                    </Text>
                    
                    <Text
                      fontSize="0.875rem"
                      style={{
                        color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {project.description}
                    </Text>
                  </Flex>

                  {/* Location */}
                  <Flex alignItems="center" gap="0.5rem">
                    <MapPin 
                      size={14} 
                      style={{ color: mode === 'dark' ? '#93C5FD' : '#3B82F6' }} 
                    />
                    <Text
                      fontSize="0.75rem"
                      style={{
                        color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                        fontWeight: '500',
                      }}
                    >
                      {project.place}
                    </Text>
                  </Flex>

                  {/* Skills */}
                  {project.skills && project.skills.length > 0 && (
                    <Flex direction="column" gap="0.5rem">
                      <Text
                        fontSize="0.75rem"
                        fontWeight="600"
                        style={{
                          color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t('projects.labels.skills')}
                      </Text>
                      <Flex wrap="wrap" gap="0.25rem">
                        {project.skills.slice(0, 4).map((skill, index) => (
                          <Badge
                            key={index}
                            size="small"
                            style={{
                              backgroundColor: mode === 'dark' 
                                ? 'rgba(59, 130, 246, 0.2)' 
                                : 'rgba(59, 130, 246, 0.1)',
                              color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
                              border: mode === 'dark' 
                                ? '1px solid rgba(59, 130, 246, 0.3)' 
                                : '1px solid rgba(59, 130, 246, 0.2)',
                              borderRadius: '6px',
                              fontWeight: '500',
                              fontSize: '0.7rem',
                            }}
                          >
                            {skill}
                          </Badge>
                        ))}
                        {project.skills.length > 4 && (
                          <Badge
                            size="small"
                            style={{
                              backgroundColor: mode === 'dark' 
                                ? 'rgba(107, 114, 128, 0.2)' 
                                : 'rgba(107, 114, 128, 0.1)',
                              color: mode === 'dark' ? '#9CA3AF' : '#6B7280',
                              borderRadius: '6px',
                              fontWeight: '500',
                              fontSize: '0.7rem',
                            }}
                          >
                            +{project.skills.length - 4}
                          </Badge>
                        )}
                      </Flex>
                    </Flex>
                  )}

                  {/* Actions */}
                  <Flex gap="0.75rem" marginTop="0.5rem">                    {project.projectUrl && (
                      <Button
                        as="a"
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        className="hover:scale-105"
                      >
                        <ExternalLink size={12} />
                        {t('projects.actions.viewProject')}
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>
        ) : (
          <Text
            style={{
              color: mode === 'dark' ? '#9CA3AF' : '#6B7280',
              fontSize: '1.125rem',
              textAlign: 'center',
            }}
          >
            {t('projects.noProjects')}
          </Text>
        )}

        {/* View All Projects Button */}
        <Button
          as="a"
          href={getLocalizedPath('/projects')}
          size="large"
          style={{
            backgroundColor: 'transparent',
            color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
            border: mode === 'dark' 
              ? '2px solid #93C5FD' 
              : '2px solid #3B82F6',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '12px 24px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
          className="hover:scale-105"
        >
          {t('projects.viewAll')}
        </Button>      </Flex>
    </View>
  );
};

export default FeaturedProjects;
