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
import { uploadData } from 'aws-amplify/storage';
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
      setError('Error al cargar los datos de educación');
    } finally {
      setInitialLoading(false);
    }
  };

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('La imagen debe ser menor a 5MB');
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

  // Subir imagen a S3
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.photoKey;
    
    try {
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `education-${Date.now()}.${fileExtension}`;
      
      await uploadData({
        path: `public/${fileName}`,
        data: imageFile,
        options: {
          contentType: imageFile.type,
        }
      });

      return fileName;
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      throw new Error('Error al subir la imagen');
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
      setError('El grado y la institución son requeridos');
      return;
    }

    if (!formData.startDate) {
      setError('La fecha de inicio es requerida');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Subir imagen si hay una nueva
      const photoKey = await uploadImage();

      const educationData = {
        degree: formData.degree.trim(),
        institution: formData.institution.trim(),
        fieldOfStudy: formData.fieldOfStudy.trim() || null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        location: formData.location.trim() || null,
        recognition: formData.recognition.length > 0 ? formData.recognition : null,
        description: formData.description.trim() || null,
        photoKey: photoKey || null,
      };

      if (mode === 'create') {
        await client.models.Education.create(educationData as CreateEducationInput, {
          authMode: 'userPool'
        });
        setSuccess('Educación creada exitosamente');
      } else {
        await client.models.Education.update({
          id: educationId!,
          ...educationData
        } as UpdateEducationInput, {
          authMode: 'userPool'
        });
        setSuccess('Educación actualizada exitosamente');
      }

      // Redirigir después de un momento
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/education'));
      }, 1500);

    } catch (err) {
      console.error('Error guardando educación:', err);
      setError(mode === 'create' ? 'Error al crear la educación' : 'Error al actualizar la educación');
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
            Cargando datos de educación...
          </Text>
        </Flex>
      </View>
    );
  }

  return (
    <View style={containerStyles}>
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
                {mode === 'create' ? 'Nueva Educación' : 'Editar Educación'}
              </Text>
              <Text 
                fontSize="1.125rem"
                style={{ color: themeMode === 'dark' ? '#CBD5E1' : '#64748B' }}
              >
                {mode === 'create' ? 'Agrega una nueva entrada educativa' : 'Modifica la información educativa'}
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
                  Información Básica
                </Text>
                
                <Flex direction="column" gap="1rem">
                  <TextField
                    label="Grado/Título *"
                    value={formData.degree}
                    onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="Ej: Licenciatura en Ingeniería de Sistemas"
                    required
                  />
                  
                  <TextField
                    label="Institución *"
                    value={formData.institution}
                    onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="Ej: Universidad Nacional"
                    required
                  />
                  
                  <TextField
                    label="Campo de Estudio"
                    value={formData.fieldOfStudy}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                    placeholder="Ej: Ciencias de la Computación"
                  />
                  
                  <TextField
                    label="Ubicación"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ej: Madrid, España"
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
                  Período de Estudios
                </Text>
                
                <Flex direction={{ base: 'column', medium: 'row' }} gap="1rem">
                  <TextField
                    label="Fecha de Inicio *"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                  
                  <TextField
                    label="Fecha de Fin"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    placeholder="Deja en blanco si es actual"
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
                  Reconocimientos
                </Text>
                
                <Flex direction="column" gap="1rem">
                  <Flex gap="0.5rem">
                    <TextField
                      label="Nuevo reconocimiento"
                      placeholder="Agregar reconocimiento..."
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
                  label="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción adicional de tus estudios, proyectos destacados, etc."
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
                  Logo de la Institución
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
                        Remover Imagen
                      </Button>
                    </Flex>
                  ) : (
                    <>
                      <Upload size={48} style={{ color: themeMode === 'dark' ? '#94A3B8' : '#64748B', margin: '0 auto 1rem' }} />
                      <Text style={{ 
                        color: themeMode === 'dark' ? '#CBD5E1' : '#64748B',
                        marginBottom: '1rem'
                      }}>
                        Arrastra una imagen aquí o haz clic para seleccionar
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
                        Seleccionar Imagen
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
                  Cancelar
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
                      {mode === 'create' ? 'Crear Educación' : 'Actualizar Educación'}
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
