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
  Award, 
  Calendar,
  Tag,
  Globe,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import { useAuth } from '@/context/auth-context';
import HeaderControls from '@/components/ui/HeaderControls';
import Footer from '@/components/ui/Footer';

// Tipos para la certificación
type Certification = Schema["Certifications"]["type"];

interface CertificationDetailClientProps {
  locale: SupportedLocale;
  slug: string;
}

// Estilos personalizados
const certificationDetailStyles = `
  .certification-detail-container {
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

  .certification-detail-container::before {
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

  .certification-content {
    position: relative;
    z-index: 1;
  }

  .certification-main-image {
    width: 100%;
    height: 400px;
    object-fit: contain;
    border-radius: 16px;
    transition: transform 0.3s ease;
  }

  .certification-main-image:hover {
    transform: scale(1.02);
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
    .certification-main-image {
      height: 250px;
    }

    .modal-close {
      top: 10px;
      right: 10px;
    }
  }
`;

function CertificationDetailClient({ locale, slug }: CertificationDetailClientProps): React.JSX.Element {
  const { mode } = useTheme();
  const { t } = useTranslation('common');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();
  const { isAuthenticated } = useAuth();

  // Estados
  const [certification, setCertification] = useState<Certification | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<boolean>(false);

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
    }
  };

  // Fetch certification data
  useEffect(() => {
    const fetchCertification = async () => {
      try {
        setLoading(true);
        setError('');
        
        const client = generateClient<Schema>();
        const response = await client.models.Certifications.list({
          filter: { slug: { eq: slug } },
          authMode: isAuthenticated ? 'userPool' : 'identityPool'
        });

        const foundCertification = response.data?.[0];
        
        if (!foundCertification) {
          setError('Certification not found');
          router.push(getLocalizedPath('/certifications'));
          return;
        }

        setCertification(foundCertification);
      } catch (err) {
        console.error('Error fetching certification:', err);
        setError('Error loading certification data');
      }
    };

    fetchCertification();
  }, [slug, router, getLocalizedPath, isAuthenticated]);

  // Cargar imagen de la certificación
  useEffect(() => {
    if (!certification) return;
    
    const loadImage = async () => {
      try {
        // Cargar imagen principal
        if (certification.photoKey) {
          const mainUrl = await getImageUrl(certification.photoKey);
          if (mainUrl) {
            setImageUrl(mainUrl);
          }
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError('Error loading certification image');
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [certification]);

  // Función para obtener el color del badge según la categoría
  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'linear-gradient(135deg, #3B82F6, #2563EB)',
      'Business': 'linear-gradient(135deg, #10B981, #059669)',
      'Arts': 'linear-gradient(135deg, #F59E0B, #D97706)',
      'Health': 'linear-gradient(135deg, #EF4444, #DC2626)',
      'Languages': 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
    };
    return colors[category as keyof typeof colors] || 'linear-gradient(135deg, #6B7280, #4B5563)';
  };

  // Función para obtener el estado de la certificación
  const getCertificationStatus = (expirationDate: string | null | undefined) => {
    if (!expirationDate) return 'active';
    const now = new Date();
    const expDate = new Date(expirationDate);
    return expDate > now ? 'active' : 'expired';
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

  // Abrir/cerrar modal de imagen
  const openImageModal = () => {
    setSelectedImage(true);
  };

  const closeImageModal = () => {
    setSelectedImage(false);
  };

  const isDark = mode === 'dark';

  // Show loading state
  if (loading || !certification) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: certificationDetailStyles }} />
        <div className="certification-detail-container">
          <div className="certification-content">
            <HeaderControls />
            <View style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
              <Card style={{ 
                padding: '2rem', 
                backgroundColor: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: '24px',
                textAlign: 'center'
              }}>
                <Flex direction="column" alignItems="center" gap="large">
                  <Loader size="large" />
                  <Text style={{ color: isDark ? '#CBD5E1' : '#374151' }}>
                    Loading certification...
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
        <style dangerouslySetInnerHTML={{ __html: certificationDetailStyles }} />
        <div className="certification-detail-container">
          <div className="certification-content">
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
                  onClick={() => router.push(getLocalizedPath('/certifications'))}
                >
                  <ArrowLeft size={20} />
                  Back to Certifications
                </Button>
              </Card>
            </View>
            <Footer />
          </div>
        </div>
      </>
    );
  }

  const status = getCertificationStatus(certification.expirationDate);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: certificationDetailStyles }} />
      
      <div className="certification-detail-container">
        <div className="certification-content">
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
              onClick={() => router.push(getLocalizedPath('/certifications'))}
            >
              <ArrowLeft size={20} />
              {t('certification_details.back_to_certifications')}
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
                {/* Header de la certificación */}
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
                        {certification.title}
                      </Heading>
                      
                      {certification.issuer && (
                        <Flex alignItems="center" gap="small" style={{ marginBottom: '0.5rem' }}>
                          <Shield size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            {t('certification_details.issued_by')} {certification.issuer}
                          </Text>
                        </Flex>
                      )}

                      <Flex alignItems="center" gap="small">
                        <Calendar size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                          {t('certification_details.issued_on')} {formatDate(certification.issueDate)}
                          {certification.expirationDate && (
                            <span> - {t('certification_details.expires_on')} {formatDate(certification.expirationDate)}</span>
                          )}
                        </Text>
                      </Flex>
                    </View>

                    {/* Badges de categoría y estado */}
                    <Flex direction="column" gap="small" alignItems={{ base: 'flex-start', medium: 'flex-end' }}>
                      {certification.category && (
                        <Badge
                          style={{
                            background: getCategoryColor(certification.category),
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: 'none'
                          }}
                        >
                          {t(`certification_details.categories.${certification.category}`)}
                        </Badge>
                      )}
                      
                      <Badge
                        style={{
                          backgroundColor: status === 'active' 
                            ? (isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)')
                            : (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'),
                          color: status === 'active' 
                            ? (isDark ? '#4ADE80' : '#16A34A')
                            : (isDark ? '#F87171' : '#DC2626'),
                          border: `1px solid ${status === 'active' 
                            ? (isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)')
                            : (isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)')}`,
                          borderRadius: '16px',
                          fontWeight: '600'
                        }}
                      >
                        {t(`certification_details.status.${status}`)}
                      </Badge>
                    </Flex>
                  </Flex>

                  {/* Botones de acción */}
                  <Flex 
                    direction={{ base: 'column', medium: 'row' }}
                    gap="medium"
                    style={{ marginTop: '1.5rem' }}
                  >
                    {certification.credentialUrl && (
                      <a
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button"
                      >
                        <ExternalLink size={16} />
                        {t('certification_details.view_credential')}
                      </a>
                    )}
                  </Flex>
                </View>

                <Divider />

                {/* Imagen principal */}
                {imageUrl && (
                  <View>
                    <img
                      src={imageUrl}
                      alt={certification.title}
                      className="certification-main-image"
                      onClick={openImageModal}
                      style={{ cursor: 'pointer' }}
                    />
                  </View>
                )}

                {/* Detalles adicionales */}
                <View>
                  <Flex direction="column" gap="medium">
                    {certification.credentialId && (
                      <Flex alignItems="center" gap="small">
                        <Text fontWeight="600" style={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                          {t('certification_details.credential_id')}:
                        </Text>
                        <Text style={{ color: isDark ? '#CBD5E1' : '#374151', fontFamily: 'monospace' }}>
                          {certification.credentialId}
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                </View>

                {/* Skills */}
                {certification.skills && certification.skills.length > 0 && (
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
                      <Award size={20} />
                      {t('certification_details.skills_covered')}
                    </Heading>
                    <Flex wrap="wrap" gap="small">
                      {certification.skills.map((skill, index) => (
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
              </Flex>
            </Card>
          </View>

          <Footer />
        </div>
      </div>

      {/* Modal de imagen */}
      {selectedImage && imageUrl && (
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={closeImageModal}
              aria-label="Close"
            >
              ✕
            </button>
            
            <img
              src={imageUrl}
              alt={certification.title}
              className="modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CertificationDetailClient;
