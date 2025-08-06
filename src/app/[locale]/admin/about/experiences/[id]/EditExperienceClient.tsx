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
  Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';

// Estilos personalizados para el formulario
const editExperienceStyles = `
  .edit-experience-form .amplify-field {
    margin-bottom: 1rem;
  }
  
  .edit-experience-form .amplify-field > label {
    color: var(--form-label-color) !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
    font-size: 0.95rem !important;
  }
  
  .edit-experience-form .amplify-input,
  .edit-experience-form .amplify-textarea {
    background-color: var(--form-input-background) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-color) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.95rem !important;
    transition: all 0.2s ease !important;
  }
  
  .edit-experience-form .amplify-input:focus,
  .edit-experience-form .amplify-textarea:focus {
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
    max-width: 150px;
    max-height: 150px;
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

type Experience = Schema["Experiences"]["type"];

interface ExperienceFormData {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  skills: string[];
  activities: string[];
}

interface EditExperienceClientProps {
  locale: SupportedLocale;
  experienceId: string;
}

function EditExperienceClient({ locale, experienceId }: EditExperienceClientProps): React.JSX.Element {  
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();

  // Estados para el formulario
  const [experience, setExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    skills: [],
    activities: []
  });

  // Estados para archivos de imagen
  const [companyImage, setCompanyImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  // Estados de la UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [skillInput, setSkillInput] = useState('');
  const [activityInput, setActivityInput] = useState('');

  // Cargar datos de la experiencia
  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await client.models.Experiences.get({ 
          id: experienceId 
        }, {
          authMode: 'userPool'
        });

        if (response.data) {
          const experienceData = response.data;
          setExperience(experienceData);
          
          // Llenar el formulario con los datos existentes
          setFormData({
            company: experienceData.company || '',
            position: experienceData.position || '',
            description: experienceData.description || '',
            startDate: experienceData.startDate || '',
            endDate: experienceData.endDate || '',
            location: experienceData.location || '',
            skills: (experienceData.skills || []).filter((skill): skill is string => skill !== null),
            activities: (experienceData.activities || []).filter((activity): activity is string => activity !== null)
          });

          // Cargar imagen actual si existe
          if (experienceData.photoKey) {
            try {
              const normalizedPath = experienceData.photoKey.startsWith('public/') 
                ? experienceData.photoKey.slice(7) 
                : experienceData.photoKey;
              
              const url = await getUrl({
                path: normalizedPath,
              });
              setCurrentImageUrl(url.url.toString());
            } catch (imgError) {
              console.warn('Could not load current image:', imgError);
            }
          }
        } else {
          setError(t('about.experiences.not_found'));
        }
      } catch (fetchError) {
        console.error('Error fetching experience:', fetchError);
        setError(t('about.experiences.error_loading'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperience();
  }, [experienceId, t]);

  // Manejadores de formulario
  const handleInputChange = (field: keyof ExperienceFormData, value: string | string[]) => {
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
        setError(t('about.experiences.image_too_large'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError(t('about.experiences.invalid_image_format'));
        return;
      }

      setCompanyImage(file);
      
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
    setCompanyImage(null);
    setImagePreview('');
  }, []);

  // Remover imagen actual
  const removeCurrentImage = useCallback(async () => {
    if (!experience?.photoKey) return;

    try {
      const normalizedPath = experience.photoKey.startsWith('public/') 
        ? experience.photoKey.slice(7) 
        : experience.photoKey;
      
      await remove({
        path: normalizedPath,
      });

      setCurrentImageUrl('');
      console.log('✅ Current image removed from S3');
    } catch (removeError) {
      console.warn('Could not remove current image from S3:', removeError);
    }
  }, [experience?.photoKey]);

  // Agregar habilidad
  const addSkill = useCallback(() => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  }, [skillInput, formData.skills]);

  // Remover habilidad
  const removeSkill = useCallback((skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  }, []);

  // Agregar actividad
  const addActivity = useCallback(() => {
    if (activityInput.trim() && !formData.activities.includes(activityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        activities: [...prev.activities, activityInput.trim()]
      }));
      setActivityInput('');
    }
  }, [activityInput, formData.activities]);

  // Remover actividad
  const removeActivity = useCallback((activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a !== activity)
    }));
  }, []);

  // Subir imagen a S3
  const uploadImageToS3 = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `about/experiences/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

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
      throw new Error(t('about.experiences.error_uploading_image'));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company.trim() || !formData.position.trim() || !formData.startDate) {
      setError(t('about.experiences.required_fields_missing'));
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      let photoKey = experience?.photoKey;

      // Si hay una nueva imagen, subirla
      if (companyImage) {
        // Remover imagen anterior si existe
        if (experience?.photoKey) {
          await removeCurrentImage();
        }
        photoKey = await uploadImageToS3(companyImage);
      }

      // Si se removió la imagen actual y no hay nueva imagen
      if (!currentImageUrl && !companyImage && experience?.photoKey) {
        photoKey = undefined;
      }

      // Actualizar la experiencia en DynamoDB
      const response = await client.models.Experiences.update({
        id: experienceId,
        company: formData.company.trim(),
        position: formData.position.trim(),
        description: formData.description.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        location: formData.location.trim() || undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        activities: formData.activities.length > 0 ? formData.activities : undefined,
        photoKey: photoKey,
      }, {
        authMode: 'userPool'
      });

      if (response.data) {
        console.log('✅ Experience updated successfully:', response.data);
        setSuccess(t('about.experiences.updated_successfully'));
        
        // Redirect después de un delay
        setTimeout(() => {
          router.push(getLocalizedPath('/admin/about'));
        }, 2000);
      }
    } catch (updateError) {
      console.error('❌ Error updating experience:', updateError);
      setError(`${t('about.experiences.error_updating')}: ${updateError instanceof Error ? updateError.message : t('about.unknown_error')}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Insertar estilos en el DOM
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = editExperienceStyles;
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
          {t('about.experiences.loading')}
        </Text>
      </View>
    );
  }

  if (!experience) {
    return (
      <View padding="large" textAlign="center">
        <Text fontSize="large" color="font.primary">
          {t('about.experiences.not_found')}
        </Text>
      </View>
    );
  }

  return (
    <View padding="large" className="edit-experience-form">
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
            <Heading level={2}>{t('about.edit_experience')}</Heading>
            <Text color="font.tertiary">{t('about.experiences.edit_description')}</Text>
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
              
              {/* Company Logo Upload */}
              <View>
                <Text fontSize="medium" fontWeight="semibold" marginBottom="small">
                  {t('about.experiences.company_logo')}
                </Text>
                
                {/* Current Image */}
                {currentImageUrl && !imagePreview && (
                  <div className="image-preview">
                    <img src={currentImageUrl} alt="Current company logo" />
                    <button
                      type="button"
                      className="image-remove-button"
                      onClick={() => {
                        setCurrentImageUrl('');
                        removeCurrentImage();
                      }}
                      title={t('about.experiences.remove_current_logo')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* New Image Preview */}
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="New company logo preview" />
                    <button
                      type="button"
                      className="image-remove-button"
                      onClick={removeNewImage}
                      title={t('about.experiences.remove_new_logo')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Upload Container */}
                {!currentImageUrl && !imagePreview && (
                  <div className="image-upload-container" onClick={() => document.getElementById('company-image-input')?.click()}>
                    <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <Text fontSize="medium" color="font.secondary" marginBottom="small">
                      {t('about.experiences.click_to_upload_logo')}
                    </Text>
                    <Text fontSize="small" color="font.tertiary">
                      {t('about.experiences.logo_requirements')}
                    </Text>
                  </div>
                )}

                {/* Upload New Image Button */}
                {(currentImageUrl || imagePreview) && (
                  <Button
                    variation="link"
                    onClick={() => document.getElementById('company-image-input')?.click()}
                    marginTop="small"
                  >
                    <Flex alignItems="center" gap="xs">
                      <ImageIcon size={16} />
                      {t('about.experiences.change_logo')}
                    </Flex>
                  </Button>
                )}
                
                <input
                  id="company-image-input"
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
                  {t('about.basic_info')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                  <TextField
                    label={t('about.company_label')}
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    required
                    placeholder={t('about.company_placeholder')}
                    flex="1"
                  />
                  <TextField
                    label={t('about.position_label')}
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    required
                    placeholder={t('about.position_placeholder')}
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

                <TextField
                  label={t('about.location_label')}
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('about.location_placeholder')}
                />
              </Flex>

              <Divider />

              {/* Dates */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.employment_period')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                  <TextField
                    label={t('about.start_date_label')}
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    type="date"
                    required
                    flex="1"
                  />
                  <TextField
                    label={t('about.end_date_label')}
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    type="date"
                    flex="1"
                  />
                </Flex>
              </Flex>

              <Divider />

              {/* Skills */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.skills')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium" alignItems="flex-end">
                  <TextField
                    label={t('about.add_skill')}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder={t('about.skill_placeholder')}
                    flex="1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button
                    variation="primary"
                    onClick={addSkill}
                    isDisabled={!skillInput.trim()}
                  >
                    {t('about.add_skill')}
                  </Button>
                </Flex>

                {formData.skills.length > 0 && (
                  <Flex direction="row" gap="small" wrap="wrap">
                    {formData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variation="info"
                        style={{ 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => removeSkill(skill)}
                      >
                        {skill}
                        <X size={12} />
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Flex>

              <Divider />

              {/* Activities */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.activities')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium" alignItems="flex-end">
                  <TextField
                    label={t('about.add_activity')}
                    value={activityInput}
                    onChange={(e) => setActivityInput(e.target.value)}
                    placeholder={t('about.activity_placeholder')}
                    flex="1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addActivity();
                      }
                    }}
                  />
                  <Button
                    variation="primary"
                    onClick={addActivity}
                    isDisabled={!activityInput.trim()}
                  >
                    {t('about.add_activity')}
                  </Button>
                </Flex>

                {formData.activities.length > 0 && (
                  <Flex direction="row" gap="small" wrap="wrap">
                    {formData.activities.map((activity, index) => (
                      <Badge
                        key={index}
                        variation="warning"
                        style={{ 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => removeActivity(activity)}
                      >
                        {activity}
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
                  {t('about.cancel')}
                </Button>
                <Button 
                  type="submit"
                  variation="primary"
                  isLoading={isSaving}
                  loadingText={t('about.saving')}
                >
                  <Flex alignItems="center" gap="xs">
                    <Save size={16} />
                    {t('about.save_changes')}
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

export default EditExperienceClient;
