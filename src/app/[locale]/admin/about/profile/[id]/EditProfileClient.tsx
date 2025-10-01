'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card, 
  Heading,
  TextField,
  TextAreaField,
  Badge,
  Alert,
  Loader,
  Divider
} from '@aws-amplify/ui-react';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  X,
  User,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';
import S3Cleanup from '@/lib/utils/s3-cleanup';
import type { Schema } from '../../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';

// Estilos personalizados para el formulario
const editProfileStyles = `
  .edit-profile-form .amplify-field {
    margin-bottom: 1rem;
  }
  
  .edit-profile-form .amplify-field > label {
    color: var(--form-label-color) !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
    font-size: 0.95rem !important;
  }
  
  .edit-profile-form .amplify-input,
  .edit-profile-form .amplify-textarea,
  .edit-profile-form .amplify-select select {
    background-color: var(--form-input-bg) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-text) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.9rem !important;
  }
  
  .edit-profile-form .amplify-input::placeholder,
  .edit-profile-form .amplify-textarea::placeholder {
    color: var(--form-placeholder-color) !important;
    opacity: 0.8 !important;
    font-weight: 400 !important;
  }
  
  .edit-profile-form .amplify-input:focus,
  .edit-profile-form .amplify-textarea:focus,
  .edit-profile-form .amplify-select select:focus {
    border-color: var(--form-focus-border) !important;
    box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
    outline: none !important;
  }
  
  .edit-profile-form .amplify-field-group__control .amplify-field__description {
    color: var(--form-description-color) !important;
    font-size: 0.8rem !important;
    margin-top: 0.25rem !important;
    font-weight: 500 !important;
  }

  .edit-profile-form .image-remove-button {
    position: absolute !important;
    background-color: rgba(239, 68, 68, 0.9) !important;
    color: white !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 0.5rem !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    max-width: 32px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
    transition: all 0.2s ease !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    top: 8px !important;
    right: 8px !important;
    z-index: 10 !important;
  }

  .edit-profile-form .image-remove-button:hover {
    background-color: rgba(239, 68, 68, 1) !important;
    transform: scale(1.1) !important;
  }

  /* Responsive design improvements */
  @media (max-width: 768px) {
    .edit-profile-form .amplify-flex {
      flex-direction: column !important;
    }
    
    .edit-profile-form .amplify-button {
      width: 100% !important;
      margin-top: 0.5rem !important;
    }

    .edit-profile-form .image-remove-button {
      width: 28px !important;
      height: 28px !important;
      min-width: 28px !important;
      max-width: 28px !important;
      padding: 0.25rem !important;
      font-size: 12px !important;
      border-radius: 4px !important;
      top: 4px !important;
      right: 4px !important;
    }
  }
`;

// Generar el cliente de Amplify
const client = generateClient<Schema>();

type Profile = Schema["Profile"]["type"];

interface ProfileFormData {
  name: string;
  currentPosition: string;
  description: string;
  mission: string;
  vision: string;
  philosophy: string;
  flags: string[];
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  emailContact: string;
  isActive: boolean;
}

interface EditProfileClientProps {
  locale: SupportedLocale;
  profileId: string;
}

function EditProfileClient({ locale, profileId }: EditProfileClientProps): React.JSX.Element {  
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();

  // Estados para el formulario
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    currentPosition: '',
    description: '',
    mission: '',
    vision: '',
    philosophy: '',
    flags: [],
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    emailContact: '',
    isActive: false
  });

  // Estados para archivos de imagen
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  // Estados de la UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Cargar datos del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await client.models.Profile.get({ 
          id: profileId 
        }, {
          authMode: 'userPool'
        });

        if (response.data) {
          const profileData = response.data;
          setProfile(profileData);
          
          // Llenar el formulario con los datos existentes
          setFormData({
            name: profileData.name || '',
            currentPosition: profileData.currentPosition || '',
            description: profileData.description || '',
            mission: profileData.mission || '',
            vision: profileData.vision || '',
            philosophy: profileData.philosophy || '',
            flags: (profileData.flags || []).filter((flag): flag is string => flag !== null),
            linkedinUrl: profileData.linkedinUrl || '',
            githubUrl: profileData.githubUrl || '',
            twitterUrl: profileData.twitterUrl || '',
            emailContact: profileData.emailContact || '',
            isActive: profileData.isActive || false
          });

          // Cargar imagen actual si existe
          if (profileData.profilePhotoKey) {
            try {
              const normalizedPath = profileData.profilePhotoKey.startsWith('public/') 
                ? profileData.profilePhotoKey.slice(7) 
                : profileData.profilePhotoKey;
              
              const url = await getUrl({
                path: normalizedPath,
              });
              setCurrentImageUrl(url.url.toString());
            } catch (imgError) {
              console.warn('Could not load current image:', imgError);
            }
          }
        } else {
          setError(t('about.profile.not_found'));
        }
      } catch (fetchError) {
        console.error('Error fetching profile:', fetchError);
        setError(t('about.profile.error_loading'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, t]);

  // Manejadores de formulario
  const handleInputChange = (field: keyof ProfileFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejador de subida de imagen
  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(t('about.profile.image_too_large'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError(t('about.profile.invalid_image_format'));
        return;
      }

      setProfileImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  }, [t]);

  // Remover imagen nueva
  const removeNewImage = useCallback(() => {
    setProfileImage(null);
    setImagePreview('');
  }, []);

  // Remover imagen actual
  const removeCurrentImage = useCallback(async () => {
    if (!profile?.profilePhotoKey) return;

    try {
      await S3Cleanup.deleteSingleFile(profile.profilePhotoKey);
      setCurrentImageUrl('');
    } catch (removeError) {
      console.warn('Could not remove current image from S3:', removeError);
    }
  }, [profile?.profilePhotoKey]);

  // Subir imagen a S3 (optimized)
  const uploadImageToS3 = async (file: File): Promise<string> => {
    try {
      const key = await uploadImageWithMetadata(file, profileId, 'Profile', 'profilePhotoKey');
      console.log('✅ Image uploaded to S3 with metadata:', key);
      return key;
    } catch (uploadError) {
      console.error('❌ Error uploading image to S3:', uploadError);
      throw new Error(t('about.profile.error_uploading_image'));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.currentPosition.trim()) {
      setError(t('about.profile.required_fields_missing'));
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      let profilePhotoKey = profile?.profilePhotoKey;

      // Si hay una nueva imagen, subirla
      if (profileImage) {
        // Remover imagen anterior si existe
        if (profile?.profilePhotoKey) {
          await removeCurrentImage();
        }
        profilePhotoKey = await uploadImageToS3(profileImage);
      }

      // Si se removió la imagen actual y no hay nueva imagen
      if (!currentImageUrl && !profileImage && profile?.profilePhotoKey) {
        profilePhotoKey = undefined;
      }

      // Actualizar el perfil en DynamoDB
      const response = await client.models.Profile.update({
        id: profileId,
        name: formData.name.trim(),
        currentPosition: formData.currentPosition.trim(),
        description: formData.description.trim(),
        mission: formData.mission.trim() || undefined,
        vision: formData.vision.trim() || undefined,
        philosophy: formData.philosophy.trim() || undefined,
        flags: formData.flags.length > 0 ? formData.flags : undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        githubUrl: formData.githubUrl.trim() || undefined,
        twitterUrl: formData.twitterUrl.trim() || undefined,
        emailContact: formData.emailContact.trim() || undefined,
        isActive: formData.isActive,
        profilePhotoKey: profilePhotoKey,
      }, {
        authMode: 'userPool'
      });

      if (response.data) {
        setSuccess(t('about.profile.updated_successfully'));
        
        // Redirect después de un delay
        setTimeout(() => {
          router.push(getLocalizedPath('/admin/about'));
        }, 2000);
      }
    } catch (updateError) {
      console.error('❌ Error updating profile:', updateError);
      setError(`${t('about.profile.error_updating')}: ${updateError instanceof Error ? updateError.message : t('about.unknown_error')}`);
    } finally {
      setIsSaving(false);
    }
  };



  if (isLoading) {
    return (
      <View padding="large" textAlign="center">
        <Loader size="large" />
        <Text fontSize="medium" color="font.tertiary" marginTop="medium">
          {t('about.profile.loading')}
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View padding="large" textAlign="center">
        <Text fontSize="large" color="font.primary">
          {t('about.profile.not_found')}
        </Text>
      </View>
    );
  }

  const isDark = mode === 'dark';
  
  // Definir variables CSS para el tema con mejor contraste
  const cssVariables = {
    '--form-label-color': isDark ? '#F8FAFC' : '#0F172A',
    '--form-input-bg': isDark ? '#1E293B' : '#FFFFFF',
    '--form-input-border': isDark ? '#64748B' : '#D1D5DB',
    '--form-input-text': isDark ? '#F8FAFC' : '#111827',
    '--form-placeholder-color': isDark ? '#94A3B8' : '#6B7280',
    '--form-focus-border': isDark ? '#3B82F6' : '#2563EB',
    '--form-focus-shadow': isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(37, 99, 235, 0.25)',
    '--form-description-color': isDark ? '#D1D5DB' : '#6B7280'
  } as React.CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: editProfileStyles }} />
      <View 
        style={{
          padding: '1.5rem',
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          minHeight: '100vh',
          ...cssVariables
        }}
        className="edit-profile-form"
      >
        <Card
          style={{
            padding: '2rem',
            backgroundColor: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            maxWidth: '800px',
            margin: '0 auto'
          }}
        >
          <Flex direction="column" gap="large">
            {/* Header */}
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" gap="medium">
                <Button
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: isDark ? '#CBD5E1' : '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => router.push(getLocalizedPath('/admin/about'))}
                >
                  <ArrowLeft size={20} />
                </Button>
                <Heading 
                  level={2} 
                  style={{
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    margin: 0
                  }}
                >
                  {t('about.profile.edit')}
                </Heading>
              </Flex>
            </Flex>

            {error && (
              <Alert variation="error" hasIcon={true}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variation="success" hasIcon={true}>
                {success}
              </Alert>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="edit-profile-form">
              <Flex direction="column" gap="large">
              
              {/* Profile Image Upload */}
              <View>
                <Text fontSize="medium" fontWeight="semibold" marginBottom="small">
                  {t('about.profile.profile_image')}
                </Text>
                
                {/* Current Image */}
                {currentImageUrl && !imagePreview && (
                  <div className="image-preview">
                    <img src={currentImageUrl} alt="Current profile" />
                    <button
                      type="button"
                      className="image-remove-button"
                      onClick={() => {
                        setCurrentImageUrl('');
                        removeCurrentImage();
                      }}
                      title={t('about.profile.remove_current_image')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* New Image Preview */}
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="New profile preview" />
                    <button
                      type="button"
                      className="image-remove-button"
                      onClick={removeNewImage}
                      title={t('about.profile.remove_new_image')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Upload Container */}
                {!currentImageUrl && !imagePreview && (
                  <div className="image-upload-container" onClick={() => document.getElementById('profile-image-input')?.click()}>
                    <User size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <Text fontSize="medium" color="font.secondary" marginBottom="small">
                      {t('about.profile.click_to_upload_image')}
                    </Text>
                    <Text fontSize="small" color="font.tertiary">
                      {t('about.profile.image_requirements')}
                    </Text>
                  </div>
                )}

                {/* Upload New Image Button */}
                {(currentImageUrl || imagePreview) && (
                  <Button
                    variation="link"
                    onClick={() => document.getElementById('profile-image-input')?.click()}
                    marginTop="small"
                  >
                    <Flex alignItems="center" gap="xs">
                      <ImageIcon size={16} />
                      {t('about.profile.change_image')}
                    </Flex>
                  </Button>
                )}
                
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </View>

              <Divider />

              {/* Basic Information */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.profile.basic_information')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                  <TextField
                    label={t('about.name_label')}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder={t('about.name_placeholder')}
                    flex="1"
                  />
                  <TextField
                    label={t('about.current_position_label')}
                    value={formData.currentPosition}
                    onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                    required
                    placeholder={t('about.current_position_placeholder')}
                    flex="1"
                  />
                </Flex>

                <TextAreaField
                  label={t('about.description_label')}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('about.description_placeholder')}
                  rows={4}
                />

                <TextAreaField
                  label={t('about.mission_label')}
                  value={formData.mission}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  placeholder={t('about.mission_placeholder')}
                  rows={3}
                />

                <TextAreaField
                  label={t('about.vision_label')}
                  value={formData.vision}
                  onChange={(e) => handleInputChange('vision', e.target.value)}
                  placeholder={t('about.vision_placeholder')}
                  rows={3}
                />

                <TextAreaField
                  label={t('about.philosophy_label')}
                  value={formData.philosophy}
                  onChange={(e) => handleInputChange('philosophy', e.target.value)}
                  placeholder={t('about.philosophy_placeholder')}
                  rows={3}
                />
              </Flex>

              <Divider />

              {/* Contact Information */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.profile.contact_information')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                  <TextField
                    label={t('about.email_contact_label')}
                    value={formData.emailContact}
                    onChange={(e) => handleInputChange('emailContact', e.target.value)}
                    type="email"
                    placeholder={t('about.email_contact_placeholder')}
                    flex="1"
                  />
                </Flex>
              </Flex>

              <Divider />

              {/* Social Links */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.social_links')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                  <TextField
                    label={t('about.linkedin_url_label')}
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    type="url"
                    placeholder={t('about.linkedin_url_placeholder')}
                    flex="1"
                  />
                  <TextField
                    label={t('about.github_url_label')}
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    type="url"
                    placeholder={t('about.github_url_placeholder')}
                    flex="1"
                  />
                </Flex>

                <TextField
                  label={t('about.twitter_url_label')}
                  value={formData.twitterUrl}
                  onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                  type="url"
                  placeholder={t('about.twitter_url_placeholder')}
                />
              </Flex>

              <Divider />

              {/* Flags */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.flags')}
                </Text>
                
                {formData.flags.length > 0 && (
                  <Flex direction="row" gap="small" wrap="wrap">
                    {formData.flags.map((flag, index) => (
                      <Badge
                        key={index}
                        variation="info"
                        style={{ 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => {
                          const newFlags = formData.flags.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, flags: newFlags }));
                        }}
                      >
                        {flag}
                        <X size={12} />
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Flex>

              <Divider />

              {/* Botones de acción */}
              <Flex 
                direction={{ base: 'column', medium: 'row' }}
                justifyContent="space-between" 
                gap="medium"
              >
                <Button
                  onClick={() => router.push(getLocalizedPath('/admin/about'))}
                  disabled={isSaving}
                  style={{
                    backgroundColor: 'transparent',
                    color: isDark ? '#CBD5E1' : '#64748B',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  {t('about.cancel')}
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving || !formData.name.trim() || !formData.currentPosition.trim()}
                  style={{
                    backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.75rem 1.5rem',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: (isSaving || !formData.name.trim() || !formData.currentPosition.trim()) ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    minWidth: '160px'
                  }}
                >
                  <Save size={16} />
                  {isSaving ? t('about.saving') : t('about.save_changes')}
                </Button>
              </Flex>
              </Flex>
            </form>
          </Flex>
        </Card>
      </View>
    </>
  );
}

export default EditProfileClient;
