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
  Heading
} from '@aws-amplify/ui-react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  Briefcase,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';

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

  const { mode } = useTheme();
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
      setError(t('about.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
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
      setError(`${t('about.experiences.error_deleting')}: ${err instanceof Error ? err.message : t('about.unknown_error')}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get image URL from Storage
  const getImageUrl = async (key: string | null | undefined) => {
    if (!key) return null;
    
    try {
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

  if (loading) {
    return (
      <View padding="large" textAlign="center">
        <Loader size="large" />
        <Text fontSize="medium" color="font.tertiary" marginTop="medium">
          {t('about.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View padding="large">
      <Flex direction="column" gap="large">
        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center">
          <Flex direction="row" alignItems="center" gap="medium">
            <Button
              variation="link"
              onClick={() => router.push(getLocalizedPath('/admin'))}
              size="small"
            >
              <ArrowLeft size={16} />
            </Button>
            <View>
              <Heading level={1} fontSize="xl" fontWeight="bold" color="font.primary">
                {t('about.experiences.title')}
              </Heading>
              <Text fontSize="medium" color="font.secondary">
                {t('about.experiences.description')}
              </Text>
            </View>
          </Flex>
          <Link href={getLocalizedPath('/admin/about/experiences/new')}>
            <Button variation="primary" size="small">
              <Flex alignItems="center" gap="xs">
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

        {/* Experiences Content */}
        <View>
          {experiences.length > 0 ? (
            <Table highlightOnHover>
              <TableHead>
                <TableRow>
                  <TableCell>{t('about.experiences.company')}</TableCell>
                  <TableCell>{t('about.experiences.position')}</TableCell>
                  <TableCell>{t('about.experiences.period')}</TableCell>
                  <TableCell>{t('about.experiences.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experiences.map((experience) => (
                  <TableRow key={experience.id}>
                    <TableCell>
                      <Flex alignItems="center" gap="small">
                        {experience.photoKey && experienceImageUrls[experience.id] && (
                          <div style={{ width: '32px', height: '32px' }}>
                            <img 
                              src={experienceImageUrls[experience.id]} 
                              alt="Company" 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                borderRadius: '4px' 
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-company.png';
                              }}
                            />
                          </div>
                        )}
                        <Text fontWeight="semibold">{experience.company}</Text>
                      </Flex>
                    </TableCell>
                    <TableCell>{experience.position}</TableCell>
                    <TableCell>
                      <Text fontSize="small">
                        {experience.startDate} - {experience.endDate || t('about.experiences.present')}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Menu
                        trigger={
                          <Button variation="link" size="small">
                            <MoreVertical size={16} />
                          </Button>
                        }
                        menuAlign="end"
                      >
                        <Link href={getLocalizedPath(`/admin/about/experiences/${experience.id}`)}>
                          <MenuItem>
                            <Edit3 size={16} />
                            {t('about.experiences.edit')}
                          </MenuItem>
                        </Link>
                        <Divider />
                        <MenuItem 
                          onClick={() => handleDeleteExperience(experience.id)}
                          isDisabled={deleteLoading === experience.id}
                        >
                          <Trash2 size={16} />
                          {deleteLoading === experience.id ? t('about.experiences.deleting') : t('about.experiences.delete')}
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card padding="large" textAlign="center">
              <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <Text fontSize="medium" color="font.secondary" marginBottom="medium">
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
