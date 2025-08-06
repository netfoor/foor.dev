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
  CheckboxField,
  Badge,
  Alert,
  Divider,
  Heading
} from '@aws-amplify/ui-react';
import '../../../admin.css';
import { 
  ArrowLeft, 
  Save, 
  Briefcase,
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

const CreateExperienceClient: React.FC = () => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    skills: [],
    activities: [],
  });

  const [experienceImage, setExperienceImage] = useState<File | null>(null);
  const [experienceImagePreview, setExperienceImagePreview] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [activityInput, setActivityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleExperienceImageSelect = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede ser mayor a 5MB');
      return;
    }

    setExperienceImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setExperienceImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeExperienceImage = useCallback(() => {
    setExperienceImage(null);
    setExperienceImagePreview(null);
  }, []);

  const addSkill = useCallback(() => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      handleInputChange('skills', [...(formData.skills || []), skillInput.trim()]);
      setSkillInput('');
    }
  }, [skillInput, formData.skills, handleInputChange]);

  const removeSkill = useCallback((skillToRemove: string) => {
    handleInputChange('skills', formData.skills?.filter(skill => skill !== skillToRemove) || []);
  }, [formData.skills, handleInputChange]);

  const addActivity = useCallback(() => {
    if (activityInput.trim() && !formData.activities?.includes(activityInput.trim())) {
      handleInputChange('activities', [...(formData.activities || []), activityInput.trim()]);
      setActivityInput('');
    }
  }, [activityInput, formData.activities, handleInputChange]);

  const removeActivity = useCallback((activityToRemove: string) => {
    handleInputChange('activities', formData.activities?.filter(activity => activity !== activityToRemove) || []);
  }, [formData.activities, handleInputChange]);

  const uploadImage = async (file: File, experienceId: string): Promise<string> => {
    try {
      return await uploadImageWithMetadata(file, experienceId, 'Experiences', 'photoKey');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Error uploading experience image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company.trim()) {
      setError('La empresa es requerida');
      return;
    }

    if (!formData.position.trim()) {
      setError('La posición es requerida');
      return;
    }

    if (!formData.startDate) {
      setError('La fecha de inicio es requerida');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const client = generateClient<Schema>();

      const experienceData = {
        company: formData.company.trim(),
        position: formData.position.trim(),
        description: formData.description?.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.current ? undefined : formData.endDate || undefined,
        location: formData.location?.trim() || undefined,
        skills: formData.skills || [],
        activities: formData.activities || [],
      };

      const createResponse = await client.models.Experiences.create(experienceData);
      
      if (createResponse.errors) {
        throw new Error(createResponse.errors[0].message);
      }

      const experienceId = createResponse.data?.id;
      
      if (!experienceId) {
        throw new Error('Error creando experiencia');
      }

      if (experienceImage) {
        const photoKey = await uploadImage(experienceImage, experienceId);
        await client.models.Experiences.update({
          id: experienceId,
          photoKey
        });
      }

      console.log('✅ Experiencia creada exitosamente:', createResponse.data);
      router.push(getLocalizedPath('/admin/about'));
      
    } catch (err) {
      console.error('Error creating experience:', err);
      setError(`Error creando experiencia: ${err instanceof Error ? err.message : 'Error desconocido'}`);
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
        .create-experience-form .amplify-textarea,
        .create-experience-form .amplify-select select {
          background-color: var(--form-input-bg) !important;
          border: 1px solid var(--form-input-border) !important;
          color: var(--form-input-text) !important;
          border-radius: 6px !important;
          padding: 0.75rem !important;
          font-size: 0.9rem !important;
        }
        
        .create-experience-form .amplify-input::placeholder,
        .create-experience-form .amplify-textarea::placeholder {
          color: var(--form-placeholder-color) !important;
          opacity: 0.8 !important;
          font-weight: 400 !important;
        }
        
        .create-experience-form .amplify-input:focus,
        .create-experience-form .amplify-textarea:focus,
        .create-experience-form .amplify-select select:focus {
          border-color: var(--form-focus-border) !important;
          box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
          outline: none !important;
        }
        
        .create-experience-form .amplify-field-group__control .amplify-field__description {
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
            {t('about.create_experience')}
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
      <form onSubmit={handleSubmit} className="create-experience-form">
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
                {t('about.experience_info')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <Flex direction={{ base: 'column', medium: 'row' }} gap="1rem">
                  <TextField
                    label={`${t('about.company_label')} *`}
                    placeholder={t('about.company_placeholder')}
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    required
                  />

                  <TextField
                    label={`${t('about.position_label')} *`}
                    placeholder={t('about.position_placeholder')}
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    required
                  />
                </Flex>

                <TextAreaField
                  label={t('about.description_label')}
                  placeholder={t('about.description_placeholder')}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />

                <TextField
                  label={t('about.location_label')}
                  placeholder={t('about.location_placeholder')}
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </Flex>
            </View>
          </Card>

          {/* Fechas */}
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
                {t('about.employment_period')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <Flex direction={{ base: 'column', medium: 'row' }} gap="1rem">
                  <TextField
                    label={`${t('about.start_date_label')} *`}
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />

                  <TextField
                    label={t('about.end_date_label')}
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    isDisabled={formData.current}
                  />
                </Flex>

                <CheckboxField
                  label={t('about.current_position')}
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
            </View>
          </Card>

          {/* Foto de Experiencia */}
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
                {t('about.experience_photo')}
              </Heading>

              {experienceImagePreview ? (
                <View>
                  <Text fontSize="0.875rem" marginBottom="0.5rem" style={{
                    color: mode === 'dark' ? '#CBD5E1' : '#64748B'
                  }}>
                    {t('about.current_image')}:
                  </Text>
                  <View style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={experienceImagePreview}
                      alt="Experience preview"
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)'
                      }}
                    />
                    <Button
                      onClick={removeExperienceImage}
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
                  onFileSelect={handleExperienceImageSelect}
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
                      <Briefcase size={48} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} style={{ margin: '0 auto 1rem' }} />
                      <Text style={{
                        color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}>
                        {t('about.add_experience_photo')}
                      </Text>
                      <Text style={{
                        color: mode === 'dark' ? '#9CA3AF' : '#6B7280',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem'
                      }}>
                        (máx. 5MB)
                      </Text>
                    </View>
                  </Card>
                </FileUploadInput>
              )}
            </View>
          </Card>

          {/* Habilidades */}
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
                {t('about.skills')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <Flex gap="0.5rem">
                  <TextField
                    label=""
                    placeholder={t('about.skill_placeholder')}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    variation="primary"
                    style={{
                      backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                      alignSelf: 'flex-end'
                    }}
                  >
                    <Plus size={16} />
                    {t('about.add_skill')}
                  </Button>
                </Flex>

                {formData.skills && formData.skills.length > 0 && (
                  <Flex wrap="wrap" gap="0.5rem">
                    {formData.skills.map((skill, index) => (
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
                        {skill}
                        <Button
                          type="button"
                          onClick={() => removeSkill(skill)}
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

          {/* Actividades */}
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
                {t('about.activities')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <Flex gap="0.5rem">
                  <TextField
                    label=""
                    placeholder={t('about.activity_placeholder')}
                    value={activityInput}
                    onChange={(e) => setActivityInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addActivity();
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="button"
                    onClick={addActivity}
                    variation="primary"
                    style={{
                      backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                      alignSelf: 'flex-end'
                    }}
                  >
                    <Plus size={16} />
                    {t('about.add_activity')}
                  </Button>
                </Flex>

                {formData.activities && formData.activities.length > 0 && (
                  <Flex wrap="wrap" gap="0.5rem">
                    {formData.activities.map((activity, index) => (
                      <Badge
                        key={index}
                        style={{
                          backgroundColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                          color: mode === 'dark' ? '#86EFAC' : '#16A34A',
                          border: mode === 'dark' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {activity}
                        <Button
                          type="button"
                          onClick={() => removeActivity(activity)}
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

export default CreateExperienceClient;