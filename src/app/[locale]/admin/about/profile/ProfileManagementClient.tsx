'use client';

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card, 
  Loader,
  Alert,
  Heading
} from '@aws-amplify/ui-react';
import { 
  Plus, 
  Edit3, 
  User,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import { getImageUrl as getImageUrlHelper } from '@/lib/utils/image-helpers';

// Tipos para Profile
type Profile = Schema["Profile"]["type"];

interface ProfileManagementClientProps {
  locale: SupportedLocale;
}

const ProfileManagementClient: React.FC<ProfileManagementClientProps> = ({ locale }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

  // Fetch profile from Amplify Data API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const client = generateClient<Schema>();
      
      // Fetch profile (should be only one)
      const profileResponse = await client.models.Profile.list({
        authMode: 'userPool',
      });
      
      if (profileResponse.data && profileResponse.data.length > 0) {
        const profileData = profileResponse.data[0];
        setProfile(profileData);
        
        // Fetch profile image if exists
        if (profileData.profilePhotoKey) {
          const imageUrl = await getImageUrl(profileData.profilePhotoKey);
          if (imageUrl) {
            setProfileImageUrl(imageUrl);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(t('about.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Get image URL from Storage
  const getImageUrl = async (key: string | null | undefined) => {
    if (key) {
      return await getImageUrlHelper(key);
    }
    return null;
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
                {t('about.profile.title')}
              </Heading>
              <Text fontSize="medium" color="font.secondary">
                {t('about.profile.description')}
              </Text>
            </View>
          </Flex>
          <Link href={getLocalizedPath(`/admin/about/profile/${profile?.id ? profile.id : 'new'}`)}>
            <Button variation="primary" size="small">
              <Flex alignItems="center" gap="xs">
                {profile ? <Edit3 size={16} /> : <Plus size={16} />}
                {profile ? t('about.profile.edit') : t('about.profile.create')}
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

        {/* Profile Content */}
        <View>
          {profile ? (
            <Card padding="medium">
              <Flex direction="row" gap="medium" alignItems="start">
                {profile.profilePhotoKey && profileImageUrl && (
                  <View width="80px" height="80px">
                    <img 
                      src={profileImageUrl} 
                      alt="Profile" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: '8px' 
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-profile.png';
                      }}
                    />
                  </View>
                )}
                <Flex direction="column" flex="1">
                  <Text fontSize="large" fontWeight="semibold">
                    {profile.name}
                  </Text>
                  <Text fontSize="medium" color="font.secondary">
                    {profile.currentPosition}
                  </Text>
                  <Text fontSize="small" color="font.tertiary" marginTop="xs">
                    {profile.description}
                  </Text>
                </Flex>
              </Flex>
            </Card>
          ) : (
            <Card padding="large" textAlign="center">
              <User size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <Text fontSize="medium" color="font.secondary" marginBottom="medium">
                {t('about.profile.no_profile')}
              </Text>
              <Link href={getLocalizedPath('/admin/about/profile/new')}>
                <Button variation="primary">
                  <Flex alignItems="center" gap="xs">
                    <Plus size={16} />
                    {t('about.profile.create')}
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

export default ProfileManagementClient;
