'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
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
  Loader,
  Divider
} from '@aws-amplify/ui-react';
import '../../admin.css';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import S3Cleanup from '@/lib/utils/s3-cleanup';
import { FileUploadInput } from '../new/FileUploadInput';

// Estilos personalizados para mejorar el contraste en tema oscuro
const editProjectStyles = `
  .edit-project-form .amplify-field {
    margin-bottom: 1rem;
  }
  
  .edit-project-form .amplify-field > label {
    color: var(--form-label-color) !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
    font-size: 0.95rem !important;
  }
  
  .edit-project-form .amplify-input,
  .edit-project-form .amplify-textarea,
  .edit-project-form .amplify-select select {
    background-color: var(--form-input-bg) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-text) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.9rem !important;
  }
  
  .edit-project-form .amplify-input::placeholder,
  .edit-project-form .amplify-textarea::placeholder {
    color: var(--form-placeholder-color) !important;
    opacity: 0.8 !important;
    font-weight: 400 !important;
  }
  
  .edit-project-form .amplify-input:focus,
  .edit-project-form .amplify-textarea:focus,
  .edit-project-form .amplify-select select:focus {
    border-color: var(--form-focus-border) !important;
    box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
    outline: none !important;
  }
  
  .edit-project-form .amplify-field-group__control .amplify-field__description {
    color: var(--form-description-color) !important;
    font-size: 0.8rem !important;
    margin-top: 0.25rem !important;
    font-weight: 500 !important;
  }
  
  .edit-project-form .amplify-switchfield label {
    color: var(--form-label-color) !important;
    font-weight: 600 !important;
  }

  .edit-project-form .amplify-select select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.65rem;
    padding-right: 2.5rem !important;
  }

  .edit-project-form .input-with-button-container {
    display: flex;
    gap: 0.75rem;
    align-items: end;
    margin-bottom: 1rem;
  }

  .edit-project-form .input-wrapper {
    flex: 1;
  }

  .edit-project-form .add-button {
    flex-shrink: 0;
    min-width: 120px;
  }
  .edit-project-form .badges-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  /* Image remove button styles - small button positioned in corner */
  .edit-project-form .image-remove-button {
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

  .edit-project-form .image-remove-button:hover {
    background-color: rgba(239, 68, 68, 1) !important;
    transform: scale(1.1) !important;
  }

  .edit-project-form .gallery-image-remove {
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
    .edit-project-form .input-with-button-container {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 0.5rem !important;
    }
    
    .edit-project-form .add-button {
      width: 100% !important;
      min-width: auto !important;
    }
    
    .edit-project-form .amplify-flex {
      flex-direction: column !important;
    }
    
    .edit-project-form .amplify-button {
      width: 100% !important;
      margin-top: 0.5rem !important;
    }    /* Mobile image remove buttons - smaller size, but still positioned in corner */
    .edit-project-form .image-remove-button {
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

    .edit-project-form .gallery-image-remove {
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

// Tipos para el proyecto
type Project = Schema["Projects"]["type"];

interface EditProjectClientProps {
  locale: SupportedLocale;
  projectId: string;
}

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

function EditProjectClient({ locale, projectId }: EditProjectClientProps): React.JSX.Element {
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();

  // Estados para el proyecto actual
  const [project, setProject] = useState<Project | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

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
    metaDescription: '',
    tags: []
  });
  // Estados para archivos
  const [newMainImage, setNewMainImage] = useState<File | null>(null);
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [currentMainImageUrl, setCurrentMainImageUrl] = useState<string>('');
  const [currentGalleryUrls, setCurrentGalleryUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Referencias para inputs de archivos
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImagesInputRef = useRef<HTMLInputElement>(null);

  // Estados de la UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [skillInput, setSkillInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [mounted, setMounted] = useState(false);

  // Efecto para controlar la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar proyecto existente
  const loadProject = async () => {
    try {
      setInitialLoading(true);
      const client = generateClient<Schema>();
      const response = await client.models.Projects.get({ id: projectId }, { authMode: 'userPool' });

      if (response.errors || !response.data) {
        setError(t('projects.error_loading_project'));
        return;
      }

      const projectData = response.data;
      setProject(projectData);

      // Llenar el formulario con los datos existentes
      setFormData({
        title: projectData.title || '',
        description: projectData.description || '',
        place: projectData.place || '',
        projectUrl: projectData.projectUrl || '',
        githubUrl: projectData.githubUrl || '',
        demoUrl: projectData.demoUrl || '',
        skills: (projectData.skills || []).filter((skill): skill is string => skill !== null),
        categories: (projectData.categories as any) || 'Personal',
        startDate: projectData.startDate || '',
        endDate: projectData.endDate || '',
        status: (projectData.status as any) || 'Draft',
        featured: projectData.featured || false,
        slug: projectData.slug || '',
        metaDescription: projectData.metaDescription || '',
        tags: (projectData.tags || []).filter((tag): tag is string => tag !== null)
      });

      // Cargar URLs de imágenes existentes
      if (projectData.photoKey) {
        try {
          const normalizedPath = projectData.photoKey.startsWith('public/')
            ? projectData.photoKey.slice(7)
            : projectData.photoKey;
          const url = await getUrl({ path: normalizedPath });
          setCurrentMainImageUrl(url.url.toString());
        } catch (err) {
          console.error('Error loading main image:', err);
        }
      }

      if (projectData.galleryKeys && projectData.galleryKeys.length > 0) {
        try {
          const urlPromises = projectData.galleryKeys
            .filter((key): key is string => !!key)
            .map(async (key) => {
              const normalizedKey = key.startsWith('public/') ? key.slice(7) : key;
              const url = await getUrl({ path: normalizedKey });
              return url.url.toString();
            });
          const urls = await Promise.all(urlPromises);
          setCurrentGalleryUrls(urls);
        } catch (err) {
          console.error('Error loading gallery images:', err);
        }
      }

    } catch (err) {
      console.error('Error loading project:', err);
      setError(t('projects.error_loading_project'));
    } finally {
      setInitialLoading(false);
    }
  };

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
  };

  // Manejadores de imagen principal
  const handleMainImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB límite
        setError(t('projects.image_size_error'));
        return;
      }
      console.log('Selected new main image:', file.name);
      setNewMainImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMainImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
    // Limpiar el input para permitir seleccionar el mismo archivo otra vez
    event.target.value = '';
  };

  const removeNewMainImage = () => {
    setNewMainImage(null);
    setMainImagePreview('');
  };

  const removeCurrentMainImage = () => {
    if (project?.photoKey) {
      console.log('Marking main image for deletion:', project.photoKey);
      setImagesToDelete(prev => [...prev, project.photoKey!]);
    }
    setCurrentMainImageUrl('');
  };
  // Manejadores de galería
  const handleGalleryImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    console.log(`Selected ${files.length} new gallery images`);

    // Validar tamaño y cantidad
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('projects.image_too_large', { name: file.name }));
        return false;
      }
      return true;
    });

    const totalImages = currentGalleryUrls.length + newGalleryImages.length + validFiles.length;
    if (totalImages > 10) {
      setError(t('projects.max_gallery_images'));
      return;
    }

    setNewGalleryImages(prev => [...prev, ...validFiles]);

    // Generar previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
    // Limpiar el input para permitir seleccionar el mismo archivo otra vez
    event.target.value = '';
  };

  const removeNewGalleryImage = (index: number) => {
    setNewGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeCurrentGalleryImage = (index: number) => {
    const keyToDelete = project?.galleryKeys?.[index];
    if (keyToDelete) {
      console.log('Marking gallery image for deletion:', keyToDelete);
      setImagesToDelete(prev => [...prev, keyToDelete]);
    }
    setCurrentGalleryUrls(prev => prev.filter((_, i) => i !== index));
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
  const uploadFiles = async () => {
    const uploadResults = {
      photoKey: project?.photoKey || '',
      galleryKeys: [...(project?.galleryKeys || [])]
    };
    
    console.log('Initial upload results:', JSON.stringify(uploadResults));
    console.log('Images to delete:', JSON.stringify(imagesToDelete));
    
    try {
      // Eliminar archivos marcados para borrar usando utilidad S3
      for (const keyToDelete of imagesToDelete) {
        console.log('Attempting to delete file:', keyToDelete);
        try {
          const success = await S3Cleanup.deleteSingleFile(keyToDelete);
          if (!success) {
            console.warn(`⚠️ No se pudo eliminar el archivo: ${keyToDelete}`);
          } else {
            console.log(`✅ Archivo eliminado: ${keyToDelete}`);
          }
        } catch (error) {
          console.warn(`⚠️ Error de permisos eliminando archivo: ${keyToDelete}`, error);
          // Continue with the update even if deletion fails
        }
      }

      // Si se removió la imagen principal, limpiar el key
      if (imagesToDelete.includes(project?.photoKey || '')) {
        console.log('Main image was deleted, clearing photoKey');
        uploadResults.photoKey = '';
      }

      // Filtrar las claves de galería que se eliminaron
      uploadResults.galleryKeys = uploadResults.galleryKeys
        .filter((key): key is string => key !== null)
        .filter(key => !imagesToDelete.includes(key));
      
      console.log('After removing deleted images:', JSON.stringify(uploadResults));

      // Subir nueva imagen principal
      if (newMainImage) {
        console.log('Uploading new main image:', newMainImage.name);
        const photoKey = await uploadImageWithMetadata(
          newMainImage,
          projectId,
          'Projects',
          'photoKey'
        );
        console.log('New main image uploaded with key:', photoKey);
        uploadResults.photoKey = photoKey;
      }

      // Subir nuevas imágenes de galería
      if (newGalleryImages.length > 0) {
        console.log(`Uploading ${newGalleryImages.length} new gallery images`);
        const galleryPromises = newGalleryImages.map(async (file, index) => {
          const currentGalleryLength = uploadResults.galleryKeys.length;
          console.log(`Uploading gallery image ${index + 1}/${newGalleryImages.length}: ${file.name}`);
          return uploadImageWithMetadata(
            file,
            projectId,
            'Projects',
            `galleryKeys[${currentGalleryLength + index}]`
          );
        });

        const newGalleryKeys = await Promise.all(galleryPromises);
        console.log('New gallery keys:', JSON.stringify(newGalleryKeys));
        uploadResults.galleryKeys = [...uploadResults.galleryKeys, ...newGalleryKeys];
      }

      console.log('Final upload results:', JSON.stringify(uploadResults));
      return uploadResults;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error(t('projects.error_uploading_images'));
    }
  };

  // Función para actualizar el proyecto
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {      // Validaciones básicas
      if (!formData.title.trim()) {
        throw new Error(t('projects.error_title_required'));
      }
      if (!formData.description.trim()) {
        throw new Error(t('projects.error_description_required'));
      }

      // Subir archivos
      const uploadResults = await uploadFiles();

      console.log('Updating project with image keys:', {
        photoKey: uploadResults.photoKey,
        galleryKeys: uploadResults.galleryKeys
      });

      // Actualizar el proyecto en la base de datos
      const client = generateClient<Schema>();
      const result = await client.models.Projects.update({
        id: projectId,
        title: formData.title,
        description: formData.description,
        place: formData.place,
        projectUrl: formData.projectUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        demoUrl: formData.demoUrl || undefined,
        skills: formData.skills,
        categories: formData.categories,
        photoKey: uploadResults.photoKey || undefined,
        galleryKeys: uploadResults.galleryKeys,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        status: formData.status,
        featured: formData.featured,
        slug: formData.slug,
        metaDescription: formData.metaDescription || undefined,
        tags: formData.tags
      }, { authMode: 'userPool' }
    );

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setSuccess(t('projects.success_project_updated'));
      
      // Redirigir a la lista de proyectos después de 2 segundos
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/projects'));
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : t('projects.error_loading_project'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    loadProject();
  }, [projectId, mounted]);
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

  if (initialLoading) {
    return (
      <View 
        style={{
          padding: '1.5rem',
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}
      >
        <Loader size="large" />        <Text style={{ color: isDark ? '#CBD5E1' : '#64748B' }}>
          {t('projects.loading_project')}
        </Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View 
        style={{
          padding: '1.5rem',
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          minHeight: '100vh'
        }}
      >
        <Card
          style={{
            padding: '2rem',
            backgroundColor: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px',
            maxWidth: '800px',
            margin: '0 auto'
          }}
        >
          <Alert 
            variation="error"
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 242, 242, 1)',
              color: isDark ? '#FCA5A5' : '#B91C1C'
            }}
          >
            {t('projects.project_not_found')}
          </Alert>
        </Card>
      </View>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: editProjectStyles }} />
      <View 
        style={{
          padding: '1.5rem',
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          minHeight: '100vh',
          ...cssVariables
        }}
        className="edit-project-form"
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
        >          {/* Header */}
          <Flex direction="column" gap="large">
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
                  {t('projects.edit_project_title', { title: project.title })}
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
            <form onSubmit={handleSubmit} className="edit-project-form">
              <Flex direction="column" gap="large">                {/* Información básica */}
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
                  
                  <Flex direction="column" gap="medium">                    <TextField
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
                    />

                    <TextAreaField
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
                </Card>                {/* URLs y Enlaces */}
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
                    {t('projects.links')}
                  </Heading>
                  
                  <Flex direction="column" gap="medium">                    <TextField
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
                </Card>

              {/* Imagen Principal */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  {t('projects.main_image')}
                </Heading>
                
                {/* Imagen actual */}
                {currentMainImageUrl && (
                  <View marginBottom="medium">
                    <Text fontWeight="bold" marginBottom="small">{t('projects.current_image')}</Text>
                    <View position="relative" display="inline-block">
                      <img
                        src={currentMainImageUrl}
                        alt="Current main"
                        style={{
                          width: '200px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />                      <Button
                        type="button"
                        className="image-remove-button"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px'
                        }}
                        onClick={removeCurrentMainImage}
                      >
                        <X size={16} />
                      </Button>
                    </View>
                  </View>
                )}                {/* Nueva imagen */}
                {!mainImagePreview ? (
                  <div
                    style={{
                      display: 'block',
                      padding: '2rem',
                      border: `2px dashed ${isDark ? '#444' : '#ccc'}`,
                      borderRadius: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                      position: 'relative'
                    }}
                  >
                    <Flex direction="column" alignItems="center" gap="medium">
                      <ImageIcon size={48} color={isDark ? '#888' : '#666'} />
                      <Text color={isDark ? 'font.secondary' : 'font.primary'}>
                      {currentMainImageUrl ? t('projects.change_main_image') : t('projects.add_new_image')} {t('projects.max_5mb')}
                      </Text>
                    </Flex>
                    <input
                      ref={mainImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageSelect}
                      onClick={(e) => {
                        console.log('Edit input clicked');
                        e.stopPropagation();
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                ) : (                  <View>
                    <Text fontWeight="bold" marginBottom="small">{t('projects.new_images')}:</Text>
                    <View position="relative" display="inline-block">
                      <img
                        src={mainImagePreview}
                        alt="New preview"
                        style={{
                          width: '200px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />                      <Button
                        type="button"
                        className="image-remove-button"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px'
                        }}
                        onClick={removeNewMainImage}
                      >
                        <X size={16} />
                      </Button>
                    </View>
                  </View>
                )}
              </Card>

              {/* Galería */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  {t('projects.gallery')} {t('projects.max_10_images_total')}
                </Heading>
                
                {/* Imágenes actuales */}
                {currentGalleryUrls.length > 0 && (
                  <View marginBottom="medium">
                    <Text fontWeight="bold" marginBottom="small">{t('projects.current_images')}</Text>
                    <Flex wrap="wrap" gap="medium">
                      {currentGalleryUrls.map((url, index) => (
                        <View key={index} position="relative" width="150px">
                          <img
                            src={url}
                            alt={`Current gallery ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />                          <Button
                            type="button"
                            className="image-remove-button gallery-image-remove"
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px'
                            }}
                            onClick={() => removeCurrentGalleryImage(index)}
                          >
                            <X size={12} />
                          </Button>
                        </View>
                      ))}
                    </Flex>
                  </View>
                )}                {/* Agregar nuevas imágenes */}
                <div
                  style={{
                    display: 'block',
                    padding: '1.5rem',
                    border: `2px dashed ${isDark ? '#444' : '#ccc'}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                    marginBottom: '1rem',
                    position: 'relative'
                  }}
                >
                  <Flex direction="column" alignItems="center" gap="medium">
                    <Plus size={24} color={isDark ? '#888' : '#666'} />
                    <Text color={isDark ? 'font.secondary' : 'font.primary'}>
                      {t('projects.add_gallery_images')}
                    </Text>
                  </Flex>
                  <input
                    ref={galleryImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImagesSelect}
                    onClick={(e) => {
                      console.log('Edit gallery input clicked');
                      e.stopPropagation();
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Nuevas imágenes */}
                {galleryPreviews.length > 0 && (
                  <View>
                    <Text fontWeight="bold" marginBottom="small">{t('projects.new_images')}</Text>
                    <Flex wrap="wrap" gap="medium">
                      {galleryPreviews.map((preview, index) => (
                        <View key={index} position="relative" width="150px">
                          <img
                            src={preview}
                            alt={`New gallery ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />                          <Button
                            type="button"
                            className="image-remove-button gallery-image-remove"
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px'
                            }}
                            onClick={() => removeNewGalleryImage(index)}
                          >
                            <X size={12} />
                          </Button>
                        </View>
                      ))}
                    </Flex>
                  </View>
                )}
              </Card>              {/* Skills */}
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
                >                    {t('projects.skills_technologies')}
                </Heading>
                
                <div className="input-with-button-container">
                  <div className="input-wrapper">                    <TextField
                      label={t('projects.skill_label')}
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder={t('projects.skill_placeholder')}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <Button 
                    type="button"                    onClick={addSkill}
                    className="add-button"
                    style={{
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
              </Card>

              {/* Tags */}
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
                  {t('projects.tags_seo')}
                </Heading>
                
                <div className="input-with-button-container">
                  <div className="input-wrapper">                    <TextField
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
                    Agregar
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
              </Card>              {/* Configuración */}
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
                  {t('projects.configuration')}
                </Heading>
                
                <Flex direction="column" gap="medium">                  <SelectField
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
                  </Flex>                  <SwitchField
                    label={t('projects.featured_label')}
                    isChecked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                  />
                </Flex>
              </Card>

              <Divider />{/* Botones de acción */}
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
                  {isLoading ? t('projects.saving') : t('projects.save_changes')}
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

// Memorizar el componente para evitar re-renders innecesarios
const EditProjectClientMemo = memo(EditProjectClient);
EditProjectClientMemo.displayName = 'EditProjectClient';

export default EditProjectClientMemo;
