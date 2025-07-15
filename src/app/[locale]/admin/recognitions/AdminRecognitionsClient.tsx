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
          <Alert variation="info" isDismissible={false} marginTop="1rem">
            {t('recognitions.no_records')}
          </Alert>
        );
      }

      return (
        <Table highlightOnHover={true} size="small" variation="bordered">
          <TableHead>
            <TableRow>
              <TableCell as="th" width="60px">{t('image')}</TableCell>
              <TableCell as="th">{t('title')}</TableCell>
              <TableCell as="th">{t('recognitions.issuer')}</TableCell>
              <TableCell as="th">{t('recognitions.date')}</TableCell>
              <TableCell as="th" width="120px">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recognitions.map((recognition) => (
              <TableRow key={recognition.id}>
                <TableCell>
                  {recognition.photoKey ? (
                    <View 
                      backgroundColor="var(--amplify-colors-background-secondary)" 
                      width="50px" 
                      height="50px" 
                      borderRadius="4px"
                      overflow="hidden"
                    >
                      <ImagePreview photoKey={recognition.photoKey} alt={recognition.title || ''} />
                    </View>
                  ) : (
                    <Flex 
                      backgroundColor="var(--amplify-colors-background-secondary)" 
                      width="50px" 
                      height="50px" 
                      borderRadius="4px"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Award size={24} />
                    </Flex>
                  )}
                </TableCell>
                <TableCell>
                  <Text fontWeight="bold">{recognition.title}</Text>
                  <Text fontSize="0.8rem" color="var(--amplify-colors-font-tertiary)">
                    {recognition.description?.length > 60 
                      ? `${recognition.description.substring(0, 60)}...` 
                      : recognition.description}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text>{recognition.issuer}</Text>
                  {recognition.issuerUrl && (
                    <Flex alignItems="center" gap="4px">
                      <ExternalLink size={12} />
                      <Text fontSize="0.8rem" color="var(--amplify-colors-brand-primary)">
                        <a 
                          href={recognition.issuerUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {t('view_source')}
                        </a>
                      </Text>
                    </Flex>
                  )}
                </TableCell>
                <TableCell>
                  <Flex alignItems="center" gap="4px">
                    <Calendar size={14} />
                    <Text>{formatDate(recognition.issueDate)}</Text>
                  </Flex>
                  {recognition.credentialId && (
                    <Text fontSize="0.8rem" color="var(--amplify-colors-font-tertiary)">
                      ID: {recognition.credentialId}
                    </Text>
                  )}
                </TableCell>
                <TableCell>
                  <Flex gap="8px">
                    <Menu 
                      trigger={
                        <Button size="small" variation="link">
                          <MoreVertical size={18} />
                        </Button>
                      }
                    >
                      <MenuItem onClick={() => window.open(getLocalizedPath(`/recognitions`), '_blank')}>
                        <Flex alignItems="center" gap="8px">
                          <Eye size={16} />
                          <Text>{t('view')}</Text>
                        </Flex>
                      </MenuItem>
                      <MenuItem onClick={() => window.location.href = getLocalizedPath(`/admin/recognitions/${recognition.id}`)}>
                        <Flex alignItems="center" gap="8px">
                          <Edit3 size={16} />
                          <Text>{t('edit')}</Text>
                        </Flex>
                      </MenuItem>
                      <Divider />
                      <MenuItem isDisabled={deleteLoading === recognition.id} onClick={() => handleDeleteRecognition(recognition.id)}>
                        <Flex alignItems="center" gap="8px" color="var(--amplify-colors-red-60)">
                          {deleteLoading === recognition.id ? (
                            <Loader size="small" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          <Text>{t('delete')}</Text>
                        </Flex>
                      </MenuItem>
                    </Menu>
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
          <Alert variation="info" isDismissible={false} marginTop="1rem">
            {t('publications.no_records')}
          </Alert>
        );
      }

      return (
        <Table highlightOnHover={true} size="small" variation="bordered">
          <TableHead>
            <TableRow>
              <TableCell as="th" width="60px">{t('image')}</TableCell>
              <TableCell as="th">{t('title')}</TableCell>
              <TableCell as="th">{t('publications.source')}</TableCell>
              <TableCell as="th">{t('publications.type')}</TableCell>
              <TableCell as="th">{t('publications.date')}</TableCell>
              <TableCell as="th" width="120px">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {publications.map((publication) => (
              <TableRow key={publication.id}>
                <TableCell>
                  {publication.photoKey ? (
                    <View 
                      backgroundColor="var(--amplify-colors-background-secondary)" 
                      width="50px" 
                      height="50px" 
                      borderRadius="4px"
                      overflow="hidden"
                    >
                      <ImagePreview photoKey={publication.photoKey} alt={publication.title || ''} />
                    </View>
                  ) : (
                    <Flex 
                      backgroundColor="var(--amplify-colors-background-secondary)" 
                      width="50px" 
                      height="50px" 
                      borderRadius="4px"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <BookOpen size={24} />
                    </Flex>
                  )}
                </TableCell>
                <TableCell>
                  <Text fontWeight="bold">{publication.title}</Text>
                  <Text fontSize="0.8rem" color="var(--amplify-colors-font-tertiary)">
                    {publication.description?.length > 60 
                      ? `${publication.description.substring(0, 60)}...` 
                      : publication.description}
                  </Text>
                </TableCell>
                <TableCell>
                  <Badge
                    size="small" 
                    backgroundColor={getSourceColor(publication.source)}
                    color="white"
                  >
                    {publication.source}
                  </Badge>
                  {publication.publicationUrl && (
                    <Flex alignItems="center" gap="4px" marginTop="4px">
                      <ExternalLink size={12} />
                      <Text fontSize="0.8rem" color="var(--amplify-colors-brand-primary)">
                        <a 
                          href={publication.publicationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {t('view_publication')}
                        </a>
                      </Text>
                    </Flex>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    size="small" 
                    backgroundColor={getTypeColor(publication.type)}
                    color="white"
                  >
                    {publication.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Flex alignItems="center" gap="4px">
                    <Calendar size={14} />
                    <Text>{formatDate(publication.publicationDate)}</Text>
                  </Flex>
                </TableCell>
                <TableCell>
                  <Flex gap="8px">
                    <Menu 
                      trigger={
                        <Button size="small" variation="link">
                          <MoreVertical size={18} />
                        </Button>
                      }
                    >
                      <MenuItem onClick={() => window.open(getLocalizedPath(`/recognitions`), '_blank')}>
                        <Flex alignItems="center" gap="8px">
                          <Eye size={16} />
                          <Text>{t('view')}</Text>
                        </Flex>
                      </MenuItem>
                      <MenuItem onClick={() => window.location.href = getLocalizedPath(`/admin/publications/${publication.id}`)}>
                        <Flex alignItems="center" gap="8px">
                          <Edit3 size={16} />
                          <Text>{t('edit')}</Text>
                        </Flex>
                      </MenuItem>
                      <Divider />
                      <MenuItem isDisabled={deleteLoading === publication.id} onClick={() => handleDeletePublication(publication.id)}>
                        <Flex alignItems="center" gap="8px" color="var(--amplify-colors-red-60)">
                          {deleteLoading === publication.id ? (
                            <Loader size="small" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          <Text>{t('delete')}</Text>
                        </Flex>
                      </MenuItem>
                    </Menu>
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
