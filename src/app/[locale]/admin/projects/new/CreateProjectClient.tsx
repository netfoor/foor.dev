'use client';

import React, { useState, useCallback, memo } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card, 
  Heading,
  TextField,
  TextAreaField,
  SelectField,
  SwitchField,
  Badge,
  Alert,
  Divider
} from '@aws-amplify/ui-react';
import '../../admin.css';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  X,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { FileUploadInput } from './FileUploadInput';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';

// Estilos personalizados para mejorar el contraste en tema oscuro
const createProjectStyles = `
  .create-project-form .amplify-field {
    margin-bottom: 1rem;
  }
  
  .create-project-form .amplify-field > label {
    color: var(--form-label-color) !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
    font-size: 0.95rem !important;
  }
  
  .create-project-form .amplify-input,
  .create-project-form .amplify-textarea,
  .create-project-form .amplify-select select {
    background-color: var(--form-input-bg) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-text) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.9rem !important;
  }
  
  .create-project-form .amplify-input::placeholder,
  .create-project-form .amplify-textarea::placeholder {
    color: var(--form-placeholder-color) !important;
    opacity: 0.8 !important;
    font-weight: 400 !important;
  }
  
  .create-project-form .amplify-input:focus,
  .create-project-form .amplify-textarea:focus,
  .create-project-form .amplify-select select:focus {
    border-color: var(--form-focus-border) !important;
    box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
    outline: none !important;
  }
  
  .create-project-form .amplify-field-group__control .amplify-field__description {
    color: var(--form-description-color) !important;
    font-size: 0.8rem !important;
    margin-top: 0.25rem !important;
    font-weight: 500 !important;
  }
  
  .create-project-form .amplify-switchfield label {
    color: var(--form-label-color) !important;
    font-weight: 600 !important;
  }

  .create-project-form .amplify-select select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.65rem;
    padding-right: 2.5rem !important;  }
  /* Image remove button styles - small button positioned in corner */
  .create-project-form .image-remove-button {
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

  .create-project-form .image-remove-button:hover {
    background-color: rgba(239, 68, 68, 1) !important;
    transform: scale(1.1) !important;
  }

  .create-project-form .gallery-image-remove {
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

  /* Responsive design improvements */
  @media (max-width: 768px) {
    .create-project-form .skill-tag-flex {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .create-project-form .skill-tag-button {
      width: 100% !important;
      margin-top: 0.5rem !important;
      min-width: auto !important;
    }
      .create-project-form .amplify-flex {
      flex-direction: column !important;
    }
    
    .create-project-form .amplify-button {
      width: 100% !important;
      margin-top: 0.5rem !important;
    }    /* Mobile image remove buttons - smaller size, but still positioned in corner */
    .create-project-form .image-remove-button {
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

    .create-project-form .gallery-image-remove {
      width: 24px !important;
      height: 24px !important;
      min-width: 24px !important;
      max-width: 24px !important;
      padding: 0.2rem !important;
      font-size: 10px !important;
      border-radius: 3px !important;
      top: 2px !important;
      right: 2px !important;
    }
  }
`;

// Generar el cliente de Amplify
const client = generateClient<Schema>();

interface ProjectFormData {
  title: string;
  description: string;
  place: string;
  projectUrl: string;
  githubUrl: string;
  demoUrl: string;
  skills: string[];
  categories: 'Hackathon' | 'Research' | 'Professional' | 'Academic' | 'Personal';
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Published' | 'Archived';
  featured: boolean;
  slug: string;
  metaDescription: string;
  tags: string[];
}

function CreateProjectClient(): React.JSX.Element {  
  // Estados para el formulario
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();

  // Estados para el formulario
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    place: '',
    projectUrl: '',
    githubUrl: '',
    demoUrl: '',
    skills: [],
    categories: 'Personal',
    startDate: '',
    endDate: '',
    status: 'Draft',
    featured: false,
    slug: '',
    metaDescription: '',    tags: []
  });

  // Estados para archivos
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  // Estados de la UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [skillInput, setSkillInput] = useState('');  const [tagInput, setTagInput] = useState('');

  // Manejadores de formulario
  const handleInputChange = (field: keyof ProjectFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generar slug basado en el título
    if (field === 'title' && typeof value === 'string') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };  // Handler para imagen principal
  const handleMainImageFile = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB límite
      setError(t('projects.image_size_error'));
      return;
    }
    
    setMainImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setMainImagePreview(result);
    };
    reader.onerror = () => {
      setError(t('projects.error_uploading_images'));
    };
    reader.readAsDataURL(file);
    setError('');
  }, [t]);
  const removeMainImage = useCallback(() => {
    setMainImage(null);
    setMainImagePreview('');
  }, []);  // Manejador simplificado para galería
  const handleGalleryImageFiles = useCallback((files: File[]) => {
    // Validar tamaño y cantidad
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('projects.image_too_large', { name: file.name }));
        return false;
      }
      return true;
    });

    if (galleryImages.length + validFiles.length > 10) {
      setError(t('projects.max_gallery_images'));
      return;
    }

    setGalleryImages(prev => [...prev, ...validFiles]);

    // Generar previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  }, [galleryImages.length, t]);

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Manejadores de skills y tags
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      handleInputChange('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    handleInputChange('skills', formData.skills.filter(skill => skill !== skillToRemove));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Función para subir archivos a S3
  const uploadFiles = async (projectId: string) => {
    const uploadResults = {
      photoKey: '',
      galleryKeys: [] as string[]
    };

    try {      // Subir imagen principal
      if (mainImage) {
        // Usamos el nuevo helper que agrega metadatos para el procesamiento Lambda
        const photoKey = await uploadImageWithMetadata(
          mainImage, 
          projectId, 
          'Projects', 
          'photoKey'
        );
        uploadResults.photoKey = photoKey;
      }      // Subir galería
      if (galleryImages.length > 0) {
        const galleryPromises = galleryImages.map(async (file, index) => {
          // Para la galería, también usamos metadatos para cada imagen
          return uploadImageWithMetadata(
            file,
            projectId,
            'Projects',
            `galleryKeys[${index}]`
          );
        });

        uploadResults.galleryKeys = await Promise.all(galleryPromises);
      }      return uploadResults;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error(t('projects.error_uploading_images'));
    }
  };

  // Función para crear el proyecto
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');    
    
    try {
      // Validaciones básicas
      if (!formData.title.trim()) {
        throw new Error(t('projects.error_title_required'));
      }
      if (!formData.description.trim()) {
        throw new Error(t('projects.error_description_required'));
      }

      // Primero creamos el proyecto en la base de datos sin imágenes
      const newProject = await client.models.Projects.create({
        title: formData.title,
        description: formData.description,
        place: formData.place,
        projectUrl: formData.projectUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        demoUrl: formData.demoUrl || undefined,
        skills: formData.skills,
        categories: formData.categories,
        // Inicialmente sin imágenes
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        status: formData.status,
        featured: formData.featured,
        slug: formData.slug,
        metaDescription: formData.metaDescription || undefined,
        tags: formData.tags
      });

      if (newProject.errors) {
        throw new Error(newProject.errors[0].message);
      }

      // Ahora que tenemos el ID del proyecto, subimos las imágenes con los metadatos
      if ((mainImage || galleryImages.length > 0) && newProject.data) {
        const uploadResults = await uploadFiles(newProject.data.id);
        
        // Actualizamos el proyecto con las claves de las imágenes
        // Nota: no necesitamos actualizar el proyecto manualmente ya que la función Lambda
        // lo hará automáticamente gracias a los metadatos que enviamos
      }

      setSuccess(t('projects.success_project_created'));
      
      // Redirigir a la lista de proyectos después de 2 segundos
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/projects'));
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : t('projects.error_creating_project'));
    } finally {
      setIsLoading(false);
    }
  };  const isDark = mode === 'dark';
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
      <style dangerouslySetInnerHTML={{ __html: createProjectStyles }} />
      <View 
        style={{
          padding: '1.5rem',
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          minHeight: '100vh',
          ...cssVariables
        }}
        className="create-project-form"
      ><Card
        style={{
          padding: '2rem',
          backgroundColor: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >{/* Header */}
        <Flex direction="column" gap="large">
          <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center" gap="medium">              <Button
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: isDark ? '#CBD5E1' : '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={() => router.push(getLocalizedPath('/admin/projects'))}
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
                {t('projects.create_project')}
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
          <form onSubmit={handleSubmit} className="create-project-form">
            <Flex direction="column" gap="large">
                {/* Información básica */}
              <Card 
                style={{
                  padding: '1.5rem',
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                  borderRadius: '8px'
                }}
              >
                <Heading 
                  level={4} 
                  style={{
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    marginBottom: '1rem'
                  }}
                >
                  {t('projects.basic_info')}
                </Heading>
                
                <Flex direction="column" gap="medium">                  <TextField
                    label={`${t('projects.title_label')} *`}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    placeholder={t('projects.title_placeholder')}
                  />

                  <TextField
                    label={t('projects.slug_label')}
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder={t('projects.slug_placeholder')}
                    descriptiveText={t('projects.slug_description')}
                  />                  <TextAreaField
                    label={`${t('projects.description_label')} *`}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={4}
                    placeholder={t('projects.description_placeholder')}
                  />

                  <TextAreaField
                    label={t('projects.meta_description_label')}
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    rows={2}
                    maxLength={160}
                    placeholder={t('projects.meta_description_placeholder')}
                  />

                  <TextField
                    label={t('projects.place_label')}
                    value={formData.place}
                    onChange={(e) => handleInputChange('place', e.target.value)}
                    placeholder={t('projects.place_placeholder')}
                  />
                </Flex>
              </Card>              {/* URLs y Enlaces */}
              <Card 
                style={{
                  padding: '1.5rem',
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                  borderRadius: '8px'
                }}
              >
                <Heading 
                  level={4} 
                  style={{
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    marginBottom: '1rem'
                  }}                >
                  {t('projects.links')}
                </Heading>
                
                <Flex direction="column" gap="medium">
                  <TextField
                    label={t('projects.project_url_label')}
                    value={formData.projectUrl}
                    onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                    placeholder={t('projects.project_url_placeholder')}
                    type="url"
                  />

                  <TextField
                    label={t('projects.github_url_label')}
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    placeholder={t('projects.github_url_placeholder')}
                    type="url"
                  />

                  <TextField
                    label={t('projects.demo_url_label')}
                    value={formData.demoUrl}
                    onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                    placeholder={t('projects.demo_url_placeholder')}
                    type="url"
                  />
                </Flex>
              </Card>              {/* Imagen Principal */}
              <Card 
                style={{
                  padding: '1.5rem',
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                  borderRadius: '8px'
                }}
              >
                <Heading 
                  level={4} 
                  style={{
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    marginBottom: '1rem'
                  }}                >
                  {t('projects.main_image')}
                </Heading>

                {!mainImagePreview ? (
                  <FileUploadInput onFileSelect={handleMainImageFile}>                      <div
                        style={{
                          display: 'block',
                          padding: '2rem',
                          border: `2px dashed ${isDark ? '#475569' : '#CBD5E1'}`,
                          borderRadius: '8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.8)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Flex direction="column" alignItems="center" gap="medium">
                          <ImageIcon size={48} color={isDark ? '#94A3B8' : '#64748B'} />
                          <Text 
                            style={{
                              color: isDark ? '#CBD5E1' : '#64748B'
                            }}
                          >
                            {t('projects.main_image_upload_text')}
                          </Text>
                        </Flex>
                      </div></FileUploadInput>
                ) : (
                  <View position="relative">
                    <img
                      src={mainImagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />                    <Button
                      type="button"
                      className="image-remove-button"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px'
                      }}
                      onClick={removeMainImage}
                    >
                      <X size={16} />
                    </Button>
                  </View>
                )}
              </Card>              {/* Galería */}
              <Card 
                style={{
                  padding: '1.5rem',
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                  borderRadius: '8px'
                }}
              >
                <Heading 
                  level={4} 
                  style={{
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    marginBottom: '1rem'
                  }}                >
                  {t('projects.gallery_max_images')}
                </Heading>

                <FileUploadInput 
                  onMultipleFilesSelect={handleGalleryImageFiles}
                  multiple={true}
                >                  <div
                    style={{
                      display: 'block',
                      padding: '2rem',
                      border: `2px dashed ${isDark ? '#475569' : '#CBD5E1'}`,
                      borderRadius: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(248, 250, 252, 0.8)',
                      transition: 'all 0.2s ease',
                      marginBottom: '1rem'
                    }}
                  >
                    <Flex direction="column" alignItems="center" gap="medium">
                      <ImageIcon size={48} color={isDark ? '#94A3B8' : '#64748B'} />
                      <Text 
                        style={{
                          color: isDark ? '#CBD5E1' : '#64748B'
                        }}
                      >
                        {t('projects.gallery_upload_text')}
                      </Text>
                    </Flex>
                  </div>
                </FileUploadInput>

                {galleryPreviews.length > 0 && (
                  <Flex wrap="wrap" gap="medium">
                    {galleryPreviews.map((preview, index) => (
                      <View key={index} position="relative" width="150px">
                        <img
                          src={preview}
                          alt={`Gallery ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />                        <Button
                          type="button"
                          className="image-remove-button gallery-image-remove"
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px'
                          }}
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X size={12} />
                        </Button>
                      </View>
                    ))}
                  </Flex>
                )}
              </Card>                {/* Skills */}
              <Card 
                style={{
                  padding: '1.5rem',
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                  borderRadius: '8px'
                }}
              >
                <Heading 
                  level={4} 
                  style={{
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    marginBottom: '1rem'
                  }}                >
                  {t('projects.skills_technologies')}
                </Heading>
                
                <div className="input-with-button-container">
                  <div className="input-wrapper">
                    <TextField
                      label={t('projects.skill_label')}
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder={t('projects.skill_placeholder')}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      style={{ width: '100%' }}
                    />
                    
                    

                  </div>

                  
                  <Button 
                    type="button" 
                    onClick={addSkill}
                    className="add-button"                    style={{
                      backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t('projects.add_skill')}
                  </Button>
                </div>

                <div className="badges-container">
                  {formData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variation="info"
                      style={{ cursor: 'pointer' }}
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </Card>                {/* Tags */}
              <Card 
                style={{
                  padding: '1.5rem',
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                  borderRadius: '8px'
                }}
              >
                <Heading 
                  level={4} 
                  style={{
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    marginBottom: '1rem'
                  }}                >
                  {t('projects.tags_seo')}
                </Heading>
                
                <div className="input-with-button-container">
                  <div className="input-wrapper">
                    <TextField
                      label={t('projects.tag_label')}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder={t('projects.tag_placeholder')}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={addTag}
                    className="add-button"
                    style={{
                      backgroundColor: isDark ? '#10B981' : '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t('projects.add')}
                  </Button>
                </div>

                <div className="badges-container">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variation="success"
                      style={{ cursor: 'pointer' }}
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </Card>{/* Configuración */}
              <Card 
                style={{
                  padding: '1.5rem',
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                  borderRadius: '8px'
                }}
              >
                <Heading 
                  level={4} 
                  style={{
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    marginBottom: '1rem'
                  }}                >
                  {t('projects.configuration')}
                </Heading>
                
                <Flex direction="column" gap="medium">
                  <SelectField
                    label={t('projects.category_label')}
                    value={formData.categories}
                    onChange={(e) => handleInputChange('categories', e.target.value)}
                  >
                    <option value="Personal">{t('projects.category_personal')}</option>
                    <option value="Professional">{t('projects.category_professional')}</option>
                    <option value="Academic">{t('projects.category_academic')}</option>
                    <option value="Research">{t('projects.category_research')}</option>
                    <option value="Hackathon">{t('projects.category_hackathon')}</option>
                  </SelectField>

                  <SelectField
                    label={t('projects.status_label')}
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="Draft">{t('projects.status_draft')}</option>
                    <option value="Published">{t('projects.status_published')}</option>
                    <option value="Archived">{t('projects.status_archived')}</option>
                  </SelectField><Flex 
                    direction={{ base: 'column', medium: 'row' }} 
                    gap="large"
                  >                    <TextField
                      label={t('projects.start_date_label')}
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      style={{ flex: 1 }}
                    />

                    <TextField
                      label={t('projects.end_date_label')}
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </Flex>

                  <SwitchField
                    label={t('projects.featured_label')}
                    isChecked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                  />
                </Flex>
              </Card>

              <Divider />              {/* Botones de acción */}
              <Flex 
                direction={{ base: 'column', medium: 'row' }}
                justifyContent="space-between" 
                gap="medium"
              >
                <Button
                  onClick={() => router.push(getLocalizedPath('/admin/projects'))}
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'transparent',
                    color: isDark ? '#CBD5E1' : '#64748B',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}                >
                  {t('projects.cancel')}
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
                  style={{
                    backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.75rem 1.5rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || !formData.title.trim() || !formData.description.trim()) ? 0.6 : 1,
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
                  {isLoading ? t('projects.creating') : t('projects.create_project')}
                </Button>
              </Flex>
            </Flex>
          </form>        </Flex>
      </Card>
    </View>
    </>
  );
}

// Memorizar el componente para evitar re-renders innecesarios
const CreateProjectClientMemo = memo(CreateProjectClient);
CreateProjectClientMemo.displayName = 'CreateProjectClient';

export default CreateProjectClientMemo;
