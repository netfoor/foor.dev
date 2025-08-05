'use client';

import React, { useState, useCallback } from 'react';
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
  Divider
} from '@aws-amplify/ui-react';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  X,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from '../../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';

// Estilos personalizados para el formulario
const createProfileStyles = `
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
  .create-profile-form .amplify-textarea {
    background-color: var(--form-input-background) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-color) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.95rem !important;
    transition: all 0.2s ease !important;
  }
  
  .create-profile-form .amplify-input:focus,
  .create-profile-form .amplify-textarea:focus {
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
}

interface CreateProfileClientProps {
  locale: SupportedLocale;
}

function CreateProfileClient({ locale }: CreateProfileClientProps): React.JSX.Element {  
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();

  // Estados para el formulario
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
    flags: []
  });

  // Estados para archivo de imagen
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Estados de la UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Manejadores de formulario
  const handleInputChange = (field: keyof ProfileFormData, value: string | string[]) => {
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

  // Remover imagen
  const removeImage = useCallback(() => {
    setProfileImage(null);
    setImagePreview('');
  }, []);

  // Subir imagen a S3
  const uploadImageToS3 = async (file: File, profileId: string): Promise<string> => {
    try {
      // Usar el helper que agrega metadatos para Lambda
      return await uploadImageWithMetadata(
        file,
        profileId,
        'Profile',
        'profilePhotoKey'
      );
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

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Primero crear el perfil sin imagen
      const response = await client.models.Profile.create({
        name: formData.name.trim(),
        currentPosition: formData.currentPosition.trim(),
        description: formData.description.trim(),
        mission: formData.mission.trim() || undefined,
        vision: formData.vision.trim() || undefined,
        philosophy: formData.philosophy.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        githubUrl: formData.githubUrl.trim() || undefined,
        twitterUrl: formData.twitterUrl.trim() || undefined,
        emailContact: formData.emailContact.trim() || undefined,
        flags: formData.flags.length > 0 ? formData.flags : undefined,
        isActive: true, // Marcar como activo por defecto
      }, {
        authMode: 'userPool'
      });

      if (!response.data) {
        throw new Error(t('about.profile.error_creating'));
      }
      
      const profileId = response.data.id;

      // Subir imagen si existe
      if (profileImage && profileId) {
        const profilePhotoKey = await uploadImageToS3(profileImage, profileId);
        
        // Actualizar el perfil con la clave de imagen
        await client.models.Profile.update({
          id: profileId,
          profilePhotoKey
        }, {
          authMode: 'userPool'
        });
      }

      if (response.data) {
        console.log('✅ Profile created successfully:', response.data);
        setSuccess(t('about.profile.created_successfully'));
        
        // Redirect después de un delay
        setTimeout(() => {
          router.push(getLocalizedPath('/admin/about'));
        }, 2000);
      }
    } catch (createError) {
      console.error('❌ Error creating profile:', createError);
      setError(`${t('about.profile.error_creating')}: ${createError instanceof Error ? createError.message : t('about.unknown_error')}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Insertar estilos en el DOM
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = createProfileStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <View padding="large" className="create-profile-form">
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
            <Heading level={2}>{t('about.profile.create')}</Heading>
            <Text color="font.tertiary">{t('about.profile.create_description')}</Text>
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
                
                {!imagePreview ? (
                  <div className="image-upload-container" onClick={() => document.getElementById('profile-image-input')?.click()}>
                    <User size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <Text fontSize="medium" color="font.secondary" marginBottom="small">
                      {t('about.profile.click_to_upload_image')}
                    </Text>
                    <Text fontSize="small" color="font.tertiary">
                      {t('about.profile.image_requirements')}
                    </Text>
                  </div>
                ) : (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Profile preview" />
                    <button
                      type="button"
                      className="image-remove-button"
                      onClick={removeImage}
                      title={t('about.profile.remove_image')}
                    >
                      <X size={16} />
                    </button>
                  </div>
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
                    label={t('about.profile.current_position')}
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
                  required
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

                <TextField
                  label={t('about.profile.email_contact')}
                  value={formData.emailContact}
                  onChange={(e) => handleInputChange('emailContact', e.target.value)}
                  type="email"
                  placeholder={t('about.profile.email_placeholder')}
                />
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
                    placeholder={t('about.profile.linkedin_placeholder')}
                    flex="1"
                  />
                  <TextField
                    label={t('about.profile.github')}
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    placeholder={t('about.profile.github_placeholder')}
                    flex="1"
                  />
                </Flex>

                <TextField
                  label={t('about.profile.twitter')}
                  value={formData.twitterUrl}
                  onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                  placeholder={t('about.profile.twitter_placeholder')}
                />
              </Flex>

              <Divider />

              {/* Submit Buttons */}
              <Flex direction={{ base: 'column', medium: 'row' }} gap="medium" justifyContent="flex-end">
                <Button
                  variation="link"
                  onClick={() => router.push(getLocalizedPath('/admin/about'))}
                  isDisabled={isLoading}
                >
                  {t('about.profile.cancel')}
                </Button>
                <Button 
                  type="submit"
                  variation="primary"
                  isLoading={isLoading}
                  loadingText={t('about.profile.creating')}
                >
                  <Flex alignItems="center" gap="xs">
                    <Save size={16} />
                    {t('about.profile.create_profile')}
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

export default CreateProfileClient;
