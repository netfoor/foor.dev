'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Card, Button, Badge, Loader, Alert, Heading } from '@aws-amplify/ui-react';
import { 
  Award,
  ExternalLink, 
  Calendar, 
  Share2, 
  Youtube,
  Twitter,
  Github,
  Linkedin,
  BookOpen,
  FileText
} from 'lucide-react';
import { getUrl } from 'aws-amplify/storage';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { 
  loadRecognitionsFromAmplify, 
  loadPublicationsFromAmplify,
  type Recognition,
  type Publication
} from '@/lib/recognitions/recognitionsLoader';

interface RecognitionsPublicationsProps {
  className?: string;
}

const RecognitionsPublicationsSection: React.FC<RecognitionsPublicationsProps> = ({ className = '' }) => {
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'recognitions' | 'publications'>('recognitions');

  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
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
        
        // Load all recognitions
        const recognitionsData = await loadRecognitionsFromAmplify(undefined, isAuthenticated);
        setRecognitions(recognitionsData);
        
        // Load all publications
        const publicationsData = await loadPublicationsFromAmplify(undefined, isAuthenticated);
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
        return <Youtube size={18} />;
      case 'Twitter':
        return <Twitter size={18} />;
      case 'GitHub':
        return <Github size={18} />;
      case 'LinkedIn':
        return <Linkedin size={18} />;
      case 'Blog':
        return <BookOpen size={18} />;
      default:
        return <FileText size={18} />;
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
      padding={{ base: '4rem 2rem', medium: '6rem 4rem' }}
      className={className}
      style={{
        backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
        position: 'relative',
        
      }}
    >
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      
      <Flex 
        direction="column" 
        maxWidth="1200px" 
        margin="0 auto"
        alignItems="center"
        gap="2rem"
      >
        {/* Section Header */}
        <Flex direction="column" alignItems="center" textAlign="center" marginBottom="1rem">
          <Text
            as="h2"
            fontSize={{ base: '2rem', medium: '2.5rem' }}
            fontWeight="700"
            textAlign="center"
            lineHeight="1.3"
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
            {t('recognitions.title') || 'Recognitions & '}{' '}
            <span style={{ 
              backgroundImage: mode === 'dark'
                ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                : 'linear-gradient(135deg, #2563EB, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t('recognitions.titleHighlight') || 'Publications'}
            </span>
          </Text>
          <Text
            fontSize={{ base: '1rem', medium: '1.125rem' }}
            textAlign="center"
            maxWidth="600px"
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}
          >
            {t('recognitions.description') || 'Discover my awards, honors, and media features across various platforms including articles, videos, and social media.'}
          </Text>
        </Flex>
        
        {/* Tab Selector - Improved version */}
        <Flex 
          direction="row" 
          gap="0" 
          marginBottom="2rem"
          className="shadow-sm"
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: mode === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
            backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
          }}
        >
          <Button
            onClick={() => setActiveTab('recognitions')}
            style={{
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: activeTab === 'recognitions' 
                ? (mode === 'dark' ? '#2563EB' : '#3B82F6') 
                : 'transparent',
              color: activeTab === 'recognitions'
                ? '#FFFFFF'
                : (mode === 'dark' ? '#CBD5E1' : '#64748B'),
              borderRadius: '0',
              borderRight: mode === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Award size={18} />
            {t('recognitions.tabs.recognitions') || 'Recognitions'}
          </Button>
          <Button
            onClick={() => setActiveTab('publications')}
            style={{
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: activeTab === 'publications' 
                ? (mode === 'dark' ? '#2563EB' : '#3B82F6') 
                : 'transparent',
              color: activeTab === 'publications'
                ? '#FFFFFF'
                : (mode === 'dark' ? '#CBD5E1' : '#64748B'),
              borderRadius: '0',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Share2 size={18} />
            {t('recognitions.tabs.publications') || 'Media Publications'}
          </Button>
        </Flex>
        
        {/* Loading and Error States */}
        {loading ? (
          <Flex direction="column" alignItems="center" padding="2rem">
            <Loader size="large" />
            <Text style={{ marginTop: '1rem', color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
              {t('recognitions.loading') || 'Loading recognitions and publications...'}
            </Text>
          </Flex>
        ) : error ? (
          <Alert
            variation="error"
            heading={t('error') || 'Error'}
            isDismissible={false}
            style={{ width: '100%', maxWidth: '800px' }}
          >
            {error}
          </Alert>
        ) : (
          activeTab === 'recognitions' ? (
            <Flex
              direction="row"
              wrap="wrap"
              justifyContent="center"
              gap="2rem"
              width="100%"
            >
              {recognitions.length > 0 ? (
                recognitions.map((recognition) => (
                  <Card
                    key={recognition.id}
                    variation="elevated"
                    style={{
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: '350px',
                      padding: '0',
                      backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
                      border: mode === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
                      boxShadow: mode === 'dark' 
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)' 
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                    }}
                    className="hover:shadow-lg hover:scale-[1.02]"
                  >
                    <Flex direction="column" height="100%">
                      {/* Image */}
                      <View
                        style={{
                          backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
                          height: '180px',
                          overflow: 'hidden',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {images[recognition.id] ? (
                          <img 
                            src={images[recognition.id]} 
                            alt={recognition.title || 'Recognition image'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              transition: 'all 0.5s ease',
                            }}
                            className="hover:scale-105"
                          />
                        ) : (
                          <Award 
                            size={60} 
                            style={{
                              color: mode === 'dark' ? '#334155' : '#CBD5E1',
                              opacity: 0.7
                            }}
                          />
                        )}
                      </View>
                      
                      {/* Content */}
                      <Flex 
                        direction="column" 
                        padding="1.5rem"
                        flex="1"
                        gap="0.75rem"
                      >
                        <Flex 
                          direction="row" 
                          gap="0.5rem" 
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Text
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: mode === 'dark' ? '#94A3B8' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Calendar size={14} />
                            {formatDate(recognition.issueDate)}
                          </Text>
                        </Flex>
                        
                        <Text
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
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
                        
                        <Text
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: mode === 'dark' ? '#94A3B8' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '0.25rem',
                          }}
                        >
                          <span style={{ fontWeight: '600' }}>
                            {t('recognitions.labels.issuer') || 'Issued by'}:
                          </span> {recognition.issuer}
                        </Text>
                        
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
                                fontSize: '0.875rem',
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                              }}
                              className="hover:scale-105"
                            >
                              <ExternalLink size={14} />
                              {t('recognitions.actions.viewCredential') || 'View Credential'}
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    </Flex>
                  </Card>
                ))
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
              )}
            </Flex>
          ) : (
            <Flex
              direction="row"
              wrap="wrap"
              justifyContent="center"
              gap="2rem"
              width="100%"
            >
              {publications.length > 0 ? (
                publications.map((publication) => (
                  <Card
                    key={publication.id}
                    variation="elevated"
                    style={{
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: '350px',
                      padding: '0',
                      backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
                      border: mode === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
                      boxShadow: mode === 'dark' 
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)' 
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                    }}
                    className="hover:shadow-lg hover:scale-[1.02]"
                  >
                    <Flex direction="column" height="100%">
                      {/* Image */}
                      <View
                        style={{
                          backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
                          height: '180px',
                          overflow: 'hidden',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {images[publication.id] ? (
                          <img 
                            src={images[publication.id]} 
                            alt={publication.title || 'Publication image'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              transition: 'all 0.5s ease',
                            }}
                            className="hover:scale-105"
                          />
                        ) : (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '100%',
                            backgroundColor: getPublicationTypeColor(publication.type),
                            opacity: 0.7
                          }}>
                            {getSourceIcon(publication.source)}
                          </div>
                        )}
                      </View>
                      
                      {/* Content */}
                      <Flex 
                        direction="column" 
                        padding="1.5rem"
                        flex="1"
                        gap="0.75rem"
                      >
                        <Flex 
                          direction="row" 
                          gap="0.5rem" 
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Text
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: mode === 'dark' ? '#94A3B8' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Calendar size={14} />
                            {formatDate(publication.publicationDate)}
                          </Text>
                          
                          <Badge
                            variation="info"
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              backgroundColor: getPublicationTypeColor(publication.type),
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {publication.source && getSourceIcon(publication.source)}
                            {publication.source}
                          </Badge>
                        </Flex>
                        
                        <Text
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
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
                              fontSize: '0.875rem',
                              padding: '8px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                            }}
                            className="hover:scale-105"
                          >
                            <ExternalLink size={14} />
                            {t('recognitions.actions.viewPublication') || 'View Publication'}
                          </Button>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Card>
                ))
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
              )}
            </Flex>
          )
        )}
      </Flex>
    </View>
  );
};

export default RecognitionsPublicationsSection;
