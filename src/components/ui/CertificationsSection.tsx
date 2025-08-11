'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { View, Flex, Text, Card, Button, Badge, Loader, SelectField, SearchField, Alert } from '@aws-amplify/ui-react';
import { ExternalLink, Award, Calendar, ArrowRight, Image as ImageIcon, Search, Filter, ChevronDown, X } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import { useRouter } from 'next/navigation';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';

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
        authMode: isAuthenticated ? 'userPool' : 'apiKey' // Usar authMode dinámico basado en autenticación
      });
      
      if (response.data) {
        // Filtrar nulls y ordenar por fecha de emisión (más reciente primero)
        const sortedCertifications = response.data
          .filter(cert => cert !== null && cert.issueDate)
          .sort((a, b) => 
            new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
          );
        
        setCertifications(sortedCertifications);
        setFilteredCertifications(sortedCertifications);
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
    <>
      <style jsx global>{`
        .certification-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }
      `}</style>
      <View className={`${className} certifications-section`} padding="4rem 2rem">
        <Flex direction="column" gap="xl">
        {/* Header Section */}
        <Flex direction="column" alignItems="center" gap="medium" paddingTop="xl">
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
            {t('certifications.title')}{' '}
            <span style={{ 
              backgroundImage: mode === 'dark'
                ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                : 'linear-gradient(135deg, #2563EB, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t('certifications.titleHighlight')}
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
                <View 
                  position="relative" 
                  width="320px"
                  style={{
                    background: mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(71, 85, 105, 0.85) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: mode === 'dark' 
                      ? '1px solid rgba(148, 163, 184, 0.3)'
                      : '1px solid rgba(203, 213, 225, 0.4)',
                    borderRadius: '16px',
                    boxShadow: mode === 'dark'
                      ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                  }}
                >
                  <View 
                    position="absolute" 
                    left="14px" 
                    top="50%" 
                    transform="translateY(-50%)"
                    style={{ pointerEvents: 'none' }}
                  >
                    <Search 
                      size={20} 
                      color={mode === 'dark' ? '#94A3B8' : '#64748B'} 
                    />
                  </View>
                  <input
                    type="text"
                    placeholder="Search by title, issuer, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search-input"
                    style={{
                      width: '100%',
                      padding: '14px 44px 14px 44px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                      fontFamily: 'inherit',
                    }}
                  />
                  {searchTerm && (
                    <View 
                      position="absolute" 
                      right="14px" 
                      top="50%" 
                      transform="translateY(-50%)"
                      style={{ 
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => setSearchTerm('')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = mode === 'dark' 
                          ? 'rgba(148, 163, 184, 0.2)' 
                          : 'rgba(100, 116, 139, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <X 
                        size={18} 
                        color={mode === 'dark' ? '#94A3B8' : '#64748B'} 
                      />
                    </View>
                  )}
                </View>
              </Flex>
              <Flex direction="column" gap="0.5rem">
                <Text 
                  fontSize="small" 
                  fontWeight="600"
                  color={mode === 'dark' ? '#CBD5E1' : '#64748B'}
                >
                  Filter by Issuer
                </Text>
                <View 
                  position="relative" 
                  width="240px"
                  className="custom-select-container"
                  style={{
                    background: mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(71, 85, 105, 0.85) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: mode === 'dark' 
                      ? '1px solid rgba(148, 163, 184, 0.3)'
                      : '1px solid rgba(203, 213, 225, 0.4)',
                    borderRadius: '16px',
                    boxShadow: mode === 'dark'
                      ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                  }}
                >
                  <View 
                    position="absolute" 
                    left="14px" 
                    top="50%" 
                    transform="translateY(-50%)"
                    style={{ pointerEvents: 'none' }}
                  >
                    <Filter 
                      size={20} 
                      color={mode === 'dark' ? '#94A3B8' : '#64748B'} 
                    />
                  </View>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="custom-select-input"
                    style={{
                      width: '100%',
                      padding: '14px 44px 14px 44px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                    }}
                  >
                    <option value="all">{t('certifications.allCategories')}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <View 
                    position="absolute" 
                    right="14px" 
                    top="50%" 
                    transform="translateY(-50%)"
                    style={{ pointerEvents: 'none' }}
                  >
                    <ChevronDown 
                      size={20} 
                      color={mode === 'dark' ? '#94A3B8' : '#64748B'} 
                    />
                  </View>
                </View>
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
                    {certification.photoKey ? (
                      <OptimizedImage
                        s3Key={certification.photoKey}
                        alt={certification.title}
                        className="certification-image"
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
    </>
  );
};

export default CertificationsSection;
