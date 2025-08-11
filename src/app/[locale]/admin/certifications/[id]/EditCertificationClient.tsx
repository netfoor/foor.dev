'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  Badge,
  Alert,
  Loader
} from '@aws-amplify/ui-react';
import '../../admin.css';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  X,
  Plus,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';
import S3Cleanup from '@/lib/utils/s3-cleanup';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import { FileUploadInput } from '../../projects/new/FileUploadInput';

// Tipos para la certificación
type Certification = Schema["Certifications"]["type"];

interface EditCertificationClientProps {
  locale: SupportedLocale;
  certificationId: string;
}

const EditCertificationClient: React.FC<EditCertificationClientProps> = ({ 
  locale, 
  certificationId 
}) => {
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    description: '',
    skills: [] as string[],
    category: 'Technology',
    slug: '',
  });

  // Estados de imagen
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newCertificateImage, setNewCertificateImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');

  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

  // Generar slug automáticamente desde el título
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Cargar datos de la certificación
  useEffect(() => {
    const loadCertification = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const client = generateClient<Schema>();
        const response = await client.models.Certifications.get({ 
          id: certificationId
        }, { authMode: 'userPool' });
        
        if (!response.data) {
          throw new Error(t('certifications.certification_not_found'));
        }

        const cert = response.data;
        setCertification(cert);
        
        // Llenar el formulario con los datos existentes
        setFormData({
          title: cert.title || '',
          issuer: cert.issuer || '',
          issueDate: cert.issueDate || '',
          expirationDate: cert.expirationDate || '',
          credentialId: cert.credentialId || '',
          credentialUrl: cert.credentialUrl || '',
          description: cert.content || '',
          skills: (cert.skills ? cert.skills.filter((s): s is string => s !== null) : []),
          category: cert.category || 'Technology',
          slug: cert.slug || '',
        });

        // Cargar imagen actual si existe
        if (cert.photoKey) {
          try {
            const normalizedPath = cert.photoKey.startsWith('public/') 
              ? cert.photoKey.slice(7) 
              : cert.photoKey;
            const imageUrl = await getUrl({ path: normalizedPath });
            setCurrentImageUrl(imageUrl.url.toString());
          } catch (imgError) {
            console.warn('Error loading current image:', imgError);
          }
        }
        
      } catch (err) {
        console.error('Error loading certification:', err);
        setError(t('certifications.error_loading_certification'));
      } finally {
        setLoading(false);
      }
    };

    if (certificationId) {
      loadCertification();
    }
  }, [certificationId, t]);

  // Manejar cambios en campos del formulario
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generar slug cuando cambia el título
      if (field === 'title') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  }, [generateSlug]);

  // Manejar selección de nueva imagen
  const handleNewImageSelect = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError(t('certifications.image_size_error'));
      return;
    }

    setNewCertificateImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [t]);

  // Remover nueva imagen
  const removeNewImage = useCallback(() => {
    setNewCertificateImage(null);
    setNewImagePreview(null);
  }, []);

  // Agregar skill
  const addSkill = useCallback(() => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      handleInputChange('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  }, [skillInput, formData.skills, handleInputChange]);

  // Remover skill
  const removeSkill = useCallback((skillToRemove: string) => {
    handleInputChange('skills', formData.skills.filter(skill => skill !== skillToRemove));
  }, [formData.skills, handleInputChange]);

  // Subir imagen
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const key = await uploadImageWithMetadata(file, certificationId, 'Certifications', 'photoKey');
      return key;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Error uploading certificate image');
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certification) return;

    // Validaciones
    if (!formData.title.trim()) {
      setError(t('certifications.error_title_required'));
      return;
    }

    if (!formData.issuer.trim()) {
      setError(t('certifications.error_issuer_required'));
      return;
    }

    if (!formData.issueDate) {
      setError(t('certifications.error_issue_date_required'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const client = generateClient<Schema>();

      // Manejar imagen
      let photoKey = certification.photoKey;
      
      if (newCertificateImage) {
        // Eliminar imagen anterior si existe (original + WEBP) usando utilidad centralizada
        if (certification.photoKey) {
          try {
            console.log('🗑️ Deleting old certification image:', certification.photoKey);
            await S3Cleanup.deleteSingleFile(certification.photoKey);
            console.log('✅ Old certification image deleted successfully');
          } catch (removeError) {
            console.error('❌ Error removing old image from S3:', removeError);
          }
        }
        
        // Subir nueva imagen con metadatos para optimización
        photoKey = await uploadImage(newCertificateImage);
      }

      // Normalizar clave con prefijo legacy 'public/' antes de guardar
      const normalizedPhotoKey = photoKey && photoKey.startsWith('public/')
        ? photoKey.slice(7)
        : photoKey;

      // Actualizar certificación
      const updateData = {
        id: certification.id,
        title: formData.title.trim(),
        issuer: formData.issuer.trim(),
        issueDate: formData.issueDate,
        expirationDate: formData.expirationDate || null,
        credentialId: formData.credentialId?.trim() || null,
        credentialUrl: formData.credentialUrl?.trim() || null,
        content: formData.description?.trim() || null,
        photoKey: normalizedPhotoKey,
        skills: formData.skills,
        category: formData.category as "Technology" | "Business" | "Arts" | "Health" | "Languages",
        slug: formData.slug || generateSlug(formData.title),
      };

      const response = await client.models.Certifications.update(updateData, { authMode: 'userPool' });
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      console.log('✅ Certificación actualizada exitosamente');
      router.push(getLocalizedPath('/admin/certifications'));
      
    } catch (err) {
      console.error('Error updating certification:', err);
      setError(`${t('certifications.error_updating_certification')}: ${err instanceof Error ? err.message : t('certifications.unknown_error')}`);
    } finally {
      setSaving(false);
    }
  };

  // Estilos CSS dinámicos
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

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
        <Loader size="large" />
        <Text>{t('certifications.loading_certification')}</Text>
      </Flex>
    );
  }

  if (!certification) {
    return (
      <Alert variation="error">
        {t('certifications.certification_not_found')}
      </Alert>
    );
  }

  return (
    <View style={cssVariables}>
      <style dangerouslySetInnerHTML={{ __html: `
        .edit-certification-form .amplify-field {
          margin-bottom: 1rem;
        }
        
        .edit-certification-form .amplify-field > label {
          color: var(--form-label-color) !important;
          font-weight: 600 !important;
          margin-bottom: 0.5rem !important;
          display: block !important;
          font-size: 0.95rem !important;
        }
        
        .edit-certification-form .amplify-input,
        .edit-certification-form .amplify-textarea,
        .edit-certification-form .amplify-select select {
          background-color: var(--form-input-bg) !important;
          border: 1px solid var(--form-input-border) !important;
          color: var(--form-input-text) !important;
          border-radius: 6px !important;
          padding: 0.75rem !important;
          font-size: 0.9rem !important;
        }
        
        .edit-certification-form .amplify-input::placeholder,
        .edit-certification-form .amplify-textarea::placeholder {
          color: var(--form-placeholder-color) !important;
          opacity: 0.8 !important;
          font-weight: 400 !important;
        }
        
        .edit-certification-form .amplify-input:focus,
        .edit-certification-form .amplify-textarea:focus,
        .edit-certification-form .amplify-select select:focus {
          border-color: var(--form-focus-border) !important;
          box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
          outline: none !important;
        }
        
        .edit-certification-form .amplify-select select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 0.65rem;
          padding-right: 2.5rem !important;
        }
      ` }} />

      {/* Header */}
      <Flex direction="column" gap="1rem" marginBottom="2rem">
        <Flex alignItems="center" gap="1rem">
          <Button
            variation="link"
            onClick={() => router.push(getLocalizedPath('/admin/certifications'))}
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
            {t('certifications.edit_certification_title', { title: certification.title })}
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
      <form onSubmit={handleSubmit} className="edit-certification-form">
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
                {t('certifications.basic_info')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <TextField
                  label={`${t('certifications.title_label')} *`}
                  placeholder={t('certifications.title_placeholder')}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />

                <TextField
                  label={t('certifications.slug_label')}
                  placeholder={t('certifications.slug_placeholder')}
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  descriptiveText={t('certifications.slug_description')}
                />

                <TextField
                  label={`${t('certifications.issuer_label')} *`}
                  placeholder={t('certifications.issuer_placeholder')}
                  value={formData.issuer}
                  onChange={(e) => handleInputChange('issuer', e.target.value)}
                  required
                />

                <TextAreaField
                  label={t('certifications.description_label')}
                  placeholder={t('certifications.description_placeholder')}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </Flex>
            </View>
          </Card>

          {/* Fechas y Credenciales */}
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
                {t('certifications.dates_credentials')}
              </Heading>

              <Flex direction={{ base: 'column', medium: 'row' }} gap="1rem">
                <TextField
                  label={`${t('certifications.issue_date_label')} *`}
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  required
                />

                <TextField
                  label={t('certifications.expiration_date_label')}
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                />
              </Flex>

              <Flex direction="column" gap="1rem" marginTop="1rem">
                <TextField
                  label={t('certifications.credential_id_label')}
                  placeholder={t('certifications.credential_id_placeholder')}
                  value={formData.credentialId}
                  onChange={(e) => handleInputChange('credentialId', e.target.value)}
                />

                <TextField
                  label={t('certifications.credential_url_label')}
                  placeholder={t('certifications.credential_url_placeholder')}
                  value={formData.credentialUrl}
                  onChange={(e) => handleInputChange('credentialUrl', e.target.value)}
                />
              </Flex>
            </View>
          </Card>

          {/* Imagen del Certificado */}
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
                {t('certifications.certificate_image')}
              </Heading>

              {/* Imagen actual */}
              {currentImageUrl && !newImagePreview && (
                <View marginBottom="1rem">
                  <Text fontSize="0.875rem" marginBottom="0.5rem" style={{
                    color: mode === 'dark' ? '#CBD5E1' : '#64748B'
                  }}>
                    {t('certifications.current_image')}
                  </Text>
                  <img
                    src={currentImageUrl}
                    alt="Current certificate"
                    style={{
                      width: '200px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)'
                    }}
                  />
                </View>
              )}

              {/* Nueva imagen preview */}
              {newImagePreview && (
                <View marginBottom="1rem">
                  <Text fontSize="0.875rem" marginBottom="0.5rem" style={{
                    color: mode === 'dark' ? '#CBD5E1' : '#64748B'
                  }}>
                    {t('certifications.new_image')}
                  </Text>
                  <View style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={newImagePreview}
                      alt="New certificate preview"
                      style={{
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)'
                      }}
                    />
                    <Button
                      onClick={removeNewImage}
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
              )}

              {/* Upload nueva imagen */}
              <FileUploadInput
                onFileSelect={handleNewImageSelect}
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
                  <View padding="1.5rem" textAlign="center">
                    <Award size={32} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} style={{ margin: '0 auto 0.5rem' }} />
                    <Text style={{
                      color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {t('certifications.change_certificate_image')}
                    </Text>
                  </View>
                </Card>
              </FileUploadInput>
            </View>
          </Card>

          {/* Skills */}
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
                {t('certifications.skills')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <Flex gap="0.5rem">
                  <TextField
                    label={t('certifications.skill_placeholder')}
                    labelHidden
                    placeholder={t('certifications.skill_placeholder')}
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
                    {t('certifications.add')}
                  </Button>
                </Flex>

                {formData.skills.length > 0 && (
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

          {/* Categoría */}
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
                {t('certifications.category')}
              </Heading>

              <SelectField
                label={t('certifications.category_label')}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="Technology">{t('certifications.category_technology')}</option>
                <option value="Business">{t('certifications.category_business')}</option>
                <option value="Arts">{t('certifications.category_arts')}</option>
                <option value="Health">{t('certifications.category_health')}</option>
                <option value="Languages">{t('certifications.category_languages')}</option>
              </SelectField>
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
            onClick={() => router.push(getLocalizedPath('/admin/certifications'))}
            style={{
              color: mode === 'dark' ? '#9CA3AF' : '#6B7280'
            }}
          >
            {t('certifications.cancel')}
          </Button>

          <Button
            type="submit"
            variation="primary"
            isLoading={saving}
            loadingText={t('certifications.saving')}
            style={{
              backgroundColor: mode === 'dark' ? '#22C55E' : '#16A34A',
              minWidth: '150px'
            }}
          >
            <Save size={16} style={{ marginRight: '0.5rem' }} />
            {t('certifications.save_changes')}
          </Button>
        </Flex>
      </form>
    </View>
  );
};

export default EditCertificationClient;
