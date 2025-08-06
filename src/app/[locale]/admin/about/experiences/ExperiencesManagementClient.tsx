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
  Divider,
  Heading,
  useTheme as useAmplifyTheme,
  Grid
} from '@aws-amplify/ui-react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  Briefcase,
  ArrowLeft,
  Building2,
  Calendar,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import { getImageUrl as getImageUrlHelper } from '@/lib/utils/image-helpers';

// Tipos para Experience
type Experience = Schema["Experiences"]["type"];

interface ExperiencesManagementClientProps {
  locale: SupportedLocale;
}

const ExperiencesManagementClient: React.FC<ExperiencesManagementClientProps> = ({ locale }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [experienceImageUrls, setExperienceImageUrls] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);

  const { mode } = useTheme();
  const { tokens } = useAmplifyTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

  // Fetch experiences from Amplify Data API
  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const client = generateClient<Schema>();
      
      // Fetch experiences
      const experiencesResponse = await client.models.Experiences.list({
        authMode: 'userPool',
      });
      
      if (experiencesResponse.data) {
        setExperiences(experiencesResponse.data);
        
        // Fetch experience images
        const imageUrls: Record<string, string> = {};
        for (const experience of experiencesResponse.data) {
          if (experience.photoKey) {
            const imageUrl = await getImageUrl(experience.photoKey);
            if (imageUrl) {
              imageUrls[experience.id] = imageUrl;
            }
          }
        }
        setExperienceImageUrls(imageUrls);
      }
    } catch (err) {
      console.error('Error fetching experiences data:', err);
      setError(t('about.experiences.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
    
    // Handle responsive design
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Delete experience
  const handleDeleteExperience = async (experienceId: string) => {
    if (!confirm(t('about.experiences.confirm_delete'))) {
      return;
    }

    try {
      setDeleteLoading(experienceId);
      
      const client = generateClient<Schema>();
      
      // Get experience data to clean up images if any
      const experienceResponse = await client.models.Experiences.get({ id: experienceId });
      const experienceData = experienceResponse.data;
      
      if (!experienceData) {
        throw new Error(t('about.experiences.not_found'));
      }

      // Clean up image from S3 if exists
      if (experienceData.photoKey) {
        try {
          const normalizedPath = experienceData.photoKey.startsWith('public/') 
            ? experienceData.photoKey.slice(7) 
            : experienceData.photoKey;
          
          await remove({
            path: normalizedPath,
          });
          console.log(`✅ Image deleted from S3: ${experienceData.photoKey}`);
        } catch (imgError) {
          console.warn('Could not delete image from S3:', imgError);
        }
      }

      // Delete from DynamoDB
      await client.models.Experiences.delete({
        id: experienceId
      });
      
      console.log(`✅ Experience ${experienceId} deleted from DynamoDB`);
      
      // Update local state
      setExperiences(prev => prev.filter(exp => exp.id !== experienceId));
      
      // Remove image URL from state
      setExperienceImageUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[experienceId];
        return newUrls;
      });
      
      console.log(`🎉 Experience deleted successfully`);
      
    } catch (err) {
      console.error('Error deleting experience:', err);
      setError(`${t('about.experiences.error_deleting')}: ${err instanceof Error ? err.message : t('about.experiences.unknown_error')}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get image URL from Storage
  const getImageUrl = async (key: string | null | undefined) => {
    return await getImageUrlHelper(key);
  };

  if (loading) {
    return (
      <View padding="large" textAlign="center">
        <Loader size="large" />
        <Text fontSize="medium" color="font.tertiary" marginTop="medium">
          {t('about.experiences.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View padding="large">
      <Flex direction="column" gap="large">
        {/* Header */}
        <Flex direction={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'center'} gap="medium">
          <Flex direction="row" alignItems="center" gap="medium">
            <Button
              variation="link"
              onClick={() => router.push(getLocalizedPath('/admin'))}
              size="small"
              style={{
                color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                minWidth: 'auto',
                padding: '8px'
              }}
            >
              <ArrowLeft size={16} />
            </Button>
            <View flex="1">
              <Heading level={1} fontSize={isMobile ? 'large' : 'xl'} fontWeight="bold" style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                {t('about.experiences.title')}
              </Heading>
              <Text fontSize={isMobile ? 'small' : 'medium'} style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
                {t('about.experiences.description')}
              </Text>
            </View>
          </Flex>
          <Link href={getLocalizedPath('/admin/about/experiences/new')}>
            <Button 
              variation="primary" 
              size={isMobile ? 'large' : 'small'}
              style={{
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <Flex alignItems="center" gap="xs" justifyContent="center">
                <Plus size={16} />
                {t('about.experiences.create')}
              </Flex>
            </Button>
          </Link>
        </Flex>

        {/* Error Alert */}
        {error && (
          <Alert
            variation="error"
            isDismissible={true}
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Stats Summary */}
        {experiences.length > 0 && (
          <Grid templateColumns={isMobile ? '1fr' : 'repeat(3, 1fr)'} gap="medium">
            <Card 
              padding="medium"
              style={{
                backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                borderRadius: '12px'
              }}
            >
              <Flex direction="column" alignItems="center" gap="xs">
                <Text fontSize="2xl" fontWeight="bold" color="#3B82F6">
                  {experiences.length}
                </Text>
                <Text fontSize="small" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }} textAlign="center">
                  {t('about.experiences.total_experiences')}
                </Text>
              </Flex>
            </Card>
            <Card 
              padding="medium"
              style={{
                backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                borderRadius: '12px'
              }}
            >
              <Flex direction="column" alignItems="center" gap="xs">
                <Text fontSize="2xl" fontWeight="bold" color="#22C55E">
                  {experiences.filter(exp => !exp.endDate).length}
                </Text>
                <Text fontSize="small" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }} textAlign="center">
                  {t('about.experiences.current_positions')}
                </Text>
              </Flex>
            </Card>
            <Card 
              padding="medium"
              style={{
                backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                borderRadius: '12px'
              }}
            >
              <Flex direction="column" alignItems="center" gap="xs">
                <Text fontSize="2xl" fontWeight="bold" color="#F59E0B">
                  {new Set(experiences.map(exp => exp.company)).size}
                </Text>
                <Text fontSize="small" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }} textAlign="center">
                  {t('about.experiences.companies')}
                </Text>
              </Flex>
            </Card>
          </Grid>
        )}

        {/* Experiences Content */}
        <View>
          {experiences.length > 0 ? (
            <>
              {/* Desktop Table View */}
              {!isMobile && (
                <Table 
                  highlightOnHover
                  style={{
                    backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                    borderRadius: '12px'
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Text fontWeight="semibold" style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                          {t('about.experiences.company')}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text fontWeight="semibold" style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                          {t('about.experiences.position')}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text fontWeight="semibold" style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                          {t('about.experiences.period')}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text fontWeight="semibold" style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                          {t('about.experiences.actions')}
                        </Text>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {experiences.map((experience) => (
                      <TableRow key={experience.id}>
                        <TableCell>
                          <Flex alignItems="center" gap="small">
                            {experience.photoKey && experienceImageUrls[experience.id] ? (
                              <div style={{ 
                                width: '40px', 
                                height: '40px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)'
                              }}>
                                <img 
                                  src={experienceImageUrls[experience.id]} 
                                  alt={`${experience.company} logo`}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Building2 size={20} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                              </div>
                            )}
                            <Text fontWeight="semibold" style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                              {experience.company}
                            </Text>
                          </Flex>
                        </TableCell>
                        <TableCell>
                          <Text style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>{experience.position}</Text>
                        </TableCell>
                        <TableCell>
                          <Flex alignItems="center" gap="xs">
                            <Calendar size={14} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                            <Text fontSize="small" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
                              {experience.startDate} - {experience.endDate || t('about.experiences.present')}
                            </Text>
                          </Flex>
                        </TableCell>
                        <TableCell>
                          <Menu
                            trigger={
                              <Button 
                                variation="link" 
                                size="small"
                                style={{
                                  color: mode === 'dark' ? '#CBD5E1' : '#64748B'
                                }}
                              >
                                <MoreVertical size={16} />
                              </Button>
                            }
                            menuAlign="end"
                          >
                            <Link href={getLocalizedPath(`/admin/about/experiences/${experience.id}`)}>
                              <MenuItem>
                                <Flex alignItems="center" gap="small">
                                  <Edit3 size={16} />
                                  {t('about.experiences.edit')}
                                </Flex>
                              </MenuItem>
                            </Link>
                            <Divider />
                            <MenuItem 
                              onClick={() => handleDeleteExperience(experience.id)}
                              isDisabled={deleteLoading === experience.id}
                              style={{
                                color: tokens.colors.font.error
                              }}
                            >
                              <Flex alignItems="center" gap="small">
                                <Trash2 size={16} />
                                {deleteLoading === experience.id ? t('about.experiences.deleting') : t('about.experiences.delete')}
                              </Flex>
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Mobile Card View */}
              {isMobile && (
                <Grid templateColumns="1fr" gap="medium">
                  {experiences.map((experience) => (
                    <Card 
                      key={experience.id} 
                      padding="medium"
                      className="admin-experience-card"
                      style={{
                        backgroundColor: mode === 'dark' ? tokens.colors.background.secondary : tokens.colors.background.primary,
                        border: `1px solid ${tokens.colors.border.primary}`,
                        borderRadius: tokens.radii.medium
                      }}
                    >
                      <Flex direction="column" gap="small">
                        {/* Header with company and actions */}
                        <Flex justifyContent="space-between" alignItems="flex-start">
                          <Flex alignItems="center" gap="small" flex="1">
                            {experience.photoKey && experienceImageUrls[experience.id] ? (
                              <div style={{ 
                                width: '48px', 
                                height: '48px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                                flexShrink: 0
                              }}>
                                <img 
                                  src={experienceImageUrls[experience.id]} 
                                  alt={`${experience.company} logo`}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Building2 size={24} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                              </div>
                            )}
                            <View flex="1">
                              <Text fontWeight="bold" fontSize="medium" style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                                {experience.company}
                              </Text>
                              <Text fontSize="small" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
                                {experience.position}
                              </Text>
                            </View>
                          </Flex>
                          <Menu
                            trigger={
                              <Button 
                                variation="link" 
                                size="small"
                                style={{
                                  color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                                  minWidth: 'auto',
                                  padding: '8px'
                                }}
                              >
                                <MoreVertical size={16} />
                              </Button>
                            }
                            menuAlign="end"
                          >
                            <Link href={getLocalizedPath(`/admin/about/experiences/${experience.id}`)}>
                              <MenuItem>
                                <Flex alignItems="center" gap="small">
                                  <Edit3 size={16} />
                                  {t('about.experiences.edit')}
                                </Flex>
                              </MenuItem>
                            </Link>
                            <Divider />
                            <MenuItem 
                              onClick={() => handleDeleteExperience(experience.id)}
                              isDisabled={deleteLoading === experience.id}
                              style={{
                                color: tokens.colors.font.error
                              }}
                            >
                              <Flex alignItems="center" gap="small">
                                <Trash2 size={16} />
                                {deleteLoading === experience.id ? t('about.experiences.deleting') : t('about.experiences.delete')}
                              </Flex>
                            </MenuItem>
                          </Menu>
                        </Flex>

                        {/* Period */}
                        <Flex alignItems="center" gap="xs">
                          <Calendar size={14} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                          <Text fontSize="small" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
                            {experience.startDate} - {experience.endDate || t('about.experiences.present')}
                          </Text>
                        </Flex>

                        {/* Location if available */}
                        {experience.location && (
                          <Flex alignItems="center" gap="xs">
                            <MapPin size={14} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                            <Text fontSize="small" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
                              {experience.location}
                            </Text>
                          </Flex>
                        )}
                      </Flex>
                    </Card>
                  ))}
                </Grid>
              )}
            </>
          ) : (
            <Card 
              padding="large" 
              textAlign="center"
              style={{
                backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                borderRadius: '12px'
              }}
            >
              <Briefcase 
                size={48} 
                style={{ 
                  margin: '0 auto 16px', 
                  color: mode === 'dark' ? '#9CA3AF' : '#6B7280'
                }} 
              />
              <Text fontSize="medium" style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }} marginBottom="medium">
                {t('about.experiences.no_experiences')}
              </Text>
              <Link href={getLocalizedPath('/admin/about/experiences/new')}>
                <Button variation="primary">
                  <Flex alignItems="center" gap="xs">
                    <Plus size={16} />
                    {t('about.experiences.create')}
                  </Flex>
                </Button>
              </Link>
            </Card>
          )}
        </View>
      </Flex>
    </View>
  );
};

export default ExperiencesManagementClient;
