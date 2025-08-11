'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Card, Button, Badge, Loader, Alert } from '@aws-amplify/ui-react';
import { ExternalLink, Github, MapPin, Calendar, Code, Layers, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import { useRouter } from 'next/navigation';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';

// Tipos para el proyecto
type Project = Schema["Projects"]["type"];

interface ProjectsSectionProps {
  className?: string;
  showAll?: boolean;
  maxItems?: number;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  className = '', 
  showAll = false, 
  maxItems = 6 
}) => {  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const { isAuthenticated } = useAuth();  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

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

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch projects from Amplify Data API
  const fetchProjects = async () => {
    // Solo ejecutar en el cliente después de que esté montado
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Generar el cliente solo en el cliente
      const client = generateClient<Schema>();
      const response = await client.models.Projects.list({
        authMode: isAuthenticated ? 'userPool' : 'apiKey' // Usar authMode dinámico basado en autenticación
      });
        
      if (response.data) {
        console.log('[ProjectsSection] Fetched projects:', response.data.length);
        
        // Log photo keys for debugging
        response.data.forEach(project => {
          console.log('[ProjectsSection] Project:', project.title, 'photoKey:', project.photoKey);
        });
        
        setProjects(response.data);
        setFilteredProjects(response.data);
      }
    } catch (err) {
      console.error('[ProjectsSection] Error fetching projects:', err);
      setError(t('projects.error'));
    } finally {
      setLoading(false);
    }
  };
  // Cargar proyectos al montar el componente
  useEffect(() => {
    if (mounted) {
      fetchProjects();
    }
  }, [mounted, isAuthenticated]); // Agregar isAuthenticated como dependencia
  // Filtrar proyectos por categoría
  useEffect(() => {
    let filtered = projects;
    if (selectedCategory !== 'all') {
      filtered = projects.filter(project => project.categories === selectedCategory);
    }
    
    // Limitar número de proyectos si no está en showAll mode
    if (!showAll && filtered.length > maxItems) {
      filtered = filtered.slice(0, maxItems);
    }
    
    setFilteredProjects(filtered);
  }, [selectedCategory, projects, showAll, maxItems]);

  // Categorías disponibles
  const categories = ['all', 'Hackathon', 'Research', 'Professional', 'Academic', 'Personal'];

  // Función para obtener el color del badge según la categoría
  const getCategoryColor = (category: string) => {
    const colors = {
      'Hackathon': '#FF6B6B',
      'Research': '#4ECDC4',
      'Professional': '#45B7D1',
      'Academic': '#96CEB4',
      'Personal': '#FFEAA7'
    };
    return colors[category as keyof typeof colors] || '#95A5A6';
  };

  // Estilos dinámicos basados en el tema
  const containerStyles = {
    background: mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 50%, rgba(30, 41, 59, 0.95) 100%)'
      : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 50%, rgba(248, 250, 252, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: mode === 'dark' 
      ? '1px solid rgba(148, 163, 184, 0.1)' 
      : '1px solid rgba(203, 213, 225, 0.2)',
    boxShadow: mode === 'dark'
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
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
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-8px)',
      boxShadow: mode === 'dark'
        ? '0 32px 64px -12px rgba(0, 0, 0, 0.4)'
        : '0 32px 64px -12px rgba(0, 0, 0, 0.15)',
    }
  };

  if (!mounted) {
    return <div className="min-h-[400px]" />;
  }

  return (
    <View
      as="section"
      padding={{ base: '4rem 1rem', small: '5rem 2rem', medium: '6rem 4rem' }}
      className={`${className}`}
      style={{
        minHeight: '70vh',
        position: 'relative',
      }}
    >
      {/* Background Pattern */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: mode === 'dark'
            ? `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
            : `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
               radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <View maxWidth="1200px" margin="0 auto" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Flex direction="column" alignItems="center" gap="1.5rem" marginBottom="4rem">
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
              marginBottom: '0.5rem',
            }}
          >
            {t('projects.title')}{' '}
            <span style={{ 
              backgroundImage: mode === 'dark'
                ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                : 'linear-gradient(135deg, #2563EB, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t('projects.titleHighlight')}
            </span>
          </Text>
          
          <Text
            fontSize={{ base: '1rem', medium: '1.125rem' }}
            textAlign="center"
            maxWidth="600px"
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
              lineHeight: 1.6,
            }}
          >
            {t('projects.description')}
          </Text>
        </Flex>

        {/* Category Filter */}
        <View 
          style={containerStyles} 
          padding={{ base: '1.5rem 1rem', small: '2rem' }} 
          marginBottom="3rem"
        >
          <Flex
            direction={{ base: 'column', medium: 'row' }}
            gap="1rem"
            alignItems="center"
            justifyContent="center"
            wrap="wrap"
          >
            {categories.map((category) => (              <Button
                key={category}
                variation={selectedCategory === category ? 'primary' : undefined}
                size="small"
                onClick={() => setSelectedCategory(category)}
                style={{
                  borderRadius: '12px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  backgroundColor: selectedCategory === category
                    ? (mode === 'dark' ? '#3B82F6' : '#2563EB')
                    : (mode === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.8)'),
                  color: selectedCategory === category
                    ? '#FFFFFF'
                    : (mode === 'dark' ? '#CBD5E1' : '#64748B'),
                  border: selectedCategory === category
                    ? '1px solid transparent'
                    : (mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)'),
                }}
              >
                {t(`projects.categories.${category}`)}
              </Button>
            ))}
          </Flex>
        </View>

        {/* Content */}
        {loading ? (
          <Flex direction="column" alignItems="center" gap="1rem" padding="4rem 0">
            <Loader size="large" />
            <Text style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
              {t('projects.loading')}
            </Text>
          </Flex>
        ) : error ? (
          <Alert variation="error" marginBottom="2rem">
            {error}
          </Alert>
        ) : filteredProjects.length === 0 ? (
          <Flex direction="column" alignItems="center" gap="1rem" padding="4rem 0">
            <Layers size={64} style={{ color: mode === 'dark' ? '#64748B' : '#94A3B8' }} />
            <Text
              fontSize="1.25rem"
              fontWeight="600"
              style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
            >
              {t('projects.noProjects')}
            </Text>
          </Flex>
        ) : (
          <Flex
            direction="row"
            wrap="wrap"
            gap={{ base: '1.5rem', medium: '2rem' }}
            justifyContent="center"
            padding={{ base: '0 0.5rem', small: '0' }}
          >            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                onClick={(event) => handleCardClick(project, event)}
                width="100%"
                maxWidth={{ base: '90%', small: '95%', medium: '400px' }}
                minWidth={{ base: '280px', small: '320px' }}
                margin={{ base: '0 auto', medium: '0' }}
                style={{
                  ...cardStyles,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = mode === 'dark' 
                    ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
                    : '0 20px 40px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = mode === 'dark' 
                    ? '0 10px 30px rgba(0, 0, 0, 0.2)' 
                    : '0 10px 30px rgba(0, 0, 0, 0.05)';
                }}
              >{/* Project Image */}
                {project.photoKey ? (
                  <View
                    style={{
                      height: '200px',
                      borderRadius: '12px 12px 0 0',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <style>
                      {`
                        .certification-image {
                          width: 100%;
                          height: 100%;
                          object-fit: contain;
                          border-radius: 8px;
                        }
                      `}
                    </style>
                    <OptimizedImage

                      s3Key={project.photoKey}
                      alt={project.title || 'Project image'}
                      className="certification-image"
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      height: '200px',
                      backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px 12px 0 0',
                    }}
                  >
                    <ImageIcon 
                      size={48} 
                      color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} 
                    />
                  </View>
                )}

                <View padding={{ base: '1.25rem', small: '1.5rem' }}>
                  {/* Category Badge */}
                  {project.categories && (
                    <Badge
                      variation="info"
                      style={{
                        backgroundColor: getCategoryColor(project.categories),
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                      }}
                    >
                      {t(`projects.categories.${project.categories}`)}
                    </Badge>
                  )}

                  {/* Project Title */}
                  <Text
                    as="h3"
                    fontSize="1.25rem"
                    fontWeight="700"
                    marginBottom="0.75rem"
                    style={{
                      color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                      lineHeight: '1.3',
                    }}
                  >
                    {project.title}
                  </Text>

                  {/* Project Description */}
                  <Text
                    fontSize="0.95rem"
                    marginBottom="1.5rem"
                    style={{
                      color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                      lineHeight: '1.6',
                    }}
                  >
                    {project.description}
                  </Text>

                  {/* Project Info */}
                  <Flex direction="column" gap="0.75rem" marginBottom="1.5rem">
                    {project.place && (
                      <Flex alignItems="center" gap="0.5rem">
                        <MapPin size={16} style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }} />
                        <Text
                          fontSize="0.875rem"
                          style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
                        >
                          {project.place}
                        </Text>
                      </Flex>
                    )}

                    {/* Technologies */}
                    {project.skills && project.skills.length > 0 && (
                      <View>
                        <Flex alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                          <Code size={16} style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }} />
                          <Text
                            fontSize="0.875rem"
                            fontWeight="600"
                            style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
                          >
                            {t('projects.labels.skills')}:
                          </Text>
                        </Flex>
                        <Flex wrap="wrap" gap="0.5rem">                          {project.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              style={{
                                backgroundColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 0.3)',
                                color: mode === 'dark' ? '#CBD5E1' : '#475569',
                                fontSize: '0.75rem',
                                borderRadius: '6px',
                              }}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </Flex>
                      </View>
                    )}
                  </Flex>                  {/* Action Buttons */}
                  <Flex gap="0.75rem" wrap="wrap">
                    {/* Botón para ver detalles del proyecto */}
                    <Button
                      as="a"
                      href={getLocalizedPath(`/projects/${project.slug || project.id}`)}
                      size="small"
                      variation="primary"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        borderRadius: '8px',
                        fontWeight: '500',
                        backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <ArrowRight size={16} />
                      {t('projects.actions.viewDetails')}
                    </Button>

                    {project.projectUrl && (
                      <Button
                        as="a"
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          borderRadius: '8px',
                          fontWeight: '500',
                          backgroundColor: 'transparent',
                          border: mode === 'dark' ? '1px solid #475569' : '1px solid #CBD5E1',
                          color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <ExternalLink size={16} />
                        {t('projects.actions.viewProject')}
                      </Button>
                    )}

                    {project.githubUrl && (
                      <Button
                        as="a"
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          borderRadius: '8px',
                          fontWeight: '500',
                          backgroundColor: 'transparent',
                          border: mode === 'dark' ? '1px solid #475569' : '1px solid #CBD5E1',
                          color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Github size={16} />
                        {t('projects.actions.viewCode')}
                      </Button>
                    )}
                  </Flex>
                </View>
              </Card>
            ))}
          </Flex>
        )}

        {/* Botón "Ver Todos los Proyectos" cuando no está en showAll mode */}
        {!showAll && projects.length > maxItems && (
          <Flex justifyContent="center" marginTop="3rem">
            <Button
              as="a"
              href={getLocalizedPath('/projects')}
              size="large"
              variation="primary"
              style={{
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.1rem',
                padding: '1rem 2rem',
                backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}            >
              {t('projects.actions.viewAllProjects')}
              <ArrowRight size={20} />
            </Button>
          </Flex>
        )}
      </View>
    </View>
  );
};

export default ProjectsSection;
