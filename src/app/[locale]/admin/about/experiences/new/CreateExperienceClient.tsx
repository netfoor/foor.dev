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
  Divider,
  CheckboxField
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
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from '../../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';

// Estilos personalizados para el formulario
const createExperienceStyles = `
  .create-experience-form .amplify-field {
    margin-bottom: 1rem;
  }
  
  .create-experience-form .amplify-field > label {
    color: var(--form-label-color) !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
    font-size: 0.95rem !important;
  }
  
  .create-experience-form .amplify-input,
  .create-experience-form .amplify-textarea {
    background-color: var(--form-input-background) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-color) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.95rem !important;
    transition: all 0.2s ease !important;
  }
  
  .create-experience-form .amplify-input:focus,
  .create-experience-form .amplify-textarea:focus {
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

interface ExperienceFormData {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  website: string;
  technologies: string[];
}

interface CreateExperienceClientProps {
  locale: SupportedLocale;
}

function CreateExperienceClient({ locale }: CreateExperienceClientProps): React.JSX.Element {  
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();

  // Estados para el formulario
  const [formData, setFormData] = useState<ExperienceFormData>({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    website: '',
    technologies: []
  });

  // Estados para archivo de imagen
  const [companyImage, setCompanyImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Estados de la UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [techInput, setTechInput] = useState('');

  // Manejadores de formulario
  const handleInputChange = (field: keyof ExperienceFormData, value: string | boolean | string[]) => {
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

  // Remover imagen
  const removeImage = useCallback(() => {
    setCompanyImage(null);
    setImagePreview('');
  }, []);

  // Agregar tecnología
  const addTechnology = useCallback(() => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  }, [techInput, formData.technologies]);

  // Remover tecnología
  const removeTechnology = useCallback((tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
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

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let imageKey: string | undefined;

      // Subir imagen si existe
      if (companyImage) {
        imageKey = await uploadImageToS3(companyImage);
      }

      // Crear la experiencia en DynamoDB
      const response = await client.models.Experiences.create({
        company: formData.company.trim(),
        position: formData.position.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.current ? undefined : formData.endDate,
        location: formData.location.trim() || undefined,
      }, {
        authMode: 'userPool'
      });

      if (response.data) {
        console.log('✅ Experience created successfully:', response.data);
        setSuccess(t('about.experiences.created_successfully'));
        
        // Redirect después de un delay
        setTimeout(() => {
          router.push(getLocalizedPath('/admin/about'));
        }, 2000);
      }
    } catch (createError) {
      console.error('❌ Error creating experience:', createError);
      setError(`${t('about.experiences.error_creating')}: ${createError instanceof Error ? createError.message : t('about.unknown_error')}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Insertar estilos en el DOM
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = createExperienceStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <View padding="large" className="create-experience-form">
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
            <Heading level={2}>{t('about.experiences.create')}</Heading>
            <Text color="font.tertiary">{t('about.experiences.create_description')}</Text>
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
                
                {!imagePreview ? (
                  <div className="image-upload-container" onClick={() => document.getElementById('company-image-input')?.click()}>
                    <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <Text fontSize="medium" color="font.secondary" marginBottom="small">
                      {t('about.experiences.click_to_upload_logo')}
                    </Text>
                    <Text fontSize="small" color="font.tertiary">
                      {t('about.experiences.logo_requirements')}
                    </Text>
                  </div>
                ) : (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Company logo preview" />
                    <button
                      type="button"
                      className="image-remove-button"
                      onClick={removeImage}
                      title={t('about.experiences.remove_logo')}
                    >
                      <X size={16} />
                    </button>
                  </div>
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
                  {t('about.experiences.basic_information')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                  <TextField
                    label={t('about.experiences.company')}
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    required
                    placeholder={t('about.experiences.company_placeholder')}
                    flex="1"
                  />
                  <TextField
                    label={t('about.experiences.position')}
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    required
                    placeholder={t('about.experiences.position_placeholder')}
                    flex="1"
                  />
                </Flex>

                <TextAreaField
                  label={t('about.experiences.description')}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('about.experiences.description_placeholder')}
                  rows={4}
                />

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                  <TextField
                    label={t('about.experiences.location')}
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder={t('about.experiences.location_placeholder')}
                    flex="1"
                  />
                  <TextField
                    label={t('about.experiences.website')}
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    type="url"
                    placeholder={t('about.experiences.website_placeholder')}
                    flex="1"
                  />
                </Flex>
              </Flex>

              <Divider />

              {/* Dates */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.experiences.employment_period')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                  <TextField
                    label={t('about.experiences.start_date')}
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    type="date"
                    required
                    flex="1"
                  />
                  <TextField
                    label={t('about.experiences.end_date')}
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    type="date"
                    isDisabled={formData.current}
                    flex="1"
                  />
                </Flex>

                <CheckboxField
                  label={t('about.experiences.current_position')}
                  name="current"
                  value="current"
                  checked={formData.current}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    handleInputChange('current', isChecked);
                    if (isChecked) {
                      handleInputChange('endDate', '');
                    }
                  }}
                />
              </Flex>

              <Divider />

              {/* Technologies */}
              <Flex direction="column" gap="medium">
                <Text fontSize="large" fontWeight="semibold">
                  {t('about.experiences.technologies')}
                </Text>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="medium" alignItems="flex-end">
                  <TextField
                    label={t('about.experiences.add_technology')}
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder={t('about.experiences.technology_placeholder')}
                    flex="1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnology();
                      }
                    }}
                  />
                  <Button
                    variation="primary"
                    onClick={addTechnology}
                    isDisabled={!techInput.trim()}
                  >
                    {t('about.experiences.add')}
                  </Button>
                </Flex>

                {formData.technologies.length > 0 && (
                  <Flex direction="row" gap="small" wrap="wrap">
                    {formData.technologies.map((tech, index) => (
                      <Badge
                        key={index}
                        variation="info"
                        style={{ 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => removeTechnology(tech)}
                      >
                        {tech}
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
                  isDisabled={isLoading}
                >
                  {t('about.experiences.cancel')}
                </Button>
                <Button 
                  type="submit"
                  variation="primary"
                  isLoading={isLoading}
                  loadingText={t('about.experiences.creating')}
                >
                  <Flex alignItems="center" gap="xs">
                    <Save size={16} />
                    {t('about.experiences.create_experience')}
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

export default CreateExperienceClient;
