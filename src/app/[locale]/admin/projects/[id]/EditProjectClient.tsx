'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import S3ProjectCleanup from '@/lib/utils/s3-cleanup';

// Generar el cliente de Amplify
const client = generateClient<Schema>();

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

export default function EditProjectClient({ locale, projectId }: EditProjectClientProps) {
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

  // Cargar proyecto existente
  const loadProject = async () => {
    try {
      setInitialLoading(true);
      const response = await client.models.Projects.get({ id: projectId });
      
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
          const url = await getUrl({ path: projectData.photoKey });
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
              const url = await getUrl({ path: key });
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
  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generar slug basado en el título
    if (field === 'title') {
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
    };    try {
      // Eliminar archivos marcados para borrar usando utilidad S3
      for (const keyToDelete of imagesToDelete) {
        const success = await S3ProjectCleanup.deleteSingleFile(keyToDelete);
        if (!success) {
          console.warn(`⚠️ No se pudo eliminar el archivo: ${keyToDelete}`);
        }
      }

      // Si se removió la imagen principal, limpiar el key
      if (imagesToDelete.includes(project?.photoKey || '')) {
        uploadResults.photoKey = '';
      }

      // Filtrar las claves de galería que se eliminaron
      uploadResults.galleryKeys = uploadResults.galleryKeys
        .filter((key): key is string => key !== null)
        .filter(key => !imagesToDelete.includes(key));

      // Subir nueva imagen principal
      if (newMainImage) {
        const photoKey = `projects/${Date.now()}-${newMainImage.name}`;
        await uploadData({
          path: photoKey,
          data: newMainImage,
          options: {
            contentType: newMainImage.type
          }
        }).result;
        uploadResults.photoKey = photoKey;
      }

      // Subir nuevas imágenes de galería
      if (newGalleryImages.length > 0) {
        const galleryPromises = newGalleryImages.map(async (file, index) => {
          const galleryKey = `projects/gallery/${Date.now()}-${index}-${file.name}`;
          await uploadData({
            path: galleryKey,
            data: file,
            options: {
              contentType: file.type
            }
          }).result;
          return galleryKey;
        });

        const newGalleryKeys = await Promise.all(galleryPromises);
        uploadResults.galleryKeys = [...uploadResults.galleryKeys, ...newGalleryKeys];
      }

      return uploadResults;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Error al subir las imágenes');
    }
  };

  // Función para actualizar el proyecto
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validaciones básicas
      if (!formData.title.trim()) {
        throw new Error('El título es requerido');
      }
      if (!formData.description.trim()) {
        throw new Error('La descripción es requerida');
      }

      // Subir archivos
      const uploadResults = await uploadFiles();

      // Actualizar el proyecto en la base de datos
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
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setSuccess('¡Proyecto actualizado exitosamente!');
      
      // Redirigir a la lista de proyectos después de 2 segundos
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/projects'));
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const isDark = mode === 'dark';

  if (initialLoading) {
    return (
      <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
        <Loader size="large" />
        <Text>Cargando proyecto...</Text>
      </Flex>
    );
  }

  if (!project) {
    return (
      <View padding="xl">
        <Alert variation="error">
          No se pudo encontrar el proyecto
        </Alert>
      </View>
    );
  }

  return (
    <View 
      padding="xl" 
      backgroundColor={isDark ? 'background.primary' : 'background.secondary'}
      minHeight="100vh"
    >
      <Card
        variation="elevated"
        padding="xl"
        backgroundColor={isDark ? 'background.secondary' : 'background.primary'}
        maxWidth="800px"
        margin="0 auto"
      >
        {/* Header */}
        <Flex direction="column" gap="large">
          <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center" gap="medium">
              <Button
                variation="link"
                onClick={() => router.push(getLocalizedPath('/admin/projects'))}
                color={isDark ? 'white' : 'black'}
              >
                <ArrowLeft size={20} />
              </Button>
              <Heading level={2} color={isDark ? 'white' : 'black'}>
                Editar Proyecto: {project.title}
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
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="large">
              
              {/* Información básica */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  {t('projects.basic_info')}
                </Heading>
                
                <Flex direction="column" gap="medium">
                  <TextField
                    label={t('projects.title_label') + ' *'}
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
                    label={t('projects.description_label') + ' *'}
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
              </Card>

              {/* URLs y Enlaces */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
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
                      />
                      <Button
                        variation="destructive"
                        size="small"
                        position="absolute"
                        top="8px"
                        right="8px"
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
                        {currentMainImageUrl ? t('projects.change_main_image') : t('projects.add_new_image')} (máx. 5MB)
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
                ) : (
                  <View>
                    <Text fontWeight="bold" marginBottom="small">Nueva Imagen:</Text>
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
                      />
                      <Button
                        variation="destructive"
                        size="small"
                        position="absolute"
                        top="8px"
                        right="8px"
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
                  {t('projects.gallery')} (máx. 10 imágenes total)
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
                          />
                          <Button
                            variation="destructive"
                            size="small"
                            position="absolute"
                            top="4px"
                            right="4px"
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
                          />
                          <Button
                            variation="destructive"
                            size="small"
                            position="absolute"
                            top="4px"
                            right="4px"
                            onClick={() => removeNewGalleryImage(index)}
                          >
                            <X size={12} />
                          </Button>
                        </View>
                      ))}
                    </Flex>
                  </View>
                )}
              </Card>

              {/* Skills */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  {t('projects.skills')}
                </Heading>
                
                <Flex gap="small" marginBottom="medium">
                  <TextField
                    label={t('projects.add_skill')}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder={t('projects.skill_placeholder')}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    flex="1"
                  />
                  <Button type="button" onClick={addSkill}>
                    {t('projects.add_skill')}
                  </Button>
                </Flex>

                <Flex wrap="wrap" gap="small">
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
                </Flex>
              </Card>

              {/* Tags */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  Tags (SEO)
                </Heading>
                
                <Flex gap="small" marginBottom="medium">
                  <TextField
                    label={t('projects.add_tag')}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder={t('projects.tag_placeholder')}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    flex="1"
                  />
                  <Button type="button" onClick={addTag}>
                    {t('projects.add_tag')}
                  </Button>
                </Flex>

                <Flex wrap="wrap" gap="small">
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
                </Flex>
              </Card>

              {/* Configuración */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  {t('projects.metadata')}
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
                  </SelectField>

                  <Flex gap="large">
                    <TextField
                      label={t('projects.start_date_label')}
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />

                    <TextField
                      label={t('projects.end_date_label')}
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </Flex>

                  <SwitchField
                    label={t('projects.featured_label')}
                    isChecked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                  />
                </Flex>
              </Card>

              <Divider />

              {/* Botones de acción */}
              <Flex justifyContent="space-between" gap="medium">
                <Button
                  variation="link"
                  onClick={() => router.push(getLocalizedPath('/admin/projects'))}
                  isDisabled={isLoading}
                >
                  {t('projects.back_to_projects')}
                </Button>

                <Button
                  type="submit"
                  variation="primary"
                  isDisabled={isLoading || !formData.title.trim() || !formData.description.trim()}
                  isLoading={isLoading}
                  loadingText={t('projects.saving')}
                >
                  <Save size={16} />
                  {t('projects.save_changes')}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Card>
    </View>
  );
}
