'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Button, TextField, TextAreaField, Card, Alert, Loader, SelectField } from '@aws-amplify/ui-react';
import { 
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  GraduationCap,
  Award
} from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';
import S3Cleanup from '@/lib/utils/s3-cleanup';
import { useRouter } from 'next/navigation';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';

// Tipos para la educación
type Education = Schema["Education"]["type"];
type CreateEducationInput = Schema["Education"]["createType"];
type UpdateEducationInput = Schema["Education"]["updateType"];

interface AdminEducationFormClientProps {
  locale: SupportedLocale;
  mode: 'create' | 'edit';
  educationId?: string;
}

const AdminEducationFormClient: React.FC<AdminEducationFormClientProps> = ({ 
  locale, 
  mode, 
  educationId 
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    location: string;
    recognition: string[];
    description: string;
    photoKey: string | null;
  }>({
    degree: '',
    institution: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    location: '',
    recognition: [],
    description: '',
    photoKey: null,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newRecognition, setNewRecognition] = useState('');

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');

  const { mode: themeMode } = useTheme();
  const { t } = useTranslation('admin');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();

  // Client initialization
  const client = generateClient<Schema>();

  // Cargar datos existentes en modo edición
  useEffect(() => {
    if (mode === 'edit' && educationId) {
      loadEducationData();
    }
  }, [mode, educationId]);

  const loadEducationData = async () => {
    try {
      setInitialLoading(true);
      const { data: education } = await client.models.Education.get(
        { id: educationId! }, 
        { authMode: 'userPool' }
      );

      if (education) {
        setFormData({
          degree: education.degree || '',
          institution: education.institution || '',
          fieldOfStudy: education.fieldOfStudy || '',
          startDate: education.startDate || '',
          endDate: education.endDate || '',
          location: education.location || '',
          recognition: (education.recognition || []).filter((rec): rec is string => rec !== null),
          description: education.description || '',
          photoKey: education.photoKey || null,
        });
      }
    } catch (err) {
      console.error('Error cargando datos de educación:', err);
      setError(t('education.error_loading_data'));
    } finally {
      setInitialLoading(false);
    }
  };

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(t('education.image_size_error'));
        return;
      }
      
      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Subir imagen a S3 usando helper común (agrega metadata estándar)
  const uploadImage = async (recordId: string): Promise<string | null> => {
    if (!imageFile) return formData.photoKey;

    try {
  const newKey = await uploadImageWithMetadata(imageFile, recordId, 'Education', 'photoKey');
      return newKey;
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      throw new Error('upload_failed');
    }
  };

  // Agregar reconocimiento
  const handleAddRecognition = () => {
    if (newRecognition.trim()) {
      setFormData(prev => ({
        ...prev,
        recognition: [...prev.recognition, newRecognition.trim()]
      }));
      setNewRecognition('');
    }
  };

  // Remover reconocimiento
  const handleRemoveRecognition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recognition: prev.recognition.filter((_, i) => i !== index)
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.degree.trim() || !formData.institution.trim()) {
      setError(t('education.required_fields_missing'));
      return;
    }

    if (!formData.startDate) {
      setError(t('education.error_start_date_required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const educationData = {
        degree: formData.degree.trim(),
        institution: formData.institution.trim(),
        fieldOfStudy: formData.fieldOfStudy.trim() || null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        location: formData.location.trim() || null,
        recognition: formData.recognition.length > 0 ? formData.recognition : null,
        description: formData.description.trim() || null,
        photoKey: formData.photoKey, // Will be updated after image upload
      };

      if (mode === 'create') {
        const result = await client.models.Education.create(educationData as CreateEducationInput, {
          authMode: 'userPool'
        });
        
        // Upload image with record ID for Lambda processing
        if (imageFile && result.data?.id) {
          const photoKey = await uploadImage(result.data.id);
          // Update record with photo key
          await client.models.Education.update({
            id: result.data.id,
            photoKey
          } as UpdateEducationInput, {
            authMode: 'userPool'
          });
        }
        
  setSuccess(t('education.create_success'));
      } else {
        // Modo edición: si hay nueva imagen, sube primero la nueva y luego intenta eliminar la anterior (best-effort)
        let newPhotoKey = educationData.photoKey;
        if (imageFile) {
          newPhotoKey = await uploadImage(educationId!);
          if (educationData.photoKey) {
            try {
              await S3Cleanup.deleteSingleFile(educationData.photoKey);
            } catch (delErr) {
              console.warn('No se pudo eliminar la imagen anterior de S3 (continuando):', delErr);
            }
          }
        }

        await client.models.Education.update({
          id: educationId!,
          ...educationData,
          photoKey: newPhotoKey
        } as UpdateEducationInput, {
          authMode: 'userPool'
        });
        setSuccess(t('education.update_success'));
      }

      // Redirigir después de un momento
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/education'));
      }, 1500);

    } catch (err) {
      console.error('Error guardando educación:', err);
      setError(mode === 'create' ? t('education.error_creating') : t('education.error_updating'));
    } finally {
      setLoading(false);
    }
  };

  // Estilos dinámicos
  const containerStyles = {
    padding: '2rem',
    minHeight: '100vh',
    background: themeMode === 'dark'
      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)'
      : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.85) 100%)',
  };

  const cardStyles = {
    background: themeMode === 'dark'
      ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: themeMode === 'dark'
      ? '1px solid rgba(148, 163, 184, 0.2)'
      : '1px solid rgba(203, 213, 225, 0.3)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: themeMode === 'dark'
      ? '0 10px 40px rgba(0, 0, 0, 0.3)'
      : '0 10px 40px rgba(0, 0, 0, 0.1)',
  };

  if (initialLoading) {
    return (
      <View style={containerStyles}>
        <Flex direction="column" alignItems="center" gap="1rem">
          <Loader size="large" />
          <Text style={{ color: themeMode === 'dark' ? '#CBD5E1' : '#64748B' }}>
            {t('education.loading')}
          </Text>
        </Flex>
      </View>
    );
  }

  return (
    <View style={containerStyles} data-amplify-theme={themeMode}>
      <View style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <Flex direction="column" gap="2rem" marginBottom="2rem">
          <Flex alignItems="center" gap="1rem">
            <Button
              onClick={() => router.push(getLocalizedPath('/admin/education'))}
              style={{
                background: 'transparent',
                border: themeMode === 'dark' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(203, 213, 225, 0.4)',
                borderRadius: '8px',
                padding: '8px',
                color: themeMode === 'dark' ? '#94A3B8' : '#64748B',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={20} />
            </Button>
      <View>
              <Text 
                as="h1" 
                fontSize="2rem" 
                fontWeight="700"
                style={{ 
                  color: themeMode === 'dark' ? '#F8FAFC' : '#0F172A',
                  marginBottom: '0.5rem'
                }}
              >
        {mode === 'create' ? t('education.header_create') : t('education.header_edit')}
              </Text>
              <Text 
                fontSize="1.125rem"
                style={{ color: themeMode === 'dark' ? '#CBD5E1' : '#64748B' }}
              >
        {mode === 'create' ? t('education.subheader_create') : t('education.subheader_edit')}
              </Text>
            </View>
          </Flex>
        </Flex>

        {/* Alerts */}
        {error && (
          <Alert variation="error" hasIcon marginBottom="1rem">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variation="success" hasIcon marginBottom="1rem">
            {success}
          </Alert>
        )}

        {/* Form */}
        <Card style={cardStyles}>
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="2rem">
              {/* Basic Information */}
              <View>
                <Text 
                  fontSize="1.25rem" 
                  fontWeight="600" 
                  marginBottom="1rem"
                  style={{ 
                    color: themeMode === 'dark' ? '#F8FAFC' : '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <GraduationCap size={20} />
                  {t('education.basic_info')}
                </Text>
                
                <Flex direction="column" gap="1rem">
                  <TextField
                    label={`${t('education.degree')} *`}
                    value={formData.degree}
                    onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder={t('education.degree_placeholder')}
                    descriptiveText={t('education.degree_description')}
                    required
                  />
                  
                  <TextField
                    label={`${t('education.institution')} *`}
                    value={formData.institution}
                    onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder={t('education.institution_placeholder')}
                    descriptiveText={t('education.institution_description')}
                    required
                  />
                  
                  <TextField
                    label={t('education.field')}
                    value={formData.fieldOfStudy}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                    placeholder={t('education.field_placeholder')}
                    descriptiveText={t('education.field_description')}
                  />
                  
                  <TextField
                    label={t('education.location')}
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={t('education.location_placeholder')}
                    descriptiveText={t('education.location_description')}
                  />
                </Flex>
              </View>

              {/* Dates */}
              <View>
                <Text 
                  fontSize="1.25rem" 
                  fontWeight="600" 
                  marginBottom="1rem"
                  style={{ 
                    color: themeMode === 'dark' ? '#F8FAFC' : '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Calendar size={20} />
                  {t('education.study_period')}
                </Text>
                
                <Flex direction={{ base: 'column', medium: 'row' }} gap="1rem">
                  <TextField
                    label={`${t('education.start_date_label')} *`}
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    descriptiveText={t('education.start_date_description')}
                    required
                  />
                  
                  <TextField
                    label={t('education.end_date_label')}
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    descriptiveText={t('education.end_date_description')}
                  />
                </Flex>
              </View>

              {/* Recognition */}
        <View>
                <Text 
                  fontSize="1.25rem" 
                  fontWeight="600" 
                  marginBottom="1rem"
                  style={{ 
                    color: themeMode === 'dark' ? '#F8FAFC' : '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Award size={20} />
          {t('education.recognitions')}
                </Text>
                
                <Flex direction="column" gap="1rem">
                  <Flex gap="0.5rem">
                    <TextField
            label={t('education.new_recognition')}
            placeholder={t('education.new_recognition_placeholder')}
            descriptiveText={t('education.new_recognition_description')}
                      value={newRecognition}
                      onChange={(e) => setNewRecognition(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRecognition();
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddRecognition}
                      style={{
                        background: themeMode === 'dark' 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))'
                          : 'linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(37, 99, 235, 1))',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}
                    >
                      <Plus size={16} />
                    </Button>
                  </Flex>
                  
                  {formData.recognition.length > 0 && (
                    <Flex direction="column" gap="0.5rem">
                      {formData.recognition.map((recognition, index) => (
                        <Flex key={index} justifyContent="space-between" alignItems="center" style={{
                          background: themeMode === 'dark' 
                            ? 'rgba(71, 85, 105, 0.5)' 
                            : 'rgba(241, 245, 249, 0.5)',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: themeMode === 'dark' 
                            ? '1px solid rgba(148, 163, 184, 0.2)' 
                            : '1px solid rgba(203, 213, 225, 0.3)',
                        }}>
                          <Text style={{ color: themeMode === 'dark' ? '#E2E8F0' : '#1E293B' }}>
                            {recognition}
                          </Text>
                          <Button
                            type="button"
                            onClick={() => handleRemoveRecognition(index)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            <X size={16} />
                          </Button>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                </Flex>
              </View>

              {/* Description */}
        <View>
                <TextAreaField
          label={t('education.description_label')}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('education.description_placeholder')}
          descriptiveText={t('education.description_help')}
                  rows={4}
                />
              </View>

              {/* Image Upload */}
        <View>
                <Text 
                  fontSize="1.25rem" 
                  fontWeight="600" 
                  marginBottom="1rem"
                  style={{ 
                    color: themeMode === 'dark' ? '#F8FAFC' : '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Upload size={20} />
          {t('education.institution_logo')}
                </Text>
                
                <View style={{
                  border: themeMode === 'dark' ? '2px dashed rgba(148, 163, 184, 0.3)' : '2px dashed rgba(203, 213, 225, 0.5)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                }}>
                  {imagePreview ? (
                    <Flex direction="column" alignItems="center" gap="1rem">
                      <img
                        src={imagePreview}
            alt="Preview"
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          color: '#EF4444',
                        }}
                      >
            {t('education.remove_image')}
                      </Button>
                    </Flex>
                  ) : (
                    <>
                      <Upload size={48} style={{ color: themeMode === 'dark' ? '#94A3B8' : '#64748B', margin: '0 auto 1rem' }} />
                      <Text style={{ 
                        color: themeMode === 'dark' ? '#CBD5E1' : '#64748B',
                        marginBottom: '1rem'
                      }}>
            {t('education.image_drag_or_click')}
                      </Text>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        style={{
                          background: themeMode === 'dark' 
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))'
                            : 'linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(37, 99, 235, 1))',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                        }}
                      >
            {t('education.select_image')}
                      </Button>
                    </>
                  )}
                </View>
              </View>

              {/* Actions */}
              <Flex justifyContent="flex-end" gap="1rem" style={{ paddingTop: '1rem' }}>
                <Button
                  type="button"
                  onClick={() => router.push(getLocalizedPath('/admin/education'))}
                  style={{
                    background: 'transparent',
                    border: themeMode === 'dark' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(203, 213, 225, 0.4)',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    color: themeMode === 'dark' ? '#94A3B8' : '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  {t('education.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: themeMode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))'
                      : 'linear-gradient(135deg, rgba(34, 197, 94, 1), rgba(22, 163, 74, 1))',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {loading ? (
                    <Loader size="small" />
                  ) : (
                    <>
                      <Save size={16} />
                      {mode === 'create' ? t('education.create') : t('education.edit')}
                    </>
                  )}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Card>
      </View>
    </View>
  );
};

export default AdminEducationFormClient;
