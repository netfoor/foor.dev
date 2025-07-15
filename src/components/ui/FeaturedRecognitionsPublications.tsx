'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Card, Button, Badge, Loader, Alert, Tabs } from '@aws-amplify/ui-react';
import { 
  Award, 
  ExternalLink, 
  Calendar, 
  Share2, 
  ArrowRight,
  Youtube,
  Twitter,
  Github,
  Linkedin,
  BookOpen,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUrl } from 'aws-amplify/storage';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { 
  loadRecognitionsFromAmplify, 
  loadPublicationsFromAmplify,
  type Recognition,
  type Publication
} from '@/lib/recognitions/recognitionsLoader';

interface FeaturedRecognitionsPublicationsProps {
  className?: string;
}

const FeaturedRecognitionsPublications: React.FC<FeaturedRecognitionsPublicationsProps> = ({ 
  className = '' 
}) => {
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'recognitions' | 'publications'>('recognitions');

  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Get image URL from S3
  const getImageUrl = async (photoKey: string | null | undefined): Promise<string | null> => {
    if (!photoKey) return null;
    
    try {
      // Normalize path - remove 'public/' if exists (for Gen 1 compatibility)
      const normalizedPath = photoKey.startsWith('public/') ? photoKey.slice(7) : photoKey;
      
      const url = await getUrl({ path: normalizedPath });
      return url.url.toString();
    } catch (err) {
      console.error('Error getting image URL for key:', photoKey, err);
      return null;
    }
  };

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data from Amplify
  useEffect(() => {
    // Only run on client after component is mounted
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Load recognitions (limit to 3 for featured section)
        const recognitionsData = await loadRecognitionsFromAmplify(3, isAuthenticated);
        setRecognitions(recognitionsData);
        
        // Load publications (limit to 3 for featured section)
        const publicationsData = await loadPublicationsFromAmplify(3, isAuthenticated);
        setPublications(publicationsData);
        
        // Load images for both types
        const imageUrls: { [key: string]: string } = {};
        
        // Process recognition images
        for (const recognition of recognitionsData) {
          if (recognition.photoKey) {
            const imageUrl = await getImageUrl(recognition.photoKey);
            if (imageUrl) {
              imageUrls[recognition.id] = imageUrl;
            }
          }
        }
        
        // Process publication images
        for (const publication of publicationsData) {
          if (publication.photoKey) {
            const imageUrl = await getImageUrl(publication.photoKey);
            if (imageUrl) {
              imageUrls[publication.id] = imageUrl;
            }
          }
        }
        
        setImages(imageUrls);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [mounted, isAuthenticated]);

  // Get appropriate icon for publication source
  const getSourceIcon = (source: string | null | undefined) => {
    switch (source) {
      case 'Youtube':
        return <Youtube size={16} />;
      case 'Twitter':
        return <Twitter size={16} />;
      case 'GitHub':
        return <Github size={16} />;
      case 'LinkedIn':
        return <Linkedin size={16} />;
      case 'Blog':
        return <BookOpen size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  // Get color for publication type
  const getPublicationTypeColor = (type: string | null | undefined) => {
    switch (type) {
      case 'Article':
        return mode === 'dark' ? '#93C5FD' : '#3B82F6';
      case 'Blog':
        return mode === 'dark' ? '#C4B5FD' : '#8B5CF6';
      case 'Video':
        return mode === 'dark' ? '#FCA5A5' : '#EF4444';
      case 'Podcast':
        return mode === 'dark' ? '#6EE7B7' : '#10B981';
      case 'Conference':
        return mode === 'dark' ? '#FCD34D' : '#F59E0B';
      default:
        return mode === 'dark' ? '#94A3B8' : '#64748B';
    }
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  };

  // If not mounted yet, return a placeholder to avoid hydration issues
  if (!mounted) {
    return (
      <View
        as="section"
        padding={{ base: '3rem 1rem', medium: '4rem 2rem' }}
        style={{
          backgroundColor: 'transparent',
          minHeight: '200px'
        }}
      />
    );
  }

  return (
    <View
      as="section"
      padding={{ base: '3rem 1rem', medium: '4rem 2rem' }}
      className={className}
      style={{
        backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
        position: 'relative',
      }}
    >
      {/* Background pattern */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
      />
      
      <Flex 
        direction="column" 
        alignItems="center" 
        gap="2rem" 
        maxWidth="1200px" 
        margin="0 auto"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Section Header */}
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
            {t('recognitions.title') || 'Recognitions'}{' '}
            <span style={{ 
              backgroundImage: mode === 'dark' 
                ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' 
                : 'linear-gradient(135deg, #2563EB, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{t('recognitions.titleHighlight') || '& Publications'}</span>
          </Text>
          
          <Text
            fontSize={{ base: '1rem', medium: '1.125rem' }}
            maxWidth="650px"
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
              lineHeight: 1.6,
            }}
          >
            {t('recognitions.description') || 'Awards, honors, and media appearances showcasing professional achievements and community contributions.'}
          </Text>
        </Flex>
{/* Tab Navigation */}
<Tabs
  value={activeTab}
  onValueChange={(value) => setActiveTab(value as 'recognitions' | 'publications')}
  justifyContent="center"
  spacing="equal"
  style={{
    maxWidth: '400px',
    margin: '0 auto 2rem auto',
    borderBottom: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.4)',
  }}
>
  <Tabs.Item 
    title={t('recognitions.tabTitle') || 'Recognitions'} 
    value="recognitions" 
  />
  <Tabs.Item 
    title={t('recognitions.publicationsTabTitle') || 'Publications'} 
    value="publications" 
  />
</Tabs>        {loading ? (
          <Flex direction="column" alignItems="center" gap="1rem">
            <Loader size="large" />
            <Text style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
              {activeTab === 'recognitions' 
                ? (t('recognitions.loading') || 'Loading recognitions...') 
                : (t('recognitions.loadingPublications') || 'Loading publications...')}
            </Text>
          </Flex>
        ) : error ? (
          <Alert variation="error" marginBottom="2rem">
            {error}
          </Alert>
        ) : activeTab === 'recognitions' ? (
          // Recognitions Content
          recognitions.length > 0 ? (
            <Flex 
              direction="column" 
              gap="1.5rem" 
              width="100%"
            >
              {recognitions.map((recognition) => (
                <Card
                  key={recognition.id}
                  padding="0"
                  borderRadius="12px"
                  variation="elevated"
                  style={{
                    backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'white',
                    border: mode === 'dark' ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.8)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                  }}
                  className="hover:shadow-lg"
                >
                  <Flex 
                    direction={{ base: 'column', medium: 'row' }}
                    alignItems="stretch"
                  >
                    {/* Recognition Image */}
                    {recognition.photoKey && images[recognition.id] ? (
                      <View
                        style={{
                          width: '100%',
                          minHeight: '180px',
                          backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={images[recognition.id]}
                          alt={recognition.title || 'Recognition'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </View>
                    ) : (
                      <View
                        width="100%"
                        className="md:w-[200px]"
                        style={{
                          backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Award 
                          size={48} 
                          style={{ 
                            color: mode === 'dark' ? '#60A5FA' : '#3B82F6',
                            opacity: 0.7 
                          }} 
                        />
                      </View>
                    )}
                    
                    {/* Recognition Details */}
                    <Flex 
                      direction="column" 
                      gap="0.75rem" 
                      padding="1.5rem"
                      flex="1"
                    >
                      <Flex 
                        direction="row" 
                        alignItems="center" 
                        gap="0.5rem"
                        marginBottom="0.25rem"
                      >
                        <Text
                          fontSize="0.9rem"
                          style={{
                            color: mode === 'dark' ? '#94A3B8' : '#64748B',
                          }}
                        >
                          {formatDate(recognition.issueDate)}
                        </Text>
                      </Flex>
                      
                      <Text
                        fontSize={{ base: '1.25rem', medium: '1.35rem' }}
                        fontWeight="700"
                        style={{
                          color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                          lineHeight: 1.3,
                        }}
                      >
                        {recognition.title}
                      </Text>
                      
                      <Text
                        fontSize="1rem"
                        style={{
                          color: mode === 'dark' ? '#CBD5E1' : '#475569',
                          lineHeight: 1.6,
                        }}
                      >
                        {recognition.description}
                      </Text>
                      
                      <Flex 
                        direction="row" 
                        gap="0.5rem" 
                        alignItems="center"
                        marginTop="0.5rem"
                      >
                        <Badge
                          variation="info"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                          }}
                        >
                          {recognition.issuer}
                        </Badge>
                      </Flex>
                      
                      {recognition.issuerUrl && (
                        <Flex marginTop="0.75rem">
                          <Button
                            as="a"
                            href={recognition.issuerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variation="link"
                            style={{
                              color: mode === 'dark' ? '#60A5FA' : '#3B82F6',
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
                            {t('recognitions.actions.viewIssuer') || 'View Issuer'}
                          </Button>
                        </Flex>
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
              {t('recognitions.noRecognitions') || 'No recognitions available.'}
            </Text>
          )
        ) : (
          // Publications Content
          publications.length > 0 ? (
            <Flex 
              direction="column" 
              gap="1.5rem" 
              width="100%"
            >
              {publications.map((publication) => (
                <Card
                  key={publication.id}
                  padding="0"
                  borderRadius="12px"
                  variation="elevated"
                  style={{
                    backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'white',
                    border: mode === 'dark' ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.8)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                  }}
                  className="hover:shadow-lg"
                >
                  <Flex 
                    direction={{ base: 'column', medium: 'row' }}
                    alignItems="stretch"
                  >
                    {/* Publication Image */}
                    {publication.photoKey && images[publication.id] ? (
                      <View
                        width={{ base: '100%', medium: '200px' }}
                        minHeight={{ base: '180px', medium: 'auto' }}
                        style={{
                          backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={images[publication.id]}
                          alt={publication.title || 'Publication'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </View>
                    ) : (
                      <View
                        width={{ base: '100%', medium: '200px' }}
                        style={{
                          backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Share2 
                          size={48} 
                          style={{ 
                            color: mode === 'dark' ? '#C4B5FD' : '#8B5CF6',
                            opacity: 0.7 
                          }} 
                        />
                      </View>
                    )}
                    
                    {/* Publication Details */}
                    <Flex 
                      direction="column" 
                      gap="0.75rem" 
                      padding="1.5rem"
                      flex="1"
                    >
                      <Flex 
                        direction="row" 
                        alignItems="center" 
                        gap="0.5rem"
                        marginBottom="0.25rem"
                      >
                        <Flex 
                          direction="row" 
                          alignItems="center" 
                          gap="0.5rem"
                        >
                          <Calendar size={14} style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }} />
                          <Text
                            fontSize="0.9rem"
                            style={{
                              color: mode === 'dark' ? '#94A3B8' : '#64748B',
                            }}
                          >
                            {formatDate(publication.publicationDate)}
                          </Text>
                        </Flex>
                        
                        <Text
                          fontSize="0.9rem"
                          style={{
                            color: mode === 'dark' ? '#94A3B8' : '#64748B',
                          }}
                        >
                          •
                        </Text>
                        
                        <Flex 
                          direction="row" 
                          alignItems="center" 
                          gap="0.5rem"
                        >
                          {getSourceIcon(publication.source)}
                          <Text
                            fontSize="0.9rem"
                            style={{
                              color: mode === 'dark' ? '#94A3B8' : '#64748B',
                            }}
                          >
                            {publication.source}
                          </Text>
                        </Flex>
                      </Flex>
                      
                      <Text
                        fontSize={{ base: '1.25rem', medium: '1.35rem' }}
                        fontWeight="700"
                        style={{
                          color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                          lineHeight: 1.3,
                        }}
                      >
                        {publication.title}
                      </Text>
                      
                      <Text
                        fontSize="1rem"
                        style={{
                          color: mode === 'dark' ? '#CBD5E1' : '#475569',
                          lineHeight: 1.6,
                        }}
                      >
                        {publication.description}
                      </Text>
                      
                      <Flex 
                        direction="row" 
                        gap="0.5rem" 
                        alignItems="center"
                        marginTop="0.5rem"
                      >
                        <Badge
                          variation="info"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            backgroundColor: getPublicationTypeColor(publication.type),
                            color: 'white',
                          }}
                        >
                          {publication.type}
                        </Badge>
                      </Flex>
                      
                      <Flex marginTop="0.75rem">
                        <Button
                          as="a"
                          href={publication.publicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          variation="link"
                          style={{
                            color: mode === 'dark' ? '#60A5FA' : '#3B82F6',
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
                          {t('recognitions.actions.viewPublication') || 'View Publication'}
                        </Button>
                      </Flex>
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
              {t('recognitions.noPublications') || 'No publications available.'}
            </Text>
          )
        )}

        {/* View All Button */}
        <Button
          as="a"
          href={getLocalizedPath('/recognitions')}
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
          {activeTab === 'recognitions' 
            ? (t('recognitions.viewAll') || 'View All Recognitions') 
            : (t('recognitions.viewAllPublications') || 'View All Publications')}
        </Button>
      </Flex>
    </View>
  );
};

export default FeaturedRecognitionsPublications;
