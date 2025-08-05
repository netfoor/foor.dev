'use client';

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
import S3ProjectCleanup from '@/lib/utils/s3-cleanup';

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
      const recognitionResponse = await client.models.Recognitions.get({ id });
      const recognitionData = recognitionResponse.data;
      
      if (!recognitionData) {
        throw new Error(t('recognitions.recognition_not_found'));
      }

      // 2. Delete S3 file if exists
      if (recognitionData.photoKey) {
        const normalizedPath = recognitionData.photoKey.startsWith('public/') 
          ? recognitionData.photoKey.slice(7) 
          : recognitionData.photoKey;
          
        await remove({ path: normalizedPath });
        console.log(`✅ S3 file deleted: ${normalizedPath}`);
      }

      // 3. Delete DynamoDB record
      await client.models.Recognitions.delete({
        id
      });
      
      console.log(`✅ Recognition ${id} deleted completely`);
      
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
        const normalizedPath = publicationData.photoKey.startsWith('public/') 
          ? publicationData.photoKey.slice(7) 
          : publicationData.photoKey;
          
        await remove({ path: normalizedPath });
        console.log(`✅ S3 file deleted: ${normalizedPath}`);
      }

      // 3. Delete DynamoDB record
      await client.models.SocialPublications.delete({
        id
      });
      
      console.log(`✅ Publication ${id} deleted completely`);
      
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
          <View style={{
            textAlign: 'center',
            padding: '3rem',
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%)',
            backdropFilter: 'blur(16px)',
            border: mode === 'dark'
              ? '1px solid rgba(148, 163, 184, 0.2)'
              : '1px solid rgba(203, 213, 225, 0.3)',
            borderRadius: '16px',
          }}>
            <Award size={48} style={{ 
              color: mode === 'dark' ? '#60A5FA' : '#3B82F6',
              margin: '0 auto 1rem'
            }} />
            <Text style={{ 
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
              fontSize: '1.25rem'
            }}>
              {t('recognitions.no_records')}
            </Text>
          </View>
        );
      }

      return (
        <View style={{
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%)',
          backdropFilter: 'blur(16px)',
          border: mode === 'dark'
            ? '1px solid rgba(148, 163, 184, 0.2)'
            : '1px solid rgba(203, 213, 225, 0.3)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <Table size="small">
            <TableHead>
              <TableRow style={{
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.7) 0%, rgba(51, 65, 85, 0.7) 100%)'
                  : 'linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(226, 232, 240, 0.8) 100%)',
                borderBottom: mode === 'dark'
                  ? '1px solid rgba(148, 163, 184, 0.3)'
                  : '1px solid rgba(203, 213, 225, 0.4)',
              }}>
                <TableCell as="th" width="60px" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('image')}
                </TableCell>
                <TableCell as="th" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('title')}
                </TableCell>
                <TableCell as="th" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('recognitions.issuer')}
                </TableCell>
                <TableCell as="th" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('recognitions.date')}
                </TableCell>
                <TableCell as="th" width="120px" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recognitions.map((recognition, index) => (
                <TableRow 
                  key={recognition.id}
                  style={{
                    borderBottom: mode === 'dark'
                      ? '1px solid rgba(148, 163, 184, 0.2)'
                      : '1px solid rgba(203, 213, 225, 0.3)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const row = e.currentTarget;
                    row.style.background = mode === 'dark'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'rgba(59, 130, 246, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    const row = e.currentTarget;
                    row.style.background = 'transparent';
                  }}
                >
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    {recognition.photoKey ? (
                      <View 
                        style={{
                          background: mode === 'dark' 
                            ? 'rgba(71, 85, 105, 0.5)' 
                            : 'rgba(241, 245, 249, 0.5)',
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: mode === 'dark' 
                            ? '1px solid rgba(148, 163, 184, 0.2)' 
                            : '1px solid rgba(203, 213, 225, 0.3)',
                        }}
                      >
                        <ImagePreview photoKey={recognition.photoKey} alt={recognition.title || ''} />
                      </View>
                    ) : (
                      <Flex 
                        style={{
                          background: mode === 'dark' 
                            ? 'rgba(71, 85, 105, 0.5)' 
                            : 'rgba(241, 245, 249, 0.5)',
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          border: mode === 'dark' 
                            ? '1px solid rgba(148, 163, 184, 0.2)' 
                            : '1px solid rgba(203, 213, 225, 0.3)',
                        }}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Award size={24} style={{ 
                          color: mode === 'dark' ? '#60A5FA' : '#3B82F6' 
                        }} />
                      </Flex>
                    )}
                  </TableCell>
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    <Text 
                      fontWeight="600" 
                      style={{ 
                        color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                        marginBottom: '0.25rem'
                      }}
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
                  </TableCell>
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    <Text style={{ 
                      color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                      fontWeight: '500'
                    }}>
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
                          {t('view_source')}
                        </Text>
                      </Flex>
                    )}
                  </TableCell>
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    <Flex alignItems="center" gap="4px">
                      <Calendar size={14} style={{ 
                        color: mode === 'dark' ? '#94A3B8' : '#64748B' 
                      }} />
                      <Text style={{ 
                        color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                        fontSize: '0.875rem'
                      }}>
                        {formatDate(recognition.issueDate)}
                      </Text>
                    </Flex>
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
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    <Flex gap="8px">
                      <Menu 
                        trigger={
                          <Button 
                            size="small" 
                            style={{
                              background: 'transparent',
                              border: mode === 'dark' 
                                ? '1px solid rgba(148, 163, 184, 0.3)' 
                                : '1px solid rgba(203, 213, 225, 0.4)',
                              borderRadius: '6px',
                              padding: '6px',
                              color: mode === 'dark' ? '#94A3B8' : '#64748B',
                              cursor: 'pointer',
                            }}
                          >
                            <MoreVertical size={16} />
                          </Button>
                        }
                        style={{
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(71, 85, 105, 0.95) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                          backdropFilter: 'blur(16px)',
                          border: mode === 'dark'
                            ? '1px solid rgba(148, 163, 184, 0.3)'
                            : '1px solid rgba(203, 213, 225, 0.4)',
                          borderRadius: '8px',
                          boxShadow: mode === 'dark'
                            ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                            : '0 10px 40px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <MenuItem 
                          onClick={() => window.open(getLocalizedPath(`/recognitions`), '_blank')}
                          style={{
                            color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = mode === 'dark'
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Flex alignItems="center" gap="8px">
                            <Eye size={16} />
                            <Text style={{ color: 'inherit' }}>{t('view')}</Text>
                          </Flex>
                        </MenuItem>
                        <MenuItem 
                          onClick={() => window.location.href = getLocalizedPath(`/admin/recognitions/${recognition.id}`)}
                          style={{
                            color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = mode === 'dark'
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Flex alignItems="center" gap="8px">
                            <Edit3 size={16} />
                            <Text style={{ color: 'inherit' }}>{t('edit')}</Text>
                          </Flex>
                        </MenuItem>
                        <View style={{
                          height: '1px',
                          background: mode === 'dark' 
                            ? 'rgba(148, 163, 184, 0.3)' 
                            : 'rgba(203, 213, 225, 0.4)',
                          margin: '4px 0'
                        }} />
                        <MenuItem 
                          isDisabled={deleteLoading === recognition.id} 
                          onClick={() => handleDeleteRecognition(recognition.id)}
                          style={{
                            color: '#EF4444',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: deleteLoading === recognition.id ? 'not-allowed' : 'pointer',
                            opacity: deleteLoading === recognition.id ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (deleteLoading !== recognition.id) {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Flex alignItems="center" gap="8px">
                            {deleteLoading === recognition.id ? (
                              <Loader size="small" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            <Text style={{ color: 'inherit' }}>{t('delete')}</Text>
                          </Flex>
                        </MenuItem>
                      </Menu>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </View>
      );
    } else {
      // Publications tab
      if (publications.length === 0) {
        return (
          <View style={{
            textAlign: 'center',
            padding: '3rem',
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%)',
            backdropFilter: 'blur(16px)',
            border: mode === 'dark'
              ? '1px solid rgba(148, 163, 184, 0.2)'
              : '1px solid rgba(203, 213, 225, 0.3)',
            borderRadius: '16px',
          }}>
            <BookOpen size={48} style={{ 
              color: mode === 'dark' ? '#60A5FA' : '#3B82F6',
              margin: '0 auto 1rem'
            }} />
            <Text style={{ 
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
              fontSize: '1.25rem'
            }}>
              {t('publications.no_records')}
            </Text>
          </View>
        );
      }

      return (
        <View style={{
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%)',
          backdropFilter: 'blur(16px)',
          border: mode === 'dark'
            ? '1px solid rgba(148, 163, 184, 0.2)'
            : '1px solid rgba(203, 213, 225, 0.3)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <Table size="small">
            <TableHead>
              <TableRow style={{
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.7) 0%, rgba(51, 65, 85, 0.7) 100%)'
                  : 'linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(226, 232, 240, 0.8) 100%)',
                borderBottom: mode === 'dark'
                  ? '1px solid rgba(148, 163, 184, 0.3)'
                  : '1px solid rgba(203, 213, 225, 0.4)',
              }}>
                <TableCell as="th" width="60px" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('image')}
                </TableCell>
                <TableCell as="th" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('title')}
                </TableCell>
                <TableCell as="th" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('publications.source')}
                </TableCell>
                <TableCell as="th" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('publications.type')}
                </TableCell>
                <TableCell as="th" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('publications.date')}
                </TableCell>
                <TableCell as="th" width="120px" style={{ 
                  color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
                  fontWeight: '600',
                  padding: '1rem 0.75rem'
                }}>
                  {t('actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {publications.map((publication, index) => (
                <TableRow 
                  key={publication.id}
                  style={{
                    borderBottom: mode === 'dark'
                      ? '1px solid rgba(148, 163, 184, 0.2)'
                      : '1px solid rgba(203, 213, 225, 0.3)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const row = e.currentTarget;
                    row.style.background = mode === 'dark'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'rgba(59, 130, 246, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    const row = e.currentTarget;
                    row.style.background = 'transparent';
                  }}
                >
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    {publication.photoKey ? (
                      <View 
                        style={{
                          background: mode === 'dark' 
                            ? 'rgba(71, 85, 105, 0.5)' 
                            : 'rgba(241, 245, 249, 0.5)',
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: mode === 'dark' 
                            ? '1px solid rgba(148, 163, 184, 0.2)' 
                            : '1px solid rgba(203, 213, 225, 0.3)',
                        }}
                      >
                        <ImagePreview photoKey={publication.photoKey} alt={publication.title || ''} />
                      </View>
                    ) : (
                      <Flex 
                        style={{
                          background: mode === 'dark' 
                            ? 'rgba(71, 85, 105, 0.5)' 
                            : 'rgba(241, 245, 249, 0.5)',
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          border: mode === 'dark' 
                            ? '1px solid rgba(148, 163, 184, 0.2)' 
                            : '1px solid rgba(203, 213, 225, 0.3)',
                        }}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <BookOpen size={24} style={{ 
                          color: mode === 'dark' ? '#60A5FA' : '#3B82F6' 
                        }} />
                      </Flex>
                    )}
                  </TableCell>
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    <Text 
                      fontWeight="600" 
                      style={{ 
                        color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                        marginBottom: '0.25rem'
                      }}
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
                  </TableCell>
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    <Badge
                      size="small" 
                      style={{
                        background: mode === 'dark' 
                          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))'
                          : 'linear-gradient(135deg, rgba(34, 197, 94, 1), rgba(22, 163, 74, 1))',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      {publication.source}
                    </Badge>
                    {publication.publicationUrl && (
                      <Flex alignItems="center" gap="4px" marginTop="0.25rem">
                        <ExternalLink size={12} style={{ 
                          color: mode === 'dark' ? '#60A5FA' : '#3B82F6' 
                        }} />
                        <Text 
                          fontSize="0.75rem" 
                          style={{ color: mode === 'dark' ? '#60A5FA' : '#3B82F6' }}
                          as="a"
                          href={publication.publicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          textDecoration="none"
                        >
                          {t('view_publication')}
                        </Text>
                      </Flex>
                    )}
                  </TableCell>
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    <Badge
                      size="small" 
                      style={{
                        background: mode === 'dark' 
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(147, 51, 234, 0.8))'
                          : 'linear-gradient(135deg, rgba(168, 85, 247, 1), rgba(147, 51, 234, 1))',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      {publication.type}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    <Flex alignItems="center" gap="4px">
                      <Calendar size={14} style={{ 
                        color: mode === 'dark' ? '#94A3B8' : '#64748B' 
                      }} />
                      <Text style={{ 
                        color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                        fontSize: '0.875rem'
                      }}>
                        {formatDate(publication.publicationDate)}
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell style={{ padding: '1rem 0.75rem' }}>
                    <Flex gap="8px">
                      <Menu 
                        trigger={
                          <Button 
                            size="small" 
                            style={{
                              background: 'transparent',
                              border: mode === 'dark' 
                                ? '1px solid rgba(148, 163, 184, 0.3)' 
                                : '1px solid rgba(203, 213, 225, 0.4)',
                              borderRadius: '6px',
                              padding: '6px',
                              color: mode === 'dark' ? '#94A3B8' : '#64748B',
                              cursor: 'pointer',
                            }}
                          >
                            <MoreVertical size={16} />
                          </Button>
                        }
                        style={{
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(71, 85, 105, 0.95) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                          backdropFilter: 'blur(16px)',
                          border: mode === 'dark'
                            ? '1px solid rgba(148, 163, 184, 0.3)'
                            : '1px solid rgba(203, 213, 225, 0.4)',
                          borderRadius: '8px',
                          boxShadow: mode === 'dark'
                            ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                            : '0 10px 40px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <MenuItem 
                          onClick={() => window.open(getLocalizedPath(`/recognitions`), '_blank')}
                          style={{
                            color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = mode === 'dark'
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Flex alignItems="center" gap="8px">
                            <Eye size={16} />
                            <Text style={{ color: 'inherit' }}>{t('view')}</Text>
                          </Flex>
                        </MenuItem>
                        <MenuItem 
                          onClick={() => window.location.href = getLocalizedPath(`/admin/publications/${publication.id}`)}
                          style={{
                            color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = mode === 'dark'
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Flex alignItems="center" gap="8px">
                            <Edit3 size={16} />
                            <Text style={{ color: 'inherit' }}>{t('edit')}</Text>
                          </Flex>
                        </MenuItem>
                        <View style={{
                          height: '1px',
                          background: mode === 'dark' 
                            ? 'rgba(148, 163, 184, 0.3)' 
                            : 'rgba(203, 213, 225, 0.4)',
                          margin: '4px 0'
                        }} />
                        <MenuItem 
                          isDisabled={deleteLoading === publication.id} 
                          onClick={() => handleDeletePublication(publication.id)}
                          style={{
                            color: '#EF4444',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: deleteLoading === publication.id ? 'not-allowed' : 'pointer',
                            opacity: deleteLoading === publication.id ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (deleteLoading !== publication.id) {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Flex alignItems="center" gap="8px">
                            {deleteLoading === publication.id ? (
                              <Loader size="small" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            <Text style={{ color: 'inherit' }}>{t('delete')}</Text>
                          </Flex>
                        </MenuItem>
                      </Menu>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </View>
      );
    }
  };

  return (
    <View width="100%">
      {/* Header section */}
      <Flex direction="column" gap="12px" marginBottom="1.5rem">
        <Heading level={1}>
          {activeTab === 'recognitions' 
            ? t('recognitions.manage_recognitions') 
            : t('publications.manage_publications')}
        </Heading>
        <Text>
          {activeTab === 'recognitions' 
            ? t('recognitions.manage_recognitions_description') 
            : t('publications.manage_publications_description')}
        </Text>
      </Flex>

      {/* Tabs and action buttons */}
      <Card padding="0">
        <Flex justifyContent="space-between" alignItems="center" padding="1rem">
          <Flex gap="0.5rem">
            <Button 
              size="small" 
              variation={activeTab === 'recognitions' ? 'primary' : 'link'}
              onClick={() => setActiveTab('recognitions')}
            >
              <Award size={16} />
              <Text>{t('recognitions.recognitions')}</Text>
            </Button>
            <Button 
              size="small" 
              variation={activeTab === 'publications' ? 'primary' : 'link'}
              onClick={() => setActiveTab('publications')}
            >
              <BookOpen size={16} />
              <Text>{t('publications.publications')}</Text>
            </Button>
          </Flex>
          <Flex gap="0.5rem">
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
            >
              <Plus size={16} />
              <Text>
                {activeTab === 'recognitions' 
                  ? t('recognitions.add_recognition') 
                  : t('publications.add_publication')}
              </Text>
            </Button>
          </Flex>
        </Flex>
        
        <Divider />
        
        {/* Table or empty state */}
        <View padding={loading || error ? "0" : "1rem"}>
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
