'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { View, Flex, Text, Card, Button, Badge, Loader, SelectField, SearchField, Alert } from '@aws-amplify/ui-react';
import { ExternalLink, Award, Calendar, ArrowRight, Image as ImageIcon, Search } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { useRouter } from 'next/navigation';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';

// Tipos para la certificación
type Certification = Schema["Certifications"]["type"];

interface CertificationsSectionProps {
  className?: string;
  showAll?: boolean;
  maxItems?: number;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ 
  className = '', 
  showAll = false, 
  maxItems = 6 
}) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certificationImages, setCertificationImages] = useState<{ [key: string]: string }>({});
  const [filteredCertifications, setFilteredCertifications] = useState<Certification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const { isAuthenticated } = useAuth();
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

  // Function to handle card click navigation
  const handleCardClick = (certification: Certification, event: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons or links
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    const certificationPath = getLocalizedPath(`/certifications/${certification.slug || certification.id}`);
    router.push(certificationPath);
  };

  // Función para obtener URL de imagen desde S3
  const getImageUrl = async (photoKey: string | null | undefined): Promise<string | null> => {
    if (!photoKey) return null;
    
    try {
      // Normalizar el path - remover 'public/' si existe (para compatibilidad con Gen 1)
      const normalizedPath = photoKey.startsWith('public/') ? photoKey.slice(7) : photoKey;
      
      const url = await getUrl({ path: normalizedPath });
      return url.url.toString();
    } catch (err) {
      console.error('Error getting image URL for key:', photoKey, err);
      return null;
    }
  };

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch certifications from Amplify Data API
  const fetchCertifications = async () => {
    // Solo ejecutar en el cliente después de que esté montado
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Generar el cliente solo en el cliente
      const client = generateClient<Schema>();
      
      const response = await client.models.Certifications.list({
        authMode: isAuthenticated ? 'userPool' : 'identityPool' // Usar authMode dinámico basado en autenticación
      });
      
      if (response.data) {
        // Ordenar por fecha de emisión (más reciente primero)
        const sortedCertifications = response.data.sort((a, b) => 
          new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
        );
        
        setCertifications(sortedCertifications);
        setFilteredCertifications(sortedCertifications);
        
        // Cargar URLs de las imágenes para cada certificación
        const imageUrls: { [key: string]: string } = {};
        
        for (const certification of sortedCertifications) {
          if (certification.photoKey) {
            const imageUrl = await getImageUrl(certification.photoKey);
            if (imageUrl) {
              imageUrls[certification.id] = imageUrl;
            }
          }
        }
        
        setCertificationImages(imageUrls);
      }
    } catch (err) {
      console.error('Error fetching certifications:', err);
      setError('Error loading certifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [mounted, isAuthenticated]);

  // Filtrar certificaciones por categoría y término de búsqueda
  useEffect(() => {
    let filtered = certifications;

    // Filtrar por categoría (usando issuer como categoría)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cert => cert.issuer === selectedCategory);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cert => {
        const titleMatch = cert.title.toLowerCase().includes(searchTermLower);
        const issuerMatch = cert.issuer.toLowerCase().includes(searchTermLower);
        const skillsMatch = cert.skills?.some(skill => skill && skill.toLowerCase().includes(searchTermLower));
        return titleMatch || issuerMatch || skillsMatch;
      });
    }

    // Limitar el número de elementos si no se muestran todos
    if (!showAll && maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    setFilteredCertifications(filtered);
  }, [certifications, selectedCategory, searchTerm, showAll, maxItems]);

  // Obtener categorías únicas (issuers)
  const categories = useMemo(() => {
    const uniqueIssuers = Array.from(new Set(certifications.map(cert => cert.issuer)));
    return uniqueIssuers.filter(Boolean);
  }, [certifications]);

  const getCertificationBadgeColor = (issuer: string) => {
    const colors = ['info', 'success', 'warning', 'error'] as const;
    const index = issuer.length % colors.length;
    return colors[index];
  };

  // Estilos dinámicos basados en el tema - igual que en ProjectsSection
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

  // No renderizar nada hasta que esté montado (evita problemas de hidratación)
  if (!mounted) {
    return <Loader size="large" />;
  }

  return (
    <View className={`${className} certifications-section`} paddingTop="xl">
      <Flex direction="column" gap="xl">
        {/* Header Section */}
        <Flex direction="column" alignItems="center" gap="medium" paddingTop="xl">
          <Text
            fontSize={{ base: '2.5rem', medium: '3rem' }}
            fontWeight="700"
            color={mode === 'dark' ? 'white' : 'black'}
            textAlign="center"
            style={{
              background: 'linear-gradient(135deg, #007EB9, #9333EA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('certifications.title')}
          </Text>
          <Text
            fontSize="large"
            color={mode === 'dark' ? 'gray.300' : 'gray.600'}
            textAlign="center"
            maxWidth="600px"
          >
            {t('certifications.description')}
          </Text>
        </Flex>

        {/* Filters Section - Solo mostrar si showAll es true */}
        {showAll && (
          <View style={containerStyles} padding="2rem" marginBottom="3rem" marginLeft="2rem" marginRight="2rem">
            <Flex 
              direction={{ base: 'column', medium: 'row' }} 
              gap="1.5rem" 
              alignItems="center"
              justifyContent="center"
            >
              <Flex direction="column" gap="0.5rem">
                <Text 
                  fontSize="small" 
                  fontWeight="600"
                  color={mode === 'dark' ? '#CBD5E1' : '#64748B'}
                >
                  Search Certifications
                </Text>
                <SearchField
                  label="Search"
                  placeholder="Search by title, issuer, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm('')}
                  hasSearchIcon={true}
                  size="large"
                  width="300px"
                  style={{
                    backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)',
                    borderRadius: '12px',
                  }}
                />
              </Flex>
              <Flex direction="column" gap="0.5rem">
                <Text 
                  fontSize="small" 
                  fontWeight="600"
                  color={mode === 'dark' ? '#CBD5E1' : '#64748B'}
                >
                  Filter by Issuer
                </Text>
                <SelectField
                  label=""
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  size="large"
                  width="200px"
                  style={{
                    backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)',
                    borderRadius: '12px',
                  }}
                >
                  <option value="all">{t('certifications.allCategories')}</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </SelectField>
              </Flex>
            </Flex>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <Flex justifyContent="center" padding="xl">
            <Loader size="large" />
          </Flex>
        )}

        {/* Error State */}
        {error && (
          <Alert variation="error" isDismissible={false}>
            {error}
          </Alert>
        )}

        {/* Certifications Grid */}
        {!loading && !error && (
          <Flex wrap="wrap" gap="large" justifyContent="center">
            {filteredCertifications.map((certification) => (
              <Card
                key={certification.id}
                variation="elevated"
                className="certification-card"
                onClick={(e) => handleCardClick(certification, e)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  maxWidth: '400px',
                  minHeight: '320px'
                }}
              >
                <Flex direction="column" gap="medium" height="100%">
                  {/* Certification Image */}
                  <View className="certification-image-container" height="180px">
                    {certificationImages[certification.id] ? (
                      <img
                        src={certificationImages[certification.id]}
                        alt={certification.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <Flex
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                        backgroundColor={mode === 'dark' ? 'gray.800' : 'gray.100'}
                        borderRadius="medium"
                      >
                        <Award size={48} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                      </Flex>
                    )}
                  </View>

                  {/* Certification Details */}
                  <Flex direction="column" gap="small" flex="1">
                    <Text
                      fontSize="large"
                      fontWeight="600"
                      color={mode === 'dark' ? 'white' : 'black'}
                      lineHeight="1.3"
                    >
                      {certification.title}
                    </Text>

                    <Flex direction="row" alignItems="center" gap="xs">
                      <Award size={16} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                      <Text fontSize="small" color={mode === 'dark' ? 'gray.300' : 'gray.600'}>
                        {certification.issuer}
                      </Text>
                    </Flex>

                    <Flex direction="row" alignItems="center" gap="xs">
                      <Calendar size={16} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                      <Text fontSize="small" color={mode === 'dark' ? 'gray.300' : 'gray.600'}>
                        {new Date(certification.issueDate).toLocaleDateString()}
                      </Text>
                    </Flex>

                    {/* Skills */}
                    {certification.skills && certification.skills.length > 0 && (
                      <Flex wrap="wrap" gap="xs">
                        {certification.skills.slice(0, 3).map((skill, index) => (
                          skill && (
                            <Badge
                              key={index}
                              variation={getCertificationBadgeColor(certification.issuer)}
                              size="small"
                            >
                              {skill}
                            </Badge>
                          )
                        ))}
                        {certification.skills.length > 3 && (
                          <Badge variation="info" size="small">
                            +{certification.skills.length - 3}
                          </Badge>
                        )}
                      </Flex>
                    )}
                  </Flex>

                  {/* Action Buttons */}
                  <Flex direction="row" justifyContent="space-between" alignItems="center">
                    {certification.credentialUrl ? (
                      <Button
                        as="a"
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variation="primary"
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                        {t('certifications.viewCredential')}
                      </Button>
                    ) : (
                      <View />
                    )}

                    <Button
                      variation="link"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        const certificationPath = getLocalizedPath(`/certifications/${certification.slug || certification.id}`);
                        router.push(certificationPath);
                      }}
                    >
                      {t('certifications.viewDetails')}
                      <ArrowRight size={16} />
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}

        {/* Show All Button - Solo mostrar si no se muestran todas y hay más certificaciones */}
        {!showAll && !loading && filteredCertifications.length >= maxItems && (
          <Flex justifyContent="center" marginTop="xl">
            <Button
              variation="primary"
              size="large"
              onClick={() => router.push(getLocalizedPath('/certifications'))}
            >
              {t('certifications.viewAll')}
              <ArrowRight size={20} />
            </Button>
          </Flex>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCertifications.length === 0 && (
          <Flex
            direction="column"
            alignItems="center"
            gap="medium"
            padding="xl"
          >
            <Award size={64} color={mode === 'dark' ? '#6B7280' : '#9CA3AF'} />
            <Text
              fontSize="large"
              color={mode === 'dark' ? 'gray.300' : 'gray.600'}
              textAlign="center"
            >
              {searchTerm || selectedCategory !== 'all' 
                ? t('certifications.noResults')
                : t('certifications.noCertifications')
              }
            </Text>
          </Flex>
        )}
      </Flex>
    </View>
  );
};

export default CertificationsSection;
