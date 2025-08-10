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
  Divider,
  Image
} from '@aws-amplify/ui-react';
import { 
  ArrowLeft, 
  Save, 
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
// Replace storage imports with getUrl only and use helpers
import { getUrl } from 'aws-amplify/storage';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';
import S3Cleanup from '@/lib/utils/s3-cleanup';
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
  .edit-experience-form .amplify-textarea,
  .edit-experience-form .amplify-select select {
    background-color: var(--form-input-bg) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-text) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.9rem !important;
  }
  
  .edit-experience-form .amplify-input::placeholder,
  .edit-experience-form .amplify-textarea::placeholder {
    color: var(--form-placeholder-color) !important;
    opacity: 0.8 !important;
    font-weight: 400 !important;
  }
  
  .edit-experience-form .amplify-input:focus,
  .edit-experience-form .amplify-textarea:focus,
  .edit-experience-form .amplify-select select:focus {
    border-color: var(--form-focus-border) !important;
    box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
    outline: none !important;
  }
  
  .edit-experience-form .amplify-field-group__control .amplify-field__description {
    color: var(--form-description-color) !important;
    font-size: 0.8rem !important;
    margin-top: 0.25rem !important;
    font-weight: 500 !important;
  }

  .edit-experience-form .amplify-select select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.65rem;
    padding-right: 2.5rem !important;
  }

  .edit-experience-form .input-with-button-container {
    display: flex;
    gap: 0.75rem;
    align-items: end;
    margin-bottom: 1rem;
  }

  .edit-experience-form .input-wrapper {
    flex: 1;
  }

  .edit-experience-form .add-button {
    flex-shrink: 0;
    min-width: 120px;
  }

  .edit-experience-form .badges-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .edit-experience-form .image-remove-button {
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

  .edit-experience-form .image-remove-button:hover {
    background-color: rgba(239, 68, 68, 1) !important;
    transform: scale(1.1) !important;
  }

  /* Responsive design improvements */
  @media (max-width: 768px) {
    .edit-experience-form .input-with-button-container {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 0.5rem !important;
    }
    
    .edit-experience-form .add-button {
      width: 100% !important;
      min-width: auto !important;
    }
    
    .edit-experience-form .amplify-flex {
      flex-direction: column !important;
    }
    
    .edit-experience-form .amplify-button {
      width: 100% !important;
      margin-top: 0.5rem !important;
    }

    .edit-experience-form .image-remove-button {
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
      await S3Cleanup.deleteSingleFile(experience.photoKey);
      setCurrentImageUrl('');
      console.log('✅ Current image removed from S3 (including WEBP if exists)');
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
      let photoKey = experience?.photoKey || undefined;

      // Si hay una nueva imagen, subirla con metadatos para optimización
      if (companyImage) {
        // Remover imagen anterior si existe (original + webp)
        if (experience?.photoKey) {
          try { await S3Cleanup.deleteSingleFile(experience.photoKey); } catch {}
        }
        photoKey = await uploadImageWithMetadata(companyImage, experienceId, 'Experiences', 'photoKey');
        // Preview ya fue seteado por FileReader
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



  if (isLoading) {
    return (
      <View padding="2rem" textAlign="center">
        <Loader size="large" />
        <Text>{t('about.experiences.loading')}</Text>
      </View>
    );
  }

  return (
    <>
      <style>{editExperienceStyles}</style>
      <View padding="2rem" className="edit-experience-form">
        <Button 
          onClick={() => router.back()} 
          variation="link" 
          size="small"
          marginBottom="1rem"
        >
          <ArrowLeft size={16} style={{ marginRight: 8 }} />
          {t('common.back')}
        </Button>
        
        <Card padding="2rem" borderRadius="8px" boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)">
          <Heading level={3} marginBottom="1.5rem">
            {t('about.experiences.edit_experience')}
          </Heading>
          
          {error && (
            <Alert variation="error" marginBottom="1rem">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variation="success" marginBottom="1rem">
              {success}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Flex direction={{ base: 'column', medium: 'row' }} gap="1.5rem">
              <Flex direction="column" flex="1">
                <TextField
                  label={t('about.experiences.company')}
                  placeholder={t('about.experiences.company_placeholder')}
                  value={formData.company}
                  onChange={e => handleInputChange('company', e.target.value)}
                  required
                />
                
                <TextField
                  label={t('about.experiences.position')}
                  placeholder={t('about.experiences.position_placeholder')}
                  value={formData.position}
                  onChange={e => handleInputChange('position', e.target.value)}
                  required
                />
                
                <TextAreaField
                  label={t('about.experiences.description')}
                  placeholder={t('about.experiences.description_placeholder')}
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  resize="vertical"
                  marginTop="0.5rem"
                />
                
                <Flex gap="1rem" marginTop="0.5rem">
                  <TextField
                    label={t('about.experiences.start_date')}
                    placeholder={t('about.experiences.start_date_placeholder')}
                    type="date"
                    value={formData.startDate}
                    onChange={e => handleInputChange('startDate', e.target.value)}
                    required
                  />
                  
                  <TextField
                    label={t('about.experiences.end_date')}
                    placeholder={t('about.experiences.end_date_placeholder')}
                    type="date"
                    value={formData.endDate}
                    onChange={e => handleInputChange('endDate', e.target.value)}
                  />
                </Flex>
                
                <TextField
                  label={t('about.experiences.location')}
                  placeholder={t('about.experiences.location_placeholder')}
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  marginTop="0.5rem"
                />
              </Flex>
              
              <Flex direction="column" flex="1">
                <Text fontWeight="500" marginBottom="0.5rem" color="var(--form-label-color)">
                  {t('about.experiences.skills')}
                </Text>
                
                <Flex gap="0.5rem" className="badges-container" marginBottom="1rem">
                  {formData.skills.map(skill => (
                    <Badge 
                      key={skill} 
                      variation="info" 
                      onClick={() => removeSkill(skill)}
                      style={{ cursor: 'pointer' }}
                    >
                      {skill}
                    </Badge>
                  ))}
                  
                  <Flex gap="0.5rem" alignItems="center" className="input-with-button-container">
                    <TextField
                      label={t('about.experiences.add_skill')}
                      labelHidden
                      placeholder={t('about.experiences.add_skill')}
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' ? addSkill() : null}
                      size="small"
                      flex="1"
                    />
                    
                    <Button 
                      onClick={addSkill} 
                      variation="primary" 
                      size="small"
                      className="add-button"
                    >
                      {t('common.add')}
                    </Button>
                  </Flex>
                </Flex>
                
                <Text fontWeight="500" marginBottom="0.5rem" color="var(--form-label-color)">
                  {t('about.experiences.activities')}
                </Text>
                
                <Flex gap="0.5rem" className="badges-container" marginBottom="1rem">
                  {formData.activities.map(activity => (
                    <Badge 
                      key={activity} 
                      variation="info" 
                      onClick={() => removeActivity(activity)}
                      style={{ cursor: 'pointer' }}
                    >
                      {activity}
                    </Badge>
                  ))}
                  
                  <Flex gap="0.5rem" alignItems="center" className="input-with-button-container">
                    <TextField
                      label={t('about.experiences.add_activity')}
                      labelHidden
                      placeholder={t('about.experiences.add_activity')}
                      value={activityInput}
                      onChange={e => setActivityInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' ? addActivity() : null}
                      size="small"
                      flex="1"
                    />
                    
                    <Button 
                      onClick={addActivity} 
                      variation="primary" 
                      size="small"
                      className="add-button"
                    >
                      {t('common.add')}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            
            <Divider margin="1.5rem 0" />
            
            <Flex direction={{ base: 'column', medium: 'row' }} gap="1.5rem">
              <Flex direction="column" flex="1">
                <Text fontWeight="500" marginBottom="0.5rem" color="var(--form-label-color)">
                  {t('about.experiences.current_image')}
                </Text>
                
                {currentImageUrl ? (
                  <Flex direction="column" gap="0.5rem">
                    <Image 
                      src={currentImageUrl} 
                      alt={t('about.experiences.current_image_alt')}
                      width={120}
                      height={80}
                      style={{ borderRadius: '8px', objectFit: 'cover' }}
                    />
                    
                    <Button 
                      onClick={removeCurrentImage} 
                      variation="destructive" 
                      size="small"
                      width="fit-content"
                    >
                      <X size={16} style={{ marginRight: 6 }} />
                      {t('about.experiences.remove_current_image')}
                    </Button>
                  </Flex>
                ) : (
                  <Text color="var(--form-placeholder-color)" fontSize="0.875rem">
                    {t('about.experiences.no_current_image')}
                  </Text>
                )}
              </Flex>
              
              <Flex direction="column" flex="1">
                <Text fontWeight="500" marginBottom="0.5rem" color="var(--form-label-color)">
                  {t('about.experiences.new_image')}
                </Text>
                
                {imagePreview ? (
                  <Flex direction="column" gap="0.5rem">
                    <Image 
                      src={imagePreview} 
                      alt={t('about.experiences.new_image_preview')}
                      width={120}
                      height={80}
                      style={{ borderRadius: '8px', objectFit: 'cover' }}
                    />
                    
                    <Button 
                      onClick={removeNewImage} 
                      variation="destructive" 
                      size="small"
                      width="fit-content"
                    >
                      <X size={16} style={{ marginRight: 6 }} />
                      {t('about.experiences.remove_new_image')}
                    </Button>
                  </Flex>
                ) : (
                  <label style={{ display: 'inline-block', width: 'fit-content' }}>
                    <Button 
                      variation="primary" 
                      size="small"
                    >
                      {t('about.experiences.upload_image')}
                    </Button>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </Flex>
            </Flex>
            
            <Divider margin="1.5rem 0" />
            
            <Flex justifyContent="flex-end" gap="1rem">
              <Button 
                onClick={() => router.back()} 
                variation="link" 
                size="large"
              >
                {t('common.cancel')}
              </Button>
              
              <Button 
                type="submit" 
                variation="primary" 
                size="large"
                isLoading={isSaving}
              >
                {t('common.save')}
              </Button>
            </Flex>
          </form>
        </Card>
      </View>
    </>
  );
}

export default EditExperienceClient;