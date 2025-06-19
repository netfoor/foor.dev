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
  console.log('🔄 CreateProjectClient render');
  
  // Restaurar hooks normales
  const themeContext = useTheme();
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
  };

  // Handler para imagen principal
  const handleMainImageFile = useCallback((file: File) => {
    console.log('🔧 handleMainImageFile called with:', file.name);
    
    if (file.size > 5 * 1024 * 1024) { // 5MB límite
      console.log('❌ File too large:', file.size);
      setError('La imagen principal no puede ser mayor a 5MB');
      return;
    }
    
    console.log('✅ Setting main image:', file.name);
    setMainImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('🖼️ Setting image preview');
      setMainImagePreview(result);
    };
    reader.onerror = () => {
      console.log('❌ Error reading file');
      setError('Error al cargar la imagen');
    };
    reader.readAsDataURL(file);
    setError('');
    console.log('🎯 handleMainImageFile completed');
  }, []);

  const removeMainImage = useCallback(() => {
    console.log('🗑️ Removing main image');
    setMainImage(null);
    setMainImagePreview('');
  }, []);
  // Manejador simplificado para galería
  const handleGalleryImageFiles = useCallback((files: File[]) => {
    // Validar tamaño y cantidad
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`La imagen ${file.name} es muy grande (máx. 5MB)`);
        return false;
      }
      return true;
    });

    if (galleryImages.length + validFiles.length > 10) {
      setError('Máximo 10 imágenes en la galería');
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
  }, [galleryImages.length]);

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
  const uploadFiles = async () => {
    const uploadResults = {
      photoKey: '',
      galleryKeys: [] as string[]
    };

    try {
      // Subir imagen principal
      if (mainImage) {
        const photoKey = `projects/${Date.now()}-${mainImage.name}`;
        await uploadData({
          key: photoKey,
          data: mainImage,
          options: {
            contentType: mainImage.type
          }
        }).result;
        uploadResults.photoKey = photoKey;
      }

      // Subir galería
      if (galleryImages.length > 0) {
        const galleryPromises = galleryImages.map(async (file, index) => {
          const galleryKey = `projects/gallery/${Date.now()}-${index}-${file.name}`;
          await uploadData({
            key: galleryKey,
            data: file,
            options: {
              contentType: file.type
            }
          }).result;
          return galleryKey;
        });

        uploadResults.galleryKeys = await Promise.all(galleryPromises);
      }

      return uploadResults;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Error al subir las imágenes');
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
        throw new Error('El título es requerido');
      }
      if (!formData.description.trim()) {
        throw new Error('La descripción es requerida');
      }

      // Subir archivos
      const uploadResults = await uploadFiles();

      // Crear el proyecto en la base de datos
      const result = await client.models.Projects.create({
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

      setSuccess('¡Proyecto creado exitosamente!');
      
      // Redirigir a la lista de proyectos después de 2 segundos
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/projects'));
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = false; // Temporal para testing

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
      >        {/* Header */}
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
                {t('admin.createProject')}
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
                  Información Básica
                </Heading>
                
                <Flex direction="column" gap="medium">
                  <TextField
                    label="Título *"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    placeholder="Ej: Sistema de Gestión de Proyectos"
                  />

                  <TextField
                    label="Slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="Se genera automáticamente del título"
                    descriptiveText="URL amigable para el proyecto"
                  />

                  <TextAreaField
                    label="Descripción *"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={4}
                    placeholder="Descripción detallada del proyecto..."
                  />

                  <TextAreaField
                    label="Meta Descripción (SEO)"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    rows={2}
                    maxLength={160}
                    placeholder="Descripción breve para motores de búsqueda (máx. 160 caracteres)"
                  />

                  <TextField
                    label="Lugar"
                    value={formData.place}
                    onChange={(e) => handleInputChange('place', e.target.value)}
                    placeholder="Ej: Universidad, Empresa, Remoto"
                  />
                </Flex>
              </Card>

              {/* URLs y Enlaces */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  Enlaces
                </Heading>
                
                <Flex direction="column" gap="medium">
                  <TextField
                    label="URL del Proyecto"
                    value={formData.projectUrl}
                    onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                    placeholder="https://ejemplo.com"
                    type="url"
                  />

                  <TextField
                    label="URL de GitHub"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/usuario/proyecto"
                    type="url"
                  />

                  <TextField
                    label="URL de Demo"
                    value={formData.demoUrl}
                    onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                    placeholder="https://demo.ejemplo.com"
                    type="url"
                  />
                </Flex>
              </Card>

              {/* Imagen Principal */}
              <Card variation="outlined" padding="large">                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  Imagen Principal
                </Heading>

                {!mainImagePreview ? (
                  <FileUploadInput onFileSelect={handleMainImageFile}>
                    <div
                      style={{
                        display: 'block',
                        padding: '2rem',
                        border: `2px dashed ${isDark ? '#444' : '#ccc'}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5'
                      }}
                    >
                      <Flex direction="column" alignItems="center" gap="medium">
                        <ImageIcon size={48} color={isDark ? '#888' : '#666'} />
                        <Text color={isDark ? 'font.secondary' : 'font.primary'}>
                          Haz clic para subir imagen principal (máx. 5MB)
                        </Text>
                      </Flex>
                    </div>                  </FileUploadInput>
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
                    />
                    <Button
                      type="button"
                      variation="destructive"
                      size="small"
                      position="absolute"
                      top="8px"
                      right="8px"
                      onClick={removeMainImage}
                    >
                      <X size={16} />
                    </Button>
                  </View>
                )}
              </Card>{/* Galería */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  Galería (máx. 10 imágenes)
                </Heading>

                <FileUploadInput 
                  onMultipleFilesSelect={handleGalleryImageFiles}
                  multiple={true}
                >
                  <div
                    style={{
                      display: 'block',
                      padding: '1.5rem',
                      border: `2px dashed ${isDark ? '#444' : '#ccc'}`,
                      borderRadius: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                      marginBottom: '1rem'
                    }}
                  >
                    <Flex direction="column" alignItems="center" gap="medium">
                      <Plus size={24} color={isDark ? '#888' : '#666'} />
                      <Text color={isDark ? 'font.secondary' : 'font.primary'}>
                        Agregar imágenes a la galería
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
                          variation="destructive"
                          size="small"
                          position="absolute"
                          top="4px"
                          right="4px"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X size={12} />
                        </Button>
                      </View>
                    ))}
                  </Flex>
                )}
              </Card>

              {/* Skills */}
              <Card variation="outlined" padding="large">
                <Heading level={4} color={isDark ? 'white' : 'black'} marginBottom="medium">
                  Habilidades/Tecnologías
                </Heading>
                  <Flex gap="small" marginBottom="medium">
                  <TextField
                    label="Habilidad"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Ej: React, Node.js, AWS"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    flex="1"
                  />
                  <Button type="button" onClick={addSkill}>
                    Agregar
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
                    label="Tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Ej: web, mobile, cloud"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    flex="1"
                  />
                  <Button type="button" onClick={addTag}>
                    Agregar
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
                  Configuración
                </Heading>
                
                <Flex direction="column" gap="medium">
                  <SelectField
                    label="Categoría"
                    value={formData.categories}
                    onChange={(e) => handleInputChange('categories', e.target.value)}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Professional">Profesional</option>
                    <option value="Academic">Académico</option>
                    <option value="Research">Investigación</option>
                    <option value="Hackathon">Hackathon</option>
                  </SelectField>

                  <SelectField
                    label="Estado"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="Draft">Borrador</option>
                    <option value="Published">Publicado</option>
                    <option value="Archived">Archivado</option>
                  </SelectField>

                  <Flex gap="large">
                    <TextField
                      label="Fecha de Inicio"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />

                    <TextField
                      label="Fecha de Fin"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </Flex>

                  <SwitchField
                    label="Proyecto Destacado"
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
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variation="primary"
                  isDisabled={isLoading || !formData.title.trim() || !formData.description.trim()}
                  isLoading={isLoading}
                  loadingText="Creando..."
                >
                  <Save size={16} />
                  Crear Proyecto
                </Button>
              </Flex>
            </Flex>
          </form>        </Flex>
      </Card>
    </View>
  );
}

// Memorizar el componente para evitar re-renders innecesarios
const CreateProjectClientMemo = memo(CreateProjectClient);
CreateProjectClientMemo.displayName = 'CreateProjectClient';

export default CreateProjectClientMemo;
