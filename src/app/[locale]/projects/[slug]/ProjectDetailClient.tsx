'use client';

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Card, 
  Heading,
  Badge,
  Button,
  Divider,
  Alert,
  Loader
} from '@aws-amplify/ui-react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  MapPin, 
  Calendar,
  Code,
  Tag,
  Globe,
  PlayCircle,
  ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import HeaderControls from '@/components/ui/HeaderControls';
import Footer from '@/components/ui/Footer';
import { useAuth } from '@/context/auth-context';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';

// Tipos para el proyecto
type Project = Schema["Projects"]["type"];

interface ProjectDetailClientProps {
  locale: SupportedLocale;
  slug: string;
}

// Estilos personalizados
const projectDetailStyles = `
  .project-detail-container {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      rgba(139, 92, 246, 0.05) 25%, 
      rgba(236, 72, 153, 0.05) 50%, 
      rgba(245, 101, 101, 0.05) 75%, 
      rgba(251, 191, 36, 0.1) 100%);
    min-height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .project-detail-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .project-content {
    position: relative;
    z-index: 1;
  }

  .project-main-image {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: 16px;
    transition: transform 0.3s ease;
  }

  .project-main-image:hover {
    transform: scale(1.02);
  }

  .gallery-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .gallery-image:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .skill-badge {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .skill-badge:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
    transform: translateY(-2px);
  }

  .action-button {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(139, 92, 246, 0.9));
    border: none;
    border-radius: 12px;
    color: white;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .action-button:hover {
    background: linear-gradient(135deg, rgba(37, 99, 235, 1), rgba(124, 58, 237, 1));
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
  }

  .secondary-button {
    background: transparent;
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .secondary-button:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateY(-2px);
  }

  .gallery-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }

  .modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
  }

  .modal-image {
    width: 100%;
    height: auto;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
  }

  .modal-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    padding: 1rem;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .modal-nav:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .modal-nav-left {
    left: -60px;
  }

  .modal-nav-right {
    right: -60px;
  }

  .modal-close {
    position: absolute;
    top: -50px;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .project-main-image {
      height: 250px;
    }
    
    .gallery-container {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
    
    .gallery-image {
      height: 150px;
    }

    .modal-nav-left {
      left: 10px;
    }

    .modal-nav-right {
      right: 10px;
    }

    .modal-close {
      top: 10px;
      right: 10px;
    }
  }
`;

function ProjectDetailClient({ locale, slug }: ProjectDetailClientProps): React.JSX.Element {
  const { mode } = useTheme();
  const { t } = useTranslation('common');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();
  const { isAuthenticated } = useAuth();

  // Estados
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [allImageKeys, setAllImageKeys] = useState<string[]>([]);

  // Función para obtener URL de imagen desde S3
  const getImageUrl = async (photoKey: string | null | undefined): Promise<string | null> => {
    if (!photoKey) return null;
    
    try {
      const normalizedPath = photoKey.startsWith('public/') ? photoKey.slice(7) : photoKey;
      const url = await getUrl({ path: normalizedPath });
      return url.url.toString();
    } catch (err) {
      console.error('Error getting image URL for key:', photoKey, err);
      return null;
    }  };

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError('');
        
        const client = generateClient<Schema>();
        const response = await client.models.Projects.list({
          filter: { slug: { eq: slug } },
          authMode: isAuthenticated ? 'userPool' : 'apiKey'
        });

        const foundProject = response.data?.[0];
        
        if (!foundProject) {
          setError('Project not found');
          return;
        }

        setProject(foundProject);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Error loading project data');
      }
    };

    fetchProject();
  }, [slug, isAuthenticated]);

  // Preparar las keys de imágenes
  useEffect(() => {
    if (!project) return;
    
    try {
      const imageKeys: string[] = [];

      // Agregar imagen principal
      if (project.photoKey) {
        imageKeys.push(project.photoKey);
      }

      // Agregar galería
      if (project.galleryKeys && project.galleryKeys.length > 0) {
        project.galleryKeys
          .filter((key): key is string => !!key)
          .forEach(key => {
            imageKeys.push(key);
          });
      }

      setAllImageKeys(imageKeys);
    } catch (err) {
      console.error('Error preparing image keys:', err);
      setError('Error loading project images');
    } finally {
      setLoading(false);
    }
  }, [project]);

  // Función para obtener el color del badge según la categoría
  const getCategoryColor = (category: string) => {
    const colors = {
      'Hackathon': 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
      'Research': 'linear-gradient(135deg, #4ECDC4, #6EDDD6)',
      'Professional': 'linear-gradient(135deg, #45B7D1, #67C8E3)',
      'Academic': 'linear-gradient(135deg, #96CEB4, #B8DCCB)',
      'Personal': 'linear-gradient(135deg, #FFEAA7, #FFF2C7)'
    };
    return colors[category as keyof typeof colors] || 'linear-gradient(135deg, #95A5A6, #B8C6C6)';
  };

  // Formatear fecha
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Navegación del modal de imagen
  const openImageModal = (index: number) => {
    setSelectedImage(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    if (direction === 'prev') {
      setSelectedImage(selectedImage === 0 ? allImageKeys.length - 1 : selectedImage - 1);
    } else {
      setSelectedImage(selectedImage === allImageKeys.length - 1 ? 0 : selectedImage + 1);
    }
  };
  const isDark = mode === 'dark';

  // Show loading state
  if (loading || !project) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: projectDetailStyles }} />
        <div className="project-detail-container">
          <div className="project-content">
            <HeaderControls />
            <View style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
              <Card style={{ 
                padding: '2rem', 
                backgroundColor: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: '24px',
                textAlign: 'center'
              }}>
                <Flex direction="column" alignItems="center" gap="large">
                  <Loader size="large" />                  <Text style={{ color: isDark ? '#CBD5E1' : '#374151' }}>
                    Loading project...
                  </Text>
                </Flex>
              </Card>
            </View>
            <Footer />
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: projectDetailStyles }} />
        <div className="project-detail-container">
          <div className="project-content">
            <HeaderControls />
            <View style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
              <Card style={{ 
                padding: '2rem', 
                backgroundColor: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: '24px'
              }}>
                <Alert variation="error" hasIcon={true} style={{ marginBottom: '2rem' }}>
                  {error}
                </Alert>
                <Button
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: isDark ? '#CBD5E1' : '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem'
                  }}
                  onClick={() => router.push(getLocalizedPath('/projects'))}
                >                  <ArrowLeft size={20} />
                  Back to Projects
                </Button>
              </Card>
            </View>
            <Footer />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: projectDetailStyles }} />
      
      <div className="project-detail-container">
        <div className="project-content">
          <HeaderControls />
          
          <View 
            style={{
              padding: '6rem 4rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}
          >
            {/* Botón de regreso */}
            <Button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: isDark ? '#CBD5E1' : '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '2rem',
                fontSize: '1rem'
              }}
              onClick={() => router.push(getLocalizedPath('/projects'))}
            >
              <ArrowLeft size={20} />
              {t('project_details.back_to_projects')}
            </Button>

            {error && (
              <Alert variation="error" hasIcon={true} style={{ marginBottom: '2rem' }}>
                {error}
              </Alert>
            )}

            <Card
              style={{
                padding: '2rem',
                backgroundColor: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                borderRadius: '24px',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: isDark
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
            >
              <Flex direction="column" gap="large">
                {/* Header del proyecto */}
                <View>
                  <Flex 
                    direction={{ base: 'column', medium: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ base: 'flex-start', medium: 'center' }}
                    gap="medium"
                    style={{ marginBottom: '1rem' }}
                  >
                    <View style={{ flex: 1 }}>
                      <Heading 
                        level={1}
                        style={{
                          color: isDark ? '#F1F5F9' : '#1E293B',
                          fontSize: '2.5rem',
                          fontWeight: '700',
                          marginBottom: '0.5rem',
                          lineHeight: '1.2'
                        }}
                      >
                        {project.title}
                      </Heading>
                      
                      {project.place && (
                        <Flex alignItems="center" gap="small" style={{ marginBottom: '0.5rem' }}>
                          <MapPin size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            {project.place}
                          </Text>
                        </Flex>
                      )}

                      {(project.startDate || project.endDate) && (
                        <Flex alignItems="center" gap="small">
                          <Calendar size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            {formatDate(project.startDate)}
                            {project.endDate && ` - ${formatDate(project.endDate)}`}
                          </Text>
                        </Flex>
                      )}
                    </View>

                    {/* Badge de categoría */}
                    {project.categories && (
                      <Badge
                        style={{
                          background: getCategoryColor(project.categories),
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          border: 'none'
                        }}
                      >
                        {project.categories}
                      </Badge>
                    )}
                  </Flex>

                  {/* Botones de acción */}
                  <Flex 
                    direction={{ base: 'column', medium: 'row' }}
                    gap="medium"
                    style={{ marginTop: '1.5rem' }}
                  >
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button"
                      >
                        <Globe size={16} />
                        {t('project_details.view_project')}
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="secondary-button"
                        style={{ color: isDark ? '#CBD5E1' : '#374151' }}
                      >
                        <Github size={16} />
                        {t('project_details.view_code')}
                      </a>
                    )}

                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="secondary-button"
                        style={{ color: isDark ? '#CBD5E1' : '#374151' }}
                      >
                        <PlayCircle size={16} />
                        {t('project_details.view_demo')}
                      </a>
                    )}
                  </Flex>
                </View>

                <Divider />

                {/* Imagen principal */}
                {project.photoKey && (
                  <View>
                    <div 
                      onClick={() => openImageModal(0)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <OptimizedImage
                        s3Key={project.photoKey}
                        alt={project.title || 'Project image'}
                        className="project-main-image"
                      />
                    </div>
                  </View>
                )}

                {/* Descripción */}
                <View>
                  <Heading 
                    level={3}
                    style={{
                      color: isDark ? '#F1F5F9' : '#1E293B',
                      marginBottom: '1rem'
                    }}
                  >
                    {t('project_details.description')}
                  </Heading>
                  <Text
                    style={{
                      color: isDark ? '#CBD5E1' : '#374151',
                      fontSize: '1.1rem',
                      lineHeight: '1.8',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {project.description}
                  </Text>
                </View>

                {/* Skills */}
                {project.skills && project.skills.length > 0 && (
                  <View>
                    <Heading 
                      level={3}
                      style={{
                        color: isDark ? '#F1F5F9' : '#1E293B',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Code size={20} />
                      {t('project_details.technologies_used')}
                    </Heading>
                    <Flex wrap="wrap" gap="small">
                      {project.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="skill-badge"
                          style={{
                            color: isDark ? '#E2E8F0' : '#1E293B'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </Flex>
                  </View>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <View>
                    <Heading 
                      level={3}
                      style={{
                        color: isDark ? '#F1F5F9' : '#1E293B',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Tag size={20} />
                      {t('tags')}
                    </Heading>
                    <Flex wrap="wrap" gap="small">
                      {project.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variation="info"
                          style={{
                            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                            color: isDark ? '#93C5FD' : '#1D4ED8',
                            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                            borderRadius: '16px'
                          }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </Flex>
                  </View>
                )}

                {/* Galería */}
                {project.galleryKeys && project.galleryKeys.length > 0 && (
                  <View>
                    <Heading 
                      level={3}
                      style={{
                        color: isDark ? '#F1F5F9' : '#1E293B',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <ImageIcon size={20} />
                      {t('gallery')}
                    </Heading>
                    <div className="gallery-container">
                      {project.galleryKeys.map((key, index) => (
                        key && (
                          <div 
                            key={index} 
                            onClick={() => openImageModal(index + 1)}
                            style={{ cursor: 'pointer' }}
                          >
                            <OptimizedImage
                              s3Key={key}
                              alt={`${project.title} - Image ${index + 1}`}
                              className="gallery-image"
                            />
                          </div>
                        )
                      ))}
                    </div>
                  </View>
                )}
              </Flex>
            </Card>
          </View>

          <Footer />
        </div>
      </div>

      {/* Modal de imagen */}
      {selectedImage !== null && allImageKeys[selectedImage] && (
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={closeImageModal}
              aria-label="Close"
            >
              ✕
            </button>
            
            <OptimizedImage
              s3Key={allImageKeys[selectedImage]}
              alt={`${project?.title || 'Project'} - Image ${selectedImage + 1}`}
              className="modal-image"
            />

            {allImageKeys.length > 1 && (
              <>
                <button
                  className="modal-nav modal-nav-left"
                  onClick={() => navigateImage('prev')}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="modal-nav modal-nav-right"
                  onClick={() => navigateImage('next')}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectDetailClient;
