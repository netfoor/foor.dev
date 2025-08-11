"use client";
import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Card, Button, Badge, Loader, Alert } from '@aws-amplify/ui-react';
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
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'recognitions' | 'publications'>('recognitions');

  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const { isAuthenticated } = useAuth();

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
        
        // We no longer need to fetch and store image URLs, since we'll use OptimizedImage
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
      
      {/* Responsive tab button style for mobile */}
      <style jsx global>{`
        @media (max-width: 600px) {
          .tab-toggle-btn {
            min-width: 90px !important;
            font-size: 14px !important;
            padding: 10px 10px !important;
            border-radius: 12px !important;
          }
        }
      `}</style>
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
        
        {/* Tab Selector - Modern glassmorphism style */}
        <Flex 
          direction="row" 
          gap="0.5rem" 
          marginBottom="2rem"
          justifyContent="center"
          style={{
            padding: '8px',
            borderRadius: '20px',
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: mode === 'dark' 
              ? '1px solid rgba(148, 163, 184, 0.2)' 
              : '1px solid rgba(203, 213, 225, 0.3)',
            boxShadow: mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          <button
            className="tab-toggle-btn"
            onClick={() => setActiveTab('recognitions')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              background: activeTab === 'recognitions' 
                ? (mode === 'dark' 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)')
                : 'transparent',
              color: activeTab === 'recognitions'
                ? '#FFFFFF'
                : (mode === 'dark' ? '#E2E8F0' : '#475569'),
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              minWidth: '140px',
              boxShadow: activeTab === 'recognitions'
                ? (mode === 'dark' 
                  ? '0 4px 20px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
                  : '0 4px 20px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)')
                : 'none',
              backdropFilter: activeTab === 'recognitions' ? 'blur(8px)' : 'none',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'recognitions') {
                e.currentTarget.style.background = mode === 'dark' 
                  ? 'rgba(59, 130, 246, 0.1)' 
                  : 'rgba(59, 130, 246, 0.05)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'recognitions') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <Award size={18} />
            {t('recognitions.tabs.recognitions') || 'Recognitions'}
          </button>
          <button
            className="tab-toggle-btn"
            onClick={() => setActiveTab('publications')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              background: activeTab === 'publications' 
                ? (mode === 'dark' 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)')
                : 'transparent',
              color: activeTab === 'publications'
                ? '#FFFFFF'
                : (mode === 'dark' ? '#E2E8F0' : '#475569'),
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              minWidth: '140px',
              boxShadow: activeTab === 'publications'
                ? (mode === 'dark' 
                  ? '0 4px 20px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
                  : '0 4px 20px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)')
                : 'none',
              backdropFilter: activeTab === 'publications' ? 'blur(8px)' : 'none',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'publications') {
                e.currentTarget.style.background = mode === 'dark' 
                  ? 'rgba(59, 130, 246, 0.1)' 
                  : 'rgba(59, 130, 246, 0.05)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'publications') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <Share2 size={18} />
            {t('recognitions.tabs.publications') || 'Media Publications'}
          </button>
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
                        {recognition.photoKey ? (
                          <OptimizedImage 
                            s3Key={recognition.photoKey} 
                            alt={recognition.title || 'Recognition image'}
                            className="w-full h-full object-contain hover:scale-105 transition-all duration-500"
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
                        {publication.photoKey ? (
                          <OptimizedImage 
                            s3Key={publication.photoKey} 
                            alt={publication.title || 'Publication image'}
                            className="w-full h-full object-contain hover:scale-105 transition-all duration-500"
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
