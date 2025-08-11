'use client';

import React, { useState, useCallback, memo } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card,
  TextField,
  TextAreaField,
  SwitchField,
  Badge,
  Alert,
  Divider,
  Heading
} from '@aws-amplify/ui-react';
import '../../../admin.css';
import { 
  ArrowLeft, 
  Save, 
  User,
  X,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { FileUploadInput } from '../../../projects/new/FileUploadInput';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';

const CreateProfileClient: React.FC = () => {
  interface ProfileFormData {
    name: string;
    currentPosition: string;
    description: string;
    mission: string;
    vision: string;
    philosophy: string;
    linkedinUrl: string;
    githubUrl: string;
    twitterUrl: string;
    emailContact: string;
    flags: string[];
    isActive: boolean;
  }
  
  const [formData, setFormData] = useState<ProfileFormData>({
      name: '',
      currentPosition: '',
      description: '',
      mission: '',
      vision: '',
      philosophy: '',
      linkedinUrl: '',
      githubUrl: '',
      twitterUrl: '',
      emailContact: '',
      flags: [],
      isActive: true,
    });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [flagInput, setFlagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleProfileImageSelect = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError(t('certifications.image_size_error'));
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [t]);

  const removeProfileImage = useCallback(() => {
    setProfileImage(null);
    setProfileImagePreview(null);
  }, []);

  const addFlag = useCallback(() => {
    if (flagInput.trim() && !formData.flags?.includes(flagInput.trim())) {
      handleInputChange('flags', [...(formData.flags || []), flagInput.trim()]);
      setFlagInput('');
    }
  }, [flagInput, formData.flags, handleInputChange]);

  const removeFlag = useCallback((flagToRemove: string) => {
    handleInputChange('flags', formData.flags?.filter(flag => flag !== flagToRemove) || []);
  }, [formData.flags, handleInputChange]);

  const uploadImage = async (file: File, profileId: string): Promise<string> => {
    try {
      return await uploadImageWithMetadata(file, profileId, 'Profile', 'profilePhotoKey');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Error uploading profile image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError(t('about.error_title_required'));
      return;
    }

    if (!formData.currentPosition.trim()) {
      setError(t('about.error_issuer_required'));
      return;
    }

    if (!formData.description.trim()) {
      setError(t('about.error_description_required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const client = generateClient<Schema>();

      const profileData = {
        name: formData.name.trim(),
        currentPosition: formData.currentPosition.trim(),
        description: formData.description.trim(),
        mission: formData.mission?.trim() || undefined,
        vision: formData.vision?.trim() || undefined,
        philosophy: formData.philosophy?.trim() || undefined,
        linkedinUrl: formData.linkedinUrl?.trim() || undefined,
        githubUrl: formData.githubUrl?.trim() || undefined,
        twitterUrl: formData.twitterUrl?.trim() || undefined,
        emailContact: formData.emailContact?.trim() || undefined,
        flags: formData.flags || [],
        isActive: formData.isActive || true,
      };

      const createResponse = await client.models.Profile.create(profileData, { authMode: 'userPool' });

      if (createResponse.errors) {
        throw new Error(createResponse.errors[0].message);
      }

      const profileId = createResponse.data?.id;
      
      if (!profileId) {
        throw new Error(t('about.error_creating_profile'));
      }

      if (profileImage) {
        const profilePhotoKey = await uploadImage(profileImage, profileId);
        await client.models.Profile.update({
          id: profileId,
          profilePhotoKey
        }, { authMode: 'userPool' });
      }

      console.log('✅ Perfil creado exitosamente:', createResponse.data);
      router.push(getLocalizedPath('/admin/about'));
      
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(`${t('about.error_creating_profile')}: ${err instanceof Error ? err.message : t('about.unknown_error')}`);
    } finally {
      setLoading(false);
    }
  };

  const cssVariables = {
    '--form-label-color': mode === 'dark' ? '#F1F5F9' : '#1E293B',
    '--form-input-bg': mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    '--form-input-border': mode === 'dark' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.4)',
    '--form-input-text': mode === 'dark' ? '#F1F5F9' : '#1E293B',
    '--form-placeholder-color': mode === 'dark' ? '#9CA3AF' : '#6B7280',
    '--form-focus-border': mode === 'dark' ? '#3B82F6' : '#2563EB',
    '--form-focus-shadow': mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.2)',
    '--form-description-color': mode === 'dark' ? '#CBD5E1' : '#64748B',
  } as React.CSSProperties;

  return (
    <View style={cssVariables}>
      <style dangerouslySetInnerHTML={{ __html: `
        .create-profile-form .amplify-field {
          margin-bottom: 1rem;
        }
        
        .create-profile-form .amplify-field > label {
          color: var(--form-label-color) !important;
          font-weight: 600 !important;
          margin-bottom: 0.5rem !important;
          display: block !important;
          font-size: 0.95rem !important;
        }
        
        .create-profile-form .amplify-input,
        .create-profile-form .amplify-textarea,
        .create-profile-form .amplify-select select {
          background-color: var(--form-input-bg) !important;
          border: 1px solid var(--form-input-border) !important;
          color: var(--form-input-text) !important;
          border-radius: 6px !important;
          padding: 0.75rem !important;
          font-size: 0.9rem !important;
        }
        
        .create-profile-form .amplify-input::placeholder,
        .create-profile-form .amplify-textarea::placeholder {
          color: var(--form-placeholder-color) !important;
          opacity: 0.8 !important;
          font-weight: 400 !important;
        }
        
        .create-profile-form .amplify-input:focus,
        .create-profile-form .amplify-textarea:focus,
        .create-profile-form .amplify-select select:focus {
          border-color: var(--form-focus-border) !important;
          box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
          outline: none !important;
        }
        
        .create-profile-form .amplify-field-group__control .amplify-field__description {
          color: var(--form-description-color) !important;
          font-size: 0.8rem !important;
          margin-top: 0.25rem !important;
          font-weight: 500 !important;
        }
      ` }} />

      {/* Header */}
      <Flex direction="column" gap="1rem" marginBottom="2rem">
        <Flex alignItems="center" gap="1rem">
          <Button
            variation="link"
            onClick={() => router.push(getLocalizedPath('/admin/about'))}
            style={{
              color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
              padding: '0.5rem',
            }}
          >
            <ArrowLeft size={20} />
          </Button>
          
          <Heading level={1} style={{
            color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            fontSize: '1.875rem',
            fontWeight: '700'
          }}>
            {t('about.create_profile')}
          </Heading>
        </Flex>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="create-profile-form">
        <Flex direction="column" gap="2rem">
          
          {/* Información Básica */}
          <Card style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px'
          }}>
            <View padding="1.5rem">
              <Heading level={3} marginBottom="1rem" style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                fontSize: '1.125rem'
              }}>
                {t('about.basic_info')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <TextField
                  label={`${t('about.name_label')} *`}
                  placeholder={t('about.name_placeholder')}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />

                <TextField
                  label={`${t('about.current_position_label')} *`}
                  placeholder={t('about.current_position_placeholder')}
                  value={formData.currentPosition}
                  onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                  required
                />

                <TextAreaField
                  label={`${t('about.description_label')} *`}
                  placeholder={t('about.description_placeholder')}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </Flex>
            </View>
          </Card>

          {/* Foto de Perfil */}
          <Card style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px'
          }}>
            <View padding="1.5rem">
              <Heading level={3} marginBottom="1rem" style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                fontSize: '1.125rem'
              }}>
                {t('about.profile_photo')}
              </Heading>

              {profileImagePreview ? (
                <View>
                  <Text fontSize="0.875rem" marginBottom="0.5rem" style={{
                    color: mode === 'dark' ? '#CBD5E1' : '#64748B'
                  }}>
                    {t('about.current_photo')}
                  </Text>
                  <View style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)'
                      }}
                    />
                    <Button
                      onClick={removeProfileImage}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </View>
                </View>
              ) : (
                <FileUploadInput
                  onFileSelect={handleProfileImageSelect}
                  accept="image/*"
                >
                  <Card
                    style={{
                      backgroundColor: mode === 'dark' ? 'rgba(71, 85, 105, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                      border: `2px dashed ${mode === 'dark' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.5)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <View padding="2rem" textAlign="center">
                      <User size={48} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} style={{ margin: '0 auto 1rem' }} />
                      <Text style={{
                        color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}>
                        {t('about.add_new_photo')}
                      </Text>
                      <Text style={{
                        color: mode === 'dark' ? '#9CA3AF' : '#6B7280',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem'
                      }}>
                        {t('certifications.max_5mb')}
                      </Text>
                    </View>
                  </Card>
                </FileUploadInput>
              )}
            </View>
          </Card>

          {/* Información Adicional */}
          <Card style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px'
          }}>
            <View padding="1.5rem">
              <Heading level={3} marginBottom="1rem" style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                fontSize: '1.125rem'
              }}>
                {t('about.additional_info')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <TextAreaField
                  label={t('about.mission_label')}
                  placeholder={t('about.mission_placeholder')}
                  value={formData.mission || ''}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  rows={3}
                />

                <TextAreaField
                  label={t('about.vision_label')}
                  placeholder={t('about.vision_placeholder')}
                  value={formData.vision || ''}
                  onChange={(e) => handleInputChange('vision', e.target.value)}
                  rows={3}
                />

                <TextAreaField
                  label={t('about.philosophy_label')}
                  placeholder={t('about.philosophy_placeholder')}
                  value={formData.philosophy || ''}
                  onChange={(e) => handleInputChange('philosophy', e.target.value)}
                  rows={3}
                />
              </Flex>
            </View>
          </Card>

          {/* Enlaces Sociales */}
          <Card style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px'
          }}>
            <View padding="1.5rem">
              <Heading level={3} marginBottom="1rem" style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                fontSize: '1.125rem'
              }}>
                {t('about.social_links')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <TextField
                  label={t('about.linkedin_url_label')}
                  placeholder={t('about.linkedin_url_placeholder')}
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                />

                <TextField
                  label={t('about.github_url_label')}
                  placeholder={t('about.github_url_placeholder')}
                  value={formData.githubUrl || ''}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                />

                <TextField
                  label={t('about.twitter_url_label')}
                  placeholder={t('about.twitter_url_placeholder')}
                  value={formData.twitterUrl || ''}
                  onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                />

                <TextField
                  label={t('about.email_contact_label')}
                  placeholder={t('about.email_contact_placeholder')}
                  value={formData.emailContact || ''}
                  onChange={(e) => handleInputChange('emailContact', e.target.value)}
                  type="email"
                />
              </Flex>
            </View>
          </Card>

          {/* Etiquetas Profesionales */}
          <Card style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px'
          }}>
            <View padding="1.5rem">
              <Heading level={3} marginBottom="1rem" style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                fontSize: '1.125rem'
              }}>
                {t('about.flags')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <Flex gap="0.5rem">
                  <TextField
                    label=""
                    placeholder={t('about.flag_placeholder')}
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFlag();
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="button"
                    onClick={addFlag}
                    variation="primary"
                    style={{
                      backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                      alignSelf: 'flex-end'
                    }}
                  >
                    <Plus size={16} />
                    {t('about.add_flag')}
                  </Button>
                </Flex>

                {formData.flags && formData.flags.length > 0 && (
                  <Flex wrap="wrap" gap="0.5rem">
                    {formData.flags.map((flag, index) => (
                      <Badge
                        key={index}
                        style={{
                          backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                          color: mode === 'dark' ? '#93C5FD' : '#2563EB',
                          border: mode === 'dark' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {flag}
                        <Button
                          type="button"
                          onClick={() => removeFlag(flag)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'inherit',
                            padding: '0',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={12} />
                        </Button>
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Flex>
            </View>
          </Card>

          {/* Estado */}
          <Card style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px'
          }}>
            <View padding="1.5rem">
              <Heading level={3} marginBottom="1rem" style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                fontSize: '1.125rem'
              }}>
                {t('about.status')}
              </Heading>

              <SwitchField
                label={t('about.is_active_label')}
                isChecked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                labelPosition="end"
              />
              <Text fontSize="0.875rem" style={{
                color: mode === 'dark' ? '#9CA3AF' : '#6B7280',
                marginTop: '0.25rem'
              }}>
                {t('about.is_active_description')}
              </Text>
            </View>
          </Card>

        </Flex>

        {/* Botones de acción */}
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          marginTop="2rem"
          gap="1rem"
          direction={{ base: 'column', medium: 'row' }}
        >
          <Button
            type="button"
            variation="link"
            onClick={() => router.push(getLocalizedPath('/admin/about'))}
            style={{
              color: mode === 'dark' ? '#9CA3AF' : '#6B7280'
            }}
          >
            {t('about.cancel')}
          </Button>

          <Button
            type="submit"
            variation="primary"
            isLoading={loading}
            loadingText={t('about.saving')}
            style={{
              backgroundColor: mode === 'dark' ? '#22C55E' : '#16A34A',
              minWidth: '150px'
            }}
          >
            <Save size={16} style={{ marginRight: '0.5rem' }} />
            {t('about.save_changes')}
          </Button>
        </Flex>
      </form>
    </View>
  );
};

export default CreateProfileClient;