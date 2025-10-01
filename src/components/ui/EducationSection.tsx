'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Card, Badge, Loader, Alert } from '@aws-amplify/ui-react';
import { GraduationCap, MapPin, Calendar, Award, ExternalLink } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';

// Tipos para la educación
type Education = Schema["Education"]["type"];

interface EducationSectionProps {
  className?: string;
  showAll?: boolean;
  maxItems?: number;
}

const EducationSection: React.FC<EducationSectionProps> = ({ 
  className = '', 
  showAll = false, 
  maxItems = 3 
}) => {
  const [education, setEducation] = useState<Education[]>([]);
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

  // We no longer need the getImageUrl function since we're using the OptimizedImage component

  // Función para cargar educación desde Amplify
  const loadEducationFromAmplify = async (): Promise<Education[]> => {
    try {
      const authMode = isAuthenticated ? 'userPool' : 'identityPool';
      const { data: educationData } = await client.models.Education.list({
        authMode,
        limit: showAll ? 1000 : maxItems
      });

      if (!educationData) {
        return [];
      }

      // Ordenar por fecha de inicio (más reciente primero)
      const sortedEducation = [...educationData].sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });

      return sortedEducation;
    } catch (err) {
      console.error('Error cargando educación desde Amplify:', err);
      throw err;
    }
  };

  // Función para cargar todos los datos
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const educationData = await loadEducationFromAmplify();
      setEducation(educationData);
    } catch (err) {
      console.error('Error cargando datos de educación:', err);
      setError(t('education.error'));
    } finally {
      setLoading(false);
    }
  };

  // Effect para cargar datos cuando el componente se monta
  useEffect(() => {
    if (!mounted) return;
    loadAllData();
  }, [mounted, isAuthenticated, showAll, maxItems]);

  if (!mounted) {
    return null;
  }

  // Estilos dinámicos basados en el tema
  const containerStyles = {
    background: mode === 'dark'
      ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(71, 85, 105, 0.85) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: mode === 'dark'
      ? '1px solid rgba(148, 163, 184, 0.2)'
      : '1px solid rgba(203, 213, 225, 0.3)',
    borderRadius: '24px',
  // Responsive padding: keep horizontal compact on mobile, add more vertical space
  paddingInline: 'clamp(1rem, 3.5vw, 2rem)',
  paddingTop: 'clamp(2rem, 6vw, 4rem)',
  paddingBottom: 'clamp(2rem, 6vw, 4rem)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    marginBottom: '3rem',
    boxShadow: mode === 'dark'
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 8px 16px -8px rgba(0, 0, 0, 0.3)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)',
  };

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

  const cardStyles = (index: number) => ({
    background: mode === 'dark'
      ? `linear-gradient(135deg, rgba(71, 85, 105, ${0.8 - index * 0.05}) 0%, rgba(51, 65, 85, ${0.9 - index * 0.05}) 100%)`
      : `linear-gradient(135deg, rgba(248, 250, 252, ${0.9 - index * 0.05}) 0%, rgba(241, 245, 249, ${0.8 - index * 0.05}) 100%)`,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: mode === 'dark'
      ? '1px solid rgba(148, 163, 184, 0.2)'
      : '1px solid rgba(203, 213, 225, 0.3)',
    borderRadius: '20px',
    padding: '2rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: mode === 'dark'
      ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)'
      : '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
    cursor: 'default',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  });

  const formatDate = (dateString: string) => {
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

  const getEducationPeriod = (startDate: string | null | undefined, endDate: string | null | undefined) => {
    if (!startDate) return t('education.dateNotSpecified');
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : t('education.present');
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
  <View style={containerStyles} className={className}>
        <Flex direction="column" alignItems="center" gap="1rem">
          <Loader size="large" />
          <Text style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
    {t('education.loading')}
          </Text>
        </Flex>
      </View>
    );
  }

  if (error) {
    return (
      <View style={containerStyles} className={className}>
        <Alert variation="error" hasIcon>
          {error}
        </Alert>
      </View>
    );
  }

  if (!education.length) {
    return (
  <View style={containerStyles} className={className}>
        <Flex direction="column" alignItems="center" gap="2rem">
          <View style={{
            padding: '2rem',
            borderRadius: '50%',
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
          }}>
            <GraduationCap 
              size={48} 
              color={mode === 'dark' ? '#60A5FA' : '#3B82F6'} 
            />
          </View>
          <Text 
            fontSize="1.25rem" 
            textAlign="center"
            style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
          >
            {t('education.empty')}
          </Text>
        </Flex>
      </View>
    );
  }

  return (
    <View style={containerStyles} className={className}>
      <style jsx global>{`
        .education-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px;
        }
      `}</style>
      {/* Header */}
  <Flex direction="column" alignItems="center" gap="1rem" marginBottom="3rem">
        <Text
          as="h2"
          fontSize={{ base: '2rem', medium: '2.5rem' }}
          fontWeight="700"
          textAlign="center"
          lineHeight="1.1"
          style={titleStyles}
        >
          {t('education.title')} {' '}
          <span style={titleHighlightStyles}>{t('education.titleHighlight')}</span>
        </Text>
        <Text 
          fontSize="1.25rem"
          textAlign="center"
          style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
        >
          {t('education.description')}
        </Text>
      </Flex>

      {/* Education Grid */}
      <Flex direction="column" gap="2rem">
        {education.map((edu, index) => (
          <View key={edu.id} style={cardStyles(index)}>
            <Flex 
              direction={{ base: 'column', medium: 'row' }} 
              gap="2rem" 
              alignItems={{ base: 'stretch', medium: 'flex-start' }}
            >
              {/* Institution Image */}
              {edu.photoKey && (
                <View style={{
                  flexShrink: 0,
                  width: '120px',
                  height: '120px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.5), rgba(51, 65, 85, 0.5))'
                    : 'linear-gradient(135deg, rgba(248, 250, 252, 0.5), rgba(241, 245, 249, 0.5))',
                }}>
                  <OptimizedImage
                    s3Key={edu.photoKey}
                    alt={edu.institution || t('education.institutionAlt')}
                    className="education-image"
                  />
                </View>
              )}

              {/* Education Content */}
              <Flex direction="column" gap="1rem" flex="1">
                {/* Header */}
                <Flex direction="column" gap="0.5rem">
                  <Text 
                    fontSize="1.5rem" 
                    fontWeight="700"
                    style={{ color: mode === 'dark' ? '#F8FAFC' : '#0F172A' }}
                  >
                    {edu.degree}
                  </Text>
                  {edu.fieldOfStudy && (
                    <Text 
                      fontSize="1.125rem" 
                      fontWeight="500"
                      style={{ 
                        color: mode === 'dark' ? '#60A5FA' : '#3B82F6',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {edu.fieldOfStudy}
                    </Text>
                  )}
                  <Text 
                    fontSize="1rem" 
                    fontWeight="600"
                    style={{ color: mode === 'dark' ? '#CBD5E1' : '#475569' }}
                  >
                    {edu.institution}
                  </Text>
                </Flex>

                {/* Details */}
                <Flex direction="column" gap="0.75rem">
                  <Flex alignItems="center" gap="0.5rem">
                    <Calendar 
                      size={16} 
                      color={mode === 'dark' ? '#94A3B8' : '#64748B'} 
                    />
                    <Text 
                      fontSize="0.875rem"
                      style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
                    >
                      {getEducationPeriod(edu.startDate, edu.endDate)}
                    </Text>
                  </Flex>
                  
                  {edu.location && (
                    <Flex alignItems="center" gap="0.5rem">
                      <MapPin 
                        size={16} 
                        color={mode === 'dark' ? '#94A3B8' : '#64748B'} 
                      />
                      <Text 
                        fontSize="0.875rem"
                        style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
                      >
                        {edu.location}
                      </Text>
                    </Flex>
                  )}
                </Flex>

                {/* Description */}
                {edu.description && (
                  <Text 
                    fontSize="1rem" 
                    lineHeight="1.6"
                    style={{ 
                      color: mode === 'dark' ? '#E2E8F0' : '#374151',
                      marginTop: '0.5rem'
                    }}
                  >
                    {edu.description}
                  </Text>
                )}

                {/* Recognitions */}
                {edu.recognition && edu.recognition.length > 0 && (
                  <Flex direction="column" gap="0.5rem" marginTop="1rem">
                    <Flex alignItems="center" gap="0.5rem">
                      <Award 
                        size={16} 
                        color={mode === 'dark' ? '#F59E0B' : '#D97706'} 
                      />
                      <Text 
                        fontSize="0.875rem" 
                        fontWeight="600"
                        style={{ color: mode === 'dark' ? '#F59E0B' : '#D97706' }}
                      >
                        {t('education.recognitionLabel')}
                      </Text>
                    </Flex>
                    <Flex wrap="wrap" gap="0.5rem">
                      {edu.recognition.map((rec, idx) => (
                        <Badge 
                          key={idx} 
                          variation="info"
                          style={{
                            background: mode === 'dark' 
                              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))'
                              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
                            color: mode === 'dark' ? '#93C5FD' : '#2563EB',
                            border: mode === 'dark' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '12px',
                            padding: '4px 12px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                          }}
                        >
                          {rec}
                        </Badge>
                      ))}
                    </Flex>
                  </Flex>
                )}

                {/* Certificate Link */}
                {edu.CertificateURL && (
                  <Flex justifyContent="flex-start" marginTop="1rem">
                    <button
                      onClick={() => window.open(edu.CertificateURL!, '_blank', 'noopener,noreferrer')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '8px 16px',
                        background: mode === 'dark' 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))'
                          : 'linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(37, 99, 235, 1))',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = mode === 'dark' 
                          ? '0 8px 25px rgba(59, 130, 246, 0.4)'
                          : '0 8px 25px rgba(59, 130, 246, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <ExternalLink size={16} />
                      {t('education.viewCertificate')}
                    </button>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </View>
        ))}
      </Flex>
    </View>
  );
};

export default EducationSection;
