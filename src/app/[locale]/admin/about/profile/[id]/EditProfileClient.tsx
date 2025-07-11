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
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
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
  .edit-profile-form .amplify-textarea {
    background-color: var(--form-input-background) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-color) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.95rem !important;
    transition: all 0.2s ease !important;
  }
  
  .edit-profile-form .amplify-input:focus,
  .edit-profile-form .amplify-textarea:focus {
    border-color: var(--amplify-colors-brand-primary-80) !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
    outline: none !important;
  }

  .image-upload-container {
    border: 2px dashed var(--form-input-border);
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--form-input-background);
  }

  .image-upload-container:hover {
    border-color: var(--amplify-colors-brand-primary-80);
    background-color: var(--amplify-colors-brand-primary-10);
  }

  .image-preview {
    position: relative;
    display: inline-block;
    margin-top: 1rem;
  }

  .image-preview img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    object-fit: cover;
  }

  .image-remove-button {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .image-remove-button:hover {
    background-color: rgba(239, 68, 68, 1);
    transform: scale(1.1);
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
      const normalizedPath = profile.profilePhotoKey.startsWith('public/') 
        ? profile.profilePhotoKey.slice(7) 
        : profile.profilePhotoKey;
      
      await remove({
        path: normalizedPath,
      });

      setCurrentImageUrl('');
      console.log('✅ Current image removed from S3');
    } catch (removeError) {
      console.warn('Could not remove current image from S3:', removeError);
    }
  }, [profile?.profilePhotoKey]);

  // Subir imagen a S3
  const uploadImageToS3 = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `about/profiles/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    try {
      const result = await uploadData({
        path: fileName,
        data: file,
        options: {
          contentType: file.type,
        }
      }).result;

      console.log('✅ Image uploaded to S3:', result.path);
      return fileName;
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
        console.log('✅ Profile updated successfully:', response.data);
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

  // Insertar estilos en el DOM
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = editProfileStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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

  return (
    <View padding="large" className="edit-profile-form">
      <Flex direction="column" gap="large" maxWidth="800px">
        {/* Header */}
        <Flex alignItems="center" gap="medium">
          <Button
            variation="link"
            onClick={() => router.push(getLocalizedPath('/admin/about'))}
            size="small"
          >
            <ArrowLeft size={16} />
          </Button>
          <View>
            <Heading level={2}>{t('about.profile.edit')}</Heading>
            <Text color="font.tertiary">{t('about.profile.edit_description')}</Text>
          </View>
        </Flex>

        {/* Alerts */}
        {error && (
          <Alert variation="error" isDismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variation="success">
            {success}
          </Alert>
        )}

        {/* Form */}
        <Card padding="large">
          <form onSubmit={handleSubmit}>
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
                    label={t('about.profile.name')}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder={t('about.profile.name_placeholder')}
                    flex="1"
                  />
                  <TextField
                    label={t('about.profile.position')}
                    value={formData.currentPosition}
                    onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                    required
                    placeholder={t('about.profile.position_placeholder')}
                    flex="1"
                  />
                </Flex>

                <TextAreaField
                  label={t('about.profile.description')}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('about.profile.description_placeholder')}
                  rows={4}
                />

                <TextAreaField
                  label={t('about.profile.mission')}
                  value={formData.mission}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  placeholder={t('about.profile.mission_placeholder')}
                  rows={3}
                />

                <TextAreaField
                  label={t('about.profile.vision')}
                  value={formData.vision}
                  onChange={(e) => handleInputChange('vision', e.target.value)}
                  placeholder={t('about.profile.vision_placeholder')}
                  rows={3}
                />

                <TextAreaField
                  label={t('about.profile.philosophy')}
                  value={formData.philosophy}
                  onChange={(e) => handleInputChange('philosophy', e.target.value)}
                  placeholder={t('about.profile.philosophy_placeholder')}
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
                    label={t('about.profile.email')}
                    value={formData.emailContact}
                    onChange={(e) => handleInputChange('emailContact', e.target.value)}
                    type="email"
                    placeholder={t('about.profile.email_placeholder')}
                    flex="1"
                  />
                </Flex>
              </Flex>

              <Divider />

              {/* Social Links */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.profile.social_links')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                  <TextField
                    label={t('about.profile.linkedin')}
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    type="url"
                    placeholder={t('about.profile.linkedin_placeholder')}
                    flex="1"
                  />
                  <TextField
                    label={t('about.profile.github')}
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    type="url"
                    placeholder={t('about.profile.github_placeholder')}
                    flex="1"
                  />
                </Flex>

                <TextField
                  label={t('about.profile.twitter')}
                  value={formData.twitterUrl}
                  onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                  type="url"
                  placeholder={t('about.profile.twitter_placeholder')}
                />
              </Flex>

              <Divider />

              {/* Flags */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.profile.flags')}
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

              {/* Submit Buttons */}
              <Flex direction={{ base: 'column', medium: 'row' }} gap="medium" justifyContent="flex-end">
                <Button
                  variation="link"
                  onClick={() => router.push(getLocalizedPath('/admin/about'))}
                  isDisabled={isSaving}
                >
                  {t('about.profile.cancel')}
                </Button>
                <Button 
                  type="submit"
                  variation="primary"
                  isLoading={isSaving}
                  loadingText={t('about.profile.updating')}
                >
                  <Flex alignItems="center" gap="xs">
                    <Save size={16} />
                    {t('about.profile.update_profile')}
                  </Flex>
                </Button>
              </Flex>
            </Flex>
          </form>
        </Card>
      </Flex>
    </View>
  );
}

export default EditProfileClient;
