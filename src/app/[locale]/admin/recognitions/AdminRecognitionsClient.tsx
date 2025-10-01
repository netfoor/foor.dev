"use client";
import React, { useState, useEffect } from 'react';
import {
  View,
  Flex,
  Text,
  Button,
  Card,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Loader,
  Alert,
  Menu,
  MenuItem,
  Divider
} from '@aws-amplify/ui-react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  MoreVertical, 
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import S3Cleanup from '@/lib/utils/s3-cleanup';

// Types for Recognitions and Publications
type Recognition = Schema["Recognitions"]["type"];
type Publication = Schema["SocialPublications"]["type"];

interface AdminRecognitionsClientProps {
  locale: SupportedLocale;
}

const AdminRecognitionsClient: React.FC<AdminRecognitionsClientProps> = ({ locale }) => {
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [activeTab, setActiveTab] = useState<'recognitions' | 'publications'>('recognitions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();

  // Fetch recognitions and publications from Amplify Data API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate client on client-side
      const client = generateClient<Schema>();
      
      // Fetch recognitions
      const recognitionsResponse = await client.models.Recognitions.list({
        authMode: 'userPool',
      });
      
      if (recognitionsResponse.data) {
        setRecognitions(recognitionsResponse.data);
      }

      // Fetch publications
      const publicationsResponse = await client.models.SocialPublications.list({
        authMode: 'userPool',
      });
      
      if (publicationsResponse.data) {
        setPublications(publicationsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('recognitions.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  // Delete recognition
  const handleDeleteRecognition = async (id: string) => {
    if (!confirm(t('recognitions.confirm_delete'))) {
      return;
    }

    try {
      setDeleteLoading(id);
      
      const client = generateClient<Schema>();
      
      // 1. Get recognition data to access S3 keys
      const recognitionResponse = await client.models.Recognitions.get({ id }, { authMode: 'userPool' });
      const recognitionData = recognitionResponse.data;
      
      if (!recognitionData) {
        throw new Error(t('recognitions.recognition_not_found'));
      }

      // 2. Delete S3 file if exists
      if (recognitionData.photoKey) {
        await S3Cleanup.deleteSingleFile(recognitionData.photoKey);
      }

      // 3. Delete DynamoDB record
      await client.models.Recognitions.delete({ id }, { authMode: 'userPool' });
      
      
      // 4. Update local state
      setRecognitions(prev => prev.filter(r => r.id !== id));
      
    } catch (err) {
      console.error('Error deleting recognition:', err);
      setError(`${t('recognitions.error_deleting')}: ${err instanceof Error ? err.message : t('recognitions.unknown_error')}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Delete publication
  const handleDeletePublication = async (id: string) => {
    if (!confirm(t('publications.confirm_delete'))) {
      return;
    }

    try {
      setDeleteLoading(id);
      
      const client = generateClient<Schema>();
      
      // 1. Get publication data to access S3 keys
      const publicationResponse = await client.models.SocialPublications.get({ id });
      const publicationData = publicationResponse.data;
      
      if (!publicationData) {
        throw new Error(t('publications.publication_not_found'));
      }

      // 2. Delete S3 file if exists
      if (publicationData.photoKey) {
        await S3Cleanup.deleteSingleFile(publicationData.photoKey);
      }

      // 3. Delete DynamoDB record
      await client.models.SocialPublications.delete({ id }, { authMode: 'userPool' });
      
      
      // 4. Update local state
      setPublications(prev => prev.filter(p => p.id !== id));
      
    } catch (err) {
      console.error('Error deleting publication:', err);
      setError(`${t('publications.error_deleting')}: ${err instanceof Error ? err.message : t('publications.unknown_error')}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get image URL from Storage
  const getImageUrl = async (key: string | null | undefined) => {
    if (!key) return null;
    
    try {
      // Normalize path - remove 'public/' if exists (for Gen 1 compatibility)
      const normalizedPath = key.startsWith('public/') ? key.slice(7) : key;
      
      const url = await getUrl({
        path: normalizedPath,
      });
      return url.url.toString();
    } catch (err) {
      console.error('Error getting image URL:', err);
      return null;
    }
  };

  // Function to get source badge color for publications
  const getSourceColor = (source: string | null | undefined) => {
    switch (source) {
      case 'LinkedIn': return '#0077B5';
      case 'Twitter': return '#1DA1F2';
      case 'GitHub': return '#333333';
      case 'Blog': return '#FF5722';
      case 'Youtube': return '#FF0000';
      default: return '#6B7280';
    }
  };

  // Function to get type badge color for publications
  const getTypeColor = (type: string | null | undefined) => {
    const colors = {
      'Article': '#3B82F6',
      'Blog': '#8B5CF6',
      'Video': '#EF4444',
      'Podcast': '#F59E0B',
      'Book': '#10B981',
      'Course': '#6366F1',
      'Conference': '#EC4899',
      'Presentation': '#F97316',
      'Research': '#06B6D4',
      'Workshop': '#14B8A6',
      'Other': '#6B7280'
    };
    
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to render table based on active tab
  const renderTable = () => {
    if (loading) {
      return (
        <Flex justifyContent="center" alignItems="center" direction="column" padding="2rem">
          <Loader size="large" />
          <Text marginTop="1rem">{t('loading')}</Text>
        </Flex>
      );
    }

    if (error) {
      return (
        <Alert variation="error" isDismissible={false} marginTop="1rem">
          {error}
        </Alert>
      );
    }

    if (activeTab === 'recognitions') {
      if (recognitions.length === 0) {
        return (
          <View padding="3rem" textAlign="center">
            <Text fontSize="1.125rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'} marginBottom="2rem">
              {t('recognitions.no_records')}
            </Text>
          </View>
        );
      }

      return (
        <Table
          style={{
            backgroundColor: 'transparent',
            width: '100%'
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('recognitions.recognition') || 'Recognition'}
              </TableCell>
              <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('recognitions.issuer')}
              </TableCell>
              <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('recognitions.date')}
              </TableCell>
              <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('actions') || 'Actions'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recognitions.filter(recognition => recognition !== null).map((recognition) => (
              <TableRow key={recognition.id}>
                <TableCell>
                  <Flex alignItems="center" gap="0.75rem">
                    <View
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Award size={20} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    </View>
                    <View>
                      <Text 
                        fontWeight="600" 
                        style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}
                      >
                        {recognition.title}
                      </Text>
                      <Text 
                        fontSize="0.875rem" 
                        style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
                      >
                        {recognition.description?.length > 60 
                          ? `${recognition.description.substring(0, 60)}...` 
                          : recognition.description}
                      </Text>
                    </View>
                  </Flex>
                </TableCell>
                
                <TableCell>
                  <Text 
                    fontWeight="600" 
                    style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}
                  >
                    {recognition.issuer}
                  </Text>
                  {recognition.issuerUrl && (
                    <Flex alignItems="center" gap="4px" marginTop="0.25rem">
                      <ExternalLink size={12} style={{ 
                        color: mode === 'dark' ? '#60A5FA' : '#3B82F6' 
                      }} />
                      <Text 
                        fontSize="0.75rem" 
                        style={{ color: mode === 'dark' ? '#60A5FA' : '#3B82F6' }}
                        as="a"
                        href={recognition.issuerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        textDecoration="none"
                      >
                        {t('view_source') || 'View Source'}
                      </Text>
                    </Flex>
                  )}
                </TableCell>
                
                <TableCell>
                  <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                    {formatDate(recognition.issueDate)}
                  </Text>
                  {recognition.credentialId && (
                    <Text 
                      fontSize="0.75rem" 
                      style={{ 
                        color: mode === 'dark' ? '#94A3B8' : '#64748B',
                        marginTop: '0.25rem'
                      }}
                    >
                      ID: {recognition.credentialId}
                    </Text>
                  )}
                </TableCell>
                <TableCell>
                  <Flex gap="0.5rem">
                    {recognition.issuerUrl && (
                      <Button
                        size="small"
                        style={{
                          backgroundColor: 'transparent',
                          color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
                          border: 'none',
                          padding: '0.5rem',
                        }}
                        as="a"
                        href={recognition.issuerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={16} />
                      </Button>
                    )}
                    
                    <Button
                      size="small"
                      style={{
                        backgroundColor: 'transparent',
                        color: mode === 'dark' ? '#FBBF24' : '#F59E0B',
                        border: 'none',
                        padding: '0.5rem',
                      }}
                      as="a"
                      href={getLocalizedPath(`/admin/recognitions/${recognition.id}`)}
                    >
                      <Edit3 size={16} />
                    </Button>
                    
                    <Button
                      size="small"
                      style={{
                        backgroundColor: 'transparent',
                        color: mode === 'dark' ? '#F87171' : '#EF4444',
                        border: 'none',
                        padding: '0.5rem',
                      }}
                      onClick={() => handleDeleteRecognition(recognition.id)}
                      isDisabled={deleteLoading === recognition.id}
                    >
                      {deleteLoading === recognition.id ? (
                        <Loader size="small" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </Flex>
                </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    } else {
      // Publications tab
      if (publications.length === 0) {
        return (
          <View padding="3rem" textAlign="center">
            <Text fontSize="1.125rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'} marginBottom="2rem">
              {t('publications.no_records')}
            </Text>
          </View>
        );
      }

      return (
        <Table
          style={{
            backgroundColor: 'transparent',
            width: '100%'
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('publications.publication') || 'Publication'}
              </TableCell>
              <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('publications.source')}
              </TableCell>
              <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('publications.type')}
              </TableCell>
              <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('publications.date')}
              </TableCell>
              <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('actions') || 'Actions'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {publications.filter(publication => publication !== null).map((publication) => (
              <TableRow key={publication.id}>
              <TableCell>
                <Flex alignItems="center" gap="0.75rem">
                  <View
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BookOpen size={20} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  </View>
                  <View>
                    <Text 
                      fontWeight="600" 
                      style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}
                    >
                      {publication.title}
                    </Text>
                    <Text 
                      fontSize="0.875rem" 
                      style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
                    >
                      {publication.description?.length > 60 
                        ? `${publication.description.substring(0, 60)}...` 
                        : publication.description}
                    </Text>
                  </View>
                </Flex>
              </TableCell>
              <TableCell>
                <Badge
                  style={{
                    backgroundColor: '#22C55E',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                  }}
                >
                  {publication.source}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  style={{
                    backgroundColor: '#8B5CF6',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                  }}
                >
                  {publication.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                  {formatDate(publication.publicationDate)}
                </Text>
              </TableCell>
              <TableCell>
                <Flex gap="0.5rem">
                  {publication.publicationUrl && (
                    <Button
                      size="small"
                      style={{
                        backgroundColor: 'transparent',
                        color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
                        border: 'none',
                        padding: '0.5rem',
                      }}
                      as="a"
                      href={publication.publicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={16} />
                    </Button>
                  )}
                  
                  <Button
                    size="small"
                    style={{
                      backgroundColor: 'transparent',
                      color: mode === 'dark' ? '#FBBF24' : '#F59E0B',
                      border: 'none',
                      padding: '0.5rem',
                    }}
                    as="a"
                    href={getLocalizedPath(`/admin/publications/${publication.id}`)}
                  >
                    <Edit3 size={16} />
                  </Button>
                  
                  <Button
                    size="small"
                    style={{
                      backgroundColor: 'transparent',
                      color: mode === 'dark' ? '#F87171' : '#EF4444',
                      border: 'none',
                      padding: '0.5rem',
                    }}
                    onClick={() => handleDeletePublication(publication.id)}
                    isDisabled={deleteLoading === publication.id}
                  >
                    {deleteLoading === publication.id ? (
                      <Loader size="small" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </Flex>
              </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }
  };

  return (
    <View>
      {/* Header */}
      <Flex
        direction={{ base: 'column', medium: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ base: 'stretch', medium: 'flex-start' }}
        gap="1rem"
        marginBottom="2rem"
        style={{ width: '100%' }}
      >
        <View style={{ flex: '1 1 auto', minWidth: 0 }}>
          <Text
            fontSize={{ base: '1.5rem', medium: '2rem' }}
            fontWeight="700"
            style={{
              color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            }}
          >
            {t('recognitions.manage_recognitions')}
          </Text>
          <Text
            fontSize={{ base: '0.875rem', medium: '1rem' }}
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
            }}
          >
            {t('recognitions.manage_recognitions_description')}
          </Text>
        </View>

        <View style={{ flexShrink: 0, width: '100%', maxWidth: '220px' }} className="md:w-auto">
          <Button
            variation="primary"
            size="large"
            onClick={() => {
              window.location.href = getLocalizedPath('/admin/recognitions/new');
            }}
            style={{
              backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
              width: '100%',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={20} />
            <Text>{t('recognitions.add_recognition')}</Text>
          </Button>
        </View>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Flex 
        direction={{ base: 'column', medium: 'row' }} 
        gap="1.5rem" 
        marginBottom="2rem"
        style={{
          width: '100%',
          maxWidth: '100%'
        }}
      >
        <Card
          style={{
            flex: 1,
            minWidth: '160px',
            maxWidth: '100%',
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            boxSizing: 'border-box'
          }}
        >
          <View padding="1rem">
            <Text fontSize="1.25rem" fontWeight="700" color="#22C55E">
              {recognitions.length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              {t('recognitions.total_recognitions') || 'Total Recognitions'}
            </Text>
          </View>
        </Card>

        <Card
          style={{
            flex: 1,
            minWidth: '160px',
            maxWidth: '100%',
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            boxSizing: 'border-box'
          }}
        >
          <View padding="1rem">
            <Text fontSize="1.25rem" fontWeight="700" color="#3B82F6">
              {publications.length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              {t('publications.total_publications') || 'Total Publications'}
            </Text>
          </View>
        </Card>
        
        <Card
          style={{
            flex: 1,
            minWidth: '160px',
            maxWidth: '100%',
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            boxSizing: 'border-box'
          }}
        >
          <View padding="1rem">
            <Text fontSize="1.25rem" fontWeight="700" color="#8B5CF6">
              {recognitions.length + publications.length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              {t('total_items') || 'Total Items'}
            </Text>
          </View>
        </Card>
      </Flex>

      {/* Tabs */}
      <Card
        style={{
          backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}
      >
        <Flex justifyContent="space-between" alignItems="center" padding="1rem">
          <Flex gap="0.5rem">
            <Button 
              size="small" 
              variation={activeTab === 'recognitions' ? 'primary' : 'link'}
              onClick={() => setActiveTab('recognitions')}
              style={{
                backgroundColor: activeTab === 'recognitions' 
                  ? (mode === 'dark' ? '#3B82F6' : '#2563EB')
                  : 'transparent'
              }}
            >
              <Award size={16} />
              <Text>{t('recognitions.recognitions')}</Text>
            </Button>
            <Button 
              size="small" 
              variation={activeTab === 'publications' ? 'primary' : 'link'}
              onClick={() => setActiveTab('publications')}
              style={{
                backgroundColor: activeTab === 'publications' 
                  ? (mode === 'dark' ? '#3B82F6' : '#2563EB')
                  : 'transparent'
              }}
            >
              <BookOpen size={16} />
              <Text>{t('publications.publications')}</Text>
            </Button>
          </Flex>
          <Button 
            size="small" 
            variation="primary"
            onClick={() => {
              window.location.href = getLocalizedPath(
                activeTab === 'recognitions' 
                  ? '/admin/recognitions/new' 
                  : '/admin/publications/new'
              );
            }}
            style={{
              backgroundColor: mode === 'dark' ? '#22C55E' : '#16A34A'
            }}
          >
            <Plus size={16} />
            <Text>
              {activeTab === 'recognitions' 
                ? t('recognitions.add_recognition') 
                : t('publications.add_publication')}
            </Text>
          </Button>
        </Flex>
      </Card>

      {/* Table */}
      <Card
        style={{
          backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <View 
          className="table-container"
          style={{
            overflowX: 'auto',
            width: '100%'
          }}
        >
          {renderTable()}
        </View>
      </Card>
    </View>
  );
};

// Image preview component that loads S3 image
const ImagePreview = ({ photoKey, alt }: { photoKey: string, alt: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        // Normalize path - remove 'public/' if exists (for Gen 1 compatibility)
        const normalizedPath = photoKey.startsWith('public/') ? photoKey.slice(7) : photoKey;
        
        const url = await getUrl({
          path: normalizedPath,
        });
        setImageUrl(url.url.toString());
      } catch (err) {
        console.error('Error getting image URL:', err);
        setImageUrl(null);
      }
    };

    fetchImageUrl();
  }, [photoKey]);

  if (!imageUrl) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100%" width="100%">
        <ImageIcon size={24} />
      </Flex>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover' 
      }} 
    />
  );
};

// Missing import component
const Heading = ({ level, children, ...props }: { level: number, children: React.ReactNode, [key: string]: any }) => {
  const Tag = (`h${level}` as keyof React.JSX.IntrinsicElements);
  return React.createElement(Tag, props, children);
};

export default AdminRecognitionsClient;