'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Card, Button, Badge, Loader, Alert } from '@aws-amplify/ui-react';
import { ExternalLink, Award, Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';

type Certification = Schema["Certifications"]["type"];

interface FeaturedCertificationsProps {
  className?: string;
}

const FeaturedCertifications: React.FC<FeaturedCertificationsProps> = ({ className = '' }) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certificationImages, setCertificationImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleCardClick = (certification: Certification, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    const certificationPath = getLocalizedPath(`/certifications/${certification.slug || certification.id}`);
    router.push(certificationPath);
  };

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    async function fetchCertifications() {
      try {
        setLoading(true);
        setError(null);
        const client = generateClient<Schema>();
        const { data: certificationsData, errors } = await client.models.Certifications.list({
          limit: 3,
          authMode: isAuthenticated ? 'userPool' : 'identityPool',
        });

        if (errors) {
          console.error('Error fetching certifications:', errors);
          setError('Failed to load certifications');
          return;
        }
        
        const sortedCertifications = (certificationsData || [])
          .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
          .slice(0, 3);

        setCertifications(sortedCertifications);

        const imageUrls: { [key: string]: string } = {};
        for (const cert of sortedCertifications) {
          if (cert.photoKey) {
            const imageUrl = await getImageUrl(cert.photoKey);
            if (imageUrl) {
              imageUrls[cert.id] = imageUrl;
            }
          }
        }
        
        setCertificationImages(imageUrls);
      } catch (err) {
        console.error('Error fetching certifications:', err);
        setError('Failed to load certifications');
      } finally {
        setLoading(false);
      }
    }
    fetchCertifications();
  }, [mounted]);

  const getCategoryColor = (category: string | null | undefined) => {
    switch (category) {
      case 'Technology': return mode === 'dark' ? '#3B82F6' : '#2563EB';
      case 'Business': return mode === 'dark' ? '#10B981' : '#059669';
      case 'Arts': return mode === 'dark' ? '#F59E0B' : '#D97706';
      case 'Health': return mode === 'dark' ? '#EF4444' : '#DC2626';
      case 'Languages': return mode === 'dark' ? '#8B5CF6' : '#7C3AED';
      default: return mode === 'dark' ? '#6B7280' : '#4B5563';
    }
  };

  if (!mounted) {
    return (
      <View as="section" padding={{ base: '3rem 1rem', medium: '4rem 2rem' }} style={{ backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC' }}>
        <Flex direction="column" alignItems="center" gap="2rem" maxWidth="1200px" margin="0 auto">
          <Loader size="large" />
        </Flex>
      </View>
    );
  }

  if (loading) {
    return (
      <View as="section" padding={{ base: '3rem 1rem', medium: '4rem 2rem' }} style={{ backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC' }}>
        <Flex direction="column" alignItems="center" gap="2rem" maxWidth="1200px" margin="0 auto">
          <Flex direction="column" alignItems="center" gap="1rem" textAlign="center">
            <Text fontSize={{ base: '2rem', medium: '2.5rem' }} fontWeight="700" style={{ backgroundImage: mode === 'dark' ? 'linear-gradient(135deg, #93C5FD, #60A5FA)' : 'linear-gradient(135deg, #F59E0B, #FBBF24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {t('certifications.title')} <span style={{ backgroundImage: mode === 'dark' ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' : 'linear-gradient(135deg, #2563EB, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('certifications.titleHighlight')}</span>
            </Text>
          </Flex>
          <Loader size="large" />
        </Flex>
      </View>
    );
  }

  if (error) {
    return (
      <View as="section" padding={{ base: '3rem 1rem', medium: '4rem 2rem' }} style={{ backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC' }}>
        <Flex direction="column" alignItems="center" gap="2rem" maxWidth="1200px" margin="0 auto">
          <Text color="error.60">{t('certifications.error')}</Text>
        </Flex>
      </View>
    );
  }

  return (
    <View as="section" padding={{ base: '6rem 1rem', medium: '7rem 2rem' }} style={{ backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC' }}>
      <Flex direction="column" alignItems="center" gap="3rem" maxWidth="1200px" margin="0 auto">
        <Flex direction="column" alignItems="center" gap="1rem" textAlign="center">
          <Text fontSize={{ base: '2rem', medium: '2.5rem' }} fontWeight="700" style={{ backgroundImage: mode === 'dark' ? 'linear-gradient(135deg, #A5B4FC, #6366F1)' : 'linear-gradient(135deg, #F59E0B, #FBBF24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t('certifications.title')} <span style={{ backgroundImage: mode === 'dark' ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' : 'linear-gradient(135deg, #6366F1, #4F46E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('certifications.titleHighlight')}</span>
          </Text>
          <Text fontSize={{ base: '1rem', medium: '1.125rem' }} maxWidth="600px" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B', lineHeight: 1.6 }}>
            {t('certifications.description')}
          </Text>
        </Flex>

        {certifications.length > 0 ? (
          <Flex direction={{ base: 'column', medium: 'row' }} gap="1.5rem" width="100%" wrap="wrap" justifyContent="center">
            {certifications.map((cert) => (
              <Card key={cert.id} variation="elevated" onClick={(event) => handleCardClick(cert, event)} style={{ flex: '1', minWidth: '320px', maxWidth: '380px', backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)', borderRadius: '16px', boxShadow: mode === 'dark' ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transition: 'all 0.3s ease', overflow: 'hidden', cursor: 'pointer' }} className="hover:scale-105" onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'; e.currentTarget.style.boxShadow = mode === 'dark' ? '0 25px 35px -5px rgba(0, 0, 0, 0.4), 0 15px 15px -5px rgba(0, 0, 0, 0.3)' : '0 25px 35px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = mode === 'dark' ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'; }}>
                {cert.photoKey && certificationImages[cert.id] ? (
                  <View style={{ width: '100%', height: '200px', backgroundImage: `url(${certificationImages[cert.id]})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', position: 'relative' }}>
                    <View style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      {cert.category && (
                        <Badge size="small" style={{ backgroundColor: getCategoryColor(cert.category), color: 'white', fontWeight: '600', borderRadius: '8px', padding: '4px 8px' }}>
                          {t(`certifications.categories.${cert.category}`)}
                        </Badge>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={{ width: '100%', height: '200px', backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <ImageIcon size={48} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    <View style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      {cert.category && (
                        <Badge size="small" style={{ backgroundColor: getCategoryColor(cert.category), color: 'white', fontWeight: '600', borderRadius: '8px', padding: '4px 8px' }}>
                          {t(`certifications.categories.${cert.category}`)}
                        </Badge>
                      )}
                    </View>
                  </View>
                )}
                <Flex direction="column" padding="1.5rem" gap="1rem">
                  <Flex direction="column" gap="0.5rem">
                    <Text fontSize="1.25rem" fontWeight="700" style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B', lineHeight: 1.3 }}>
                      {cert.title}
                    </Text>
                    <Text fontSize="0.875rem" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B', lineHeight: 1.5 }}>
                      {t('certifications.labels.issuedBy', { issuer: cert.issuer })}
                    </Text>
                  </Flex>
                  <Flex alignItems="center" gap="0.5rem">
                    <Calendar size={14} style={{ color: mode === 'dark' ? '#93C5FD' : '#2563EB' }} />
                    <Text fontSize="0.75rem" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B', fontWeight: '500' }}>
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </Text>
                  </Flex>
                  {cert.skills && cert.skills.length > 0 && (
                    <Flex direction="column" gap="0.5rem">
                      <Text fontSize="0.75rem" fontWeight="600" style={{ color: mode === 'dark' ? '#93C5FD' : '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('certifications.labels.skills')}
                      </Text>
                      <Flex wrap="wrap" gap="0.25rem">
                        {cert.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} size="small" style={{ backgroundColor: mode === 'dark' ? 'rgba(147, 197, 253, 0.2)' : 'rgba(37, 99, 235, 0.1)', color: mode === 'dark' ? '#93C5FD' : '#2563EB', border: mode === 'dark' ? '1px solid rgba(147, 197, 253, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '6px', fontWeight: '500', fontSize: '0.7rem' }}>
                            {skill}
                          </Badge>
                        ))}
                        {cert.skills.length > 4 && (
                          <Badge size="small" style={{ backgroundColor: mode === 'dark' ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)', color: mode === 'dark' ? '#9CA3AF' : '#6B7280', borderRadius: '6px', fontWeight: '500', fontSize: '0.7rem' }}>
                            +{cert.skills.length - 4}
                          </Badge>
                        )}
                      </Flex>
                    </Flex>
                  )}
                  <Flex gap="0.75rem" marginTop="0.5rem">
                    {cert.credentialUrl && (
                      <Button as="a" href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" size="small" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: mode === 'dark' ? '#1E40AF' : '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.75rem', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', transition: 'all 0.2s ease' }} className="hover:scale-105">
                        <ExternalLink size={12} />
                        {t('certifications.actions.viewCredential')}
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>
        ) : (
          <Text style={{ color: mode === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: '1.125rem', textAlign: 'center' }}>
            {t('certifications.noCertifications')}
          </Text>
        )}
        <Button as="a" href={getLocalizedPath('/certifications')} size="large" style={{ backgroundColor: 'transparent', color: mode === 'dark' ? '#93C5FD' : '#2563EB', border: mode === 'dark' ? '2px solid #93C5FD' : '2px solid #2563EB', borderRadius: '12px', fontWeight: '600', fontSize: '1rem', padding: '12px 24px', textDecoration: 'none', transition: 'all 0.3s ease' }} className="hover:scale-105">
          {t('certifications.viewAll')}
        </Button>
      </Flex>
    </View>
  );
};

export default FeaturedCertifications;
