'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card, 
  Heading as AmplifyHeading,
  TextField,
  TextAreaField,
  SelectField,
  Alert,
  Divider,
  Loader
} from '@aws-amplify/ui-react';
import '../../admin.css';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  BookOpen,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
// Switch to helpers: keep getUrl for previews, use uploadImageWithMetadata + S3Cleanup
import { getUrl } from 'aws-amplify/storage';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';
import S3Cleanup from '@/lib/utils/s3-cleanup';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import { FileUploadInput } from '../../recognitions/new/FileUploadInput';
import { auth } from '../../../../../../amplify/auth/resource';

// Types for Publications model
type Publication = Schema["SocialPublications"]["type"];

// Publication source and type options
const SOURCE_OPTIONS = ['LinkedIn', 'Twitter', 'GitHub', 'Blog', 'Youtube', 'Instagram', 'Facebook'];
const TYPE_OPTIONS = [
  'Article', 'Blog', 'Video', 'Podcast', 'Book', 'Course', 
  'Conference', 'Presentation', 'Research', 'Workshop', 'Other'
];

// Custom styles for consistent form appearance
const editFormStyles = `
  .edit-form .amplify-field {
    margin-bottom: 1rem;
  }
  
  .edit-form .amplify-field > label {
    color: var(--form-label-color) !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
    font-size: 0.95rem !important;
  }
  
  .edit-form .amplify-input,
  .edit-form .amplify-textarea,
  .edit-form .amplify-select select {
    background-color: var(--form-input-bg) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-text) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.9rem !important;
  }
  
  .edit-form .amplify-input::placeholder,
  .edit-form .amplify-textarea::placeholder {
    color: var(--form-placeholder-color) !important;
    opacity: 0.8 !important;
    font-weight: 400 !important;
  }
  
  .edit-form .amplify-input:focus,
  .edit-form .amplify-textarea:focus,
  .edit-form .amplify-select select:focus {
    border-color: var(--form-focus-border) !important;
    box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
    outline: none !important;
  }
  
  .edit-form .amplify-field-group__control .amplify-field__description {
    color: var(--form-description-color) !important;
    font-size: 0.8rem !important;
    margin-top: 0.25rem !important;
    font-weight: 500 !important;
  }

  .edit-form .amplify-select select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.65rem;
    padding-right: 2.5rem !important;
  }
  
  .image-preview {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    background-color: var(--amplify-colors-background-secondary);
    border: 1px dashed var(--amplify-colors-border-secondary);
    width: 100%;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .image-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
  }
  
  .date-field {
    width: 100%;
    display: block;
  }
  
  .date-field input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--amplify-colors-border-primary);
    border-radius: 6px;
    font-size: 0.9rem;
    background-color: var(--form-input-bg);
    color: var(--form-input-text);
  }
  
  .date-field input:focus {
    border-color: var(--form-focus-border);
    box-shadow: 0 0 0 2px var(--form-focus-shadow);
    outline: none;
  }

  /* Responsive design improvements */
  @media (max-width: 768px) {
    .edit-form .amplify-flex {
      flex-direction: column !important;
    }
    
    .edit-form .amplify-button {
      width: 100% !important;
      margin-top: 0.5rem !important;
    }
  }

  /* (Reverted) No custom overrides for FileUploadInput here */
`;

interface EditPublicationClientProps {
  locale: SupportedLocale;
  publicationId: string;
}

const EditPublicationClient: React.FC<EditPublicationClientProps> = ({ locale, publicationId }) => {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [type, setType] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [publicationUrl, setPublicationUrl] = useState('');
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

  // Fetch publication data
  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setInitialLoading(true);
        
        const client = generateClient<Schema>();
        const response = await client.models.SocialPublications.get({
          id: publicationId,
        });
        
        if (!response.data) {
          throw new Error(t('publications.not_found'));
        }
        
        const data = response.data;
        setPublication(data);
        
        // Populate form fields
        setTitle(data.title || '');
        setDescription(data.description || '');
        setSource(data.source || '');
        setType(data.type || '');
        setPublicationDate(data.publicationDate ? new Date(data.publicationDate).toISOString().split('T')[0] : '');
        setPublicationUrl(data.publicationUrl || '');
        setPhotoKey(data.photoKey || null);
        
        // Get image URL if exists
        if (data.photoKey) {
          await loadPhotoPreview(data.photoKey);
        }
        
      } catch (err) {
        console.error('Error fetching publication:', err);
        setError(`${t('publications.error_loading')}: ${err instanceof Error ? err.message : t('unknown_error')}`);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchPublication();
  }, [publicationId, t]);

  // Load photo preview from S3
  const loadPhotoPreview = async (key: string) => {
    try {
      // Normalize path - remove 'public/' if exists (for Gen 1 compatibility)
      const normalizedPath = key.startsWith('public/') ? key.slice(7) : key;
      
      const url = await getUrl({
        path: normalizedPath,
      });
      
      setPhotoPreview(url.url.toString());
    } catch (err) {
      console.error('Error loading photo preview:', err);
      setPhotoPreview(null);
    }
  };

  // Handle file selection for photo
  const handlePhotoChange = useCallback((file: File | null) => {
    setPhotoFile(file);
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (photoKey) {
      // If no new file selected but we have an existing photo, reload that preview
      loadPhotoPreview(photoKey);
    } else {
      setPhotoPreview(null);
    }
  }, [photoKey]);

  // Handle deleting the existing photo
  const handleDeletePhoto = async () => {
    if (!photoKey) return;
    
    if (!confirm(t('publications.confirm_delete_photo'))) {
      return;
    }
    
    try {
      await S3Cleanup.deleteSingleFile(photoKey);
      setPhotoKey(null);
      setPhotoPreview(null);
      setPhotoFile(null);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(`${t('publications.error_deleting_photo')}: ${err instanceof Error ? err.message : t('unknown_error')}`);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title || !description || !source || !type || !publicationDate || !publicationUrl) {
      setError(t('required_fields'));
      return;
    }

    // Validate source and type values
    if (!SOURCE_OPTIONS.includes(source)) {
      setError(`Invalid source: ${source}. Must be one of: ${SOURCE_OPTIONS.join(', ')}`);
      return;
    }

    if (!TYPE_OPTIONS.includes(type)) {
      setError(`Invalid type: ${type}. Must be one of: ${TYPE_OPTIONS.join(', ')}`);
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(publicationDate)) {
      setError('Invalid date format. Please use YYYY-MM-DD format.');
      return;
    }

    // Validate URL format
    try {
      new URL(publicationUrl);
    } catch {
      setError('Invalid publication URL format.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const client = generateClient<Schema>({ authMode: 'userPool' });
      let newPhotoKey = photoKey;
      
      // Upload new photo to S3 if provided (with metadata for optimization)
      if (photoFile) {
        // If we had a previous photo and we're uploading a new one, delete the old one (original + webp)
        if (photoKey) {
          try { await S3Cleanup.deleteSingleFile(photoKey); } catch {}
        }
        newPhotoKey = await uploadImageWithMetadata(
          photoFile,
          publicationId,
          'SocialPublications',
          'photoKey'
        );
        console.log('✅ New photo uploaded to S3 with metadata:', newPhotoKey);
      }
      
      // Update publication in DynamoDB
      const updateData = {
        id: publicationId,
        title,
        description,
        source: source as "LinkedIn" | "Twitter" | "GitHub" | "Blog" | "Youtube" | "Instagram" | "Facebook",
        type: type as "Article" | "Blog" | "Video" | "Podcast" | "Book" | "Course" | "Conference" | "Presentation" | "Research" | "Workshop" | "Other",
        publicationDate,
        publicationUrl,
        ...(newPhotoKey && { photoKey: newPhotoKey })
      };
      
      const updatedPublication = await client.models.SocialPublications.update(updateData, { authMode: 'userPool'});
      
      if (updatedPublication.errors && updatedPublication.errors.length > 0) {
        throw new Error(`DynamoDB Error: ${updatedPublication.errors.map(e => e.message).join(', ')}`);
      }
      
      if (!updatedPublication.data) {
        throw new Error('Update operation returned no data. Publication may not have been updated.');
      }
      
      setSuccess(true);
      setTimeout(() => { router.push(getLocalizedPath('/admin/recognitions')); }, 1500);
    } catch (err) {
      console.error('❌ Error updating publication:', err);
      
      // Enhanced error reporting
      if (err instanceof Error) {
        console.error('❌ Error details:', JSON.stringify({
          message: err.message,
          stack: err.stack,
          formData: { title, description, source, type, publicationDate, publicationUrl }
        }, null, 2));
        
        // Check for specific error types
        if (err.message.includes('access')) {
          setError(`${t('error_updating')}: Access denied. Please check your permissions.`);
        } else if (err.message.includes('validation')) {
          setError(`${t('error_updating')}: Validation error. Please check your input values.`);
        } else if (err.message.includes('DynamoDB Error')) {
          setError(`${t('error_updating')}: Database error - ${err.message}`);
        } else {
          setError(`${t('error_updating')}: ${err.message}`);
        }
      } else {
        setError(`${t('error_updating')}: ${t('unknown_error')}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Flex direction="column" alignItems="center" justifyContent="center" padding="2rem">
        <Loader size="large" />
        <Text marginTop="1rem">{t('loading')}</Text>
      </Flex>
    );
  }

  if (!publication && !initialLoading) {
    return (
      <Alert variation="error" isDismissible={false}>
        {error || t('publications.not_found')}
      </Alert>
    );
  }

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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: editFormStyles }} />
      <View 
        style={{
          padding: '1.5rem',
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          minHeight: '100vh',
          ...cssVariables
        }}
        className="edit-form"
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
        >
          <Flex direction="column" gap="large">
            {/* Header */}
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
                  onClick={() => router.push(getLocalizedPath('/admin/recognitions'))}
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
                  {t('publications.edit')}
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
                {t('publications.update_success')}
              </Alert>
            )}
          
            {/* Formulario */}
            <form onSubmit={handleSubmit} className="edit-form">
              <Flex direction="column" gap="large">
                <Flex direction={{ base: 'column', large: 'row' }} gap="2rem">
                  {/* Left column - Photo upload */}
                  <View width={{ base: '100%', large: '35%' }}>
                    <Text fontWeight="bold" marginBottom="0.5rem">
                      {t('publications.photo')}
                    </Text>
                    
                    <div className="image-preview">
                      {photoPreview && (
                        <>
                          <img src={photoPreview} alt="Publication Preview" />
                          <div className="image-actions">
                            <Button
                              size="small"
                              variation="destructive"
                              onClick={handleDeletePhoto}
                              isDisabled={!photoKey || loading}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {!photoPreview && (
                        <Flex direction="column" alignItems="center" gap="8px">
                          <BookOpen size={48} />
                          <Text>{t('publications.add_photo')}</Text>
                        </Flex>
                      )}
                    </div>
                    
                    <FileUploadInput
                      id="publication-photo"
                      onChange={handlePhotoChange}
                      accept="image/*"
                      label={photoKey ? t('publications.change_photo') : t('publications.upload_photo')}
                      
                    />
                    
                    <Text fontSize="0.8rem" color="var(--amplify-colors-font-tertiary)" marginTop="0.5rem">
                      {t('publications.photo_description')}
                    </Text>
                  </View>
                  
                  {/* Right column - Publication details */}
                  <View width={{ base: '100%', large: '65%' }}>
                    <TextField
                      label={t('publications.title_label')}
                      placeholder={t('publications.title_placeholder')}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      isRequired
                    />
                    
                    <TextAreaField
                      label={t('publications.description_label')}
                      placeholder={t('publications.description_placeholder')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      isRequired
                    />
                    
                    <SelectField
                      label={t('publications.source_label')}
                      placeholder={t('publications.source_placeholder')}
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      isRequired
                    >
                      <option value="">{t('publications.select_source')}</option>
                      {SOURCE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                    
                    <SelectField
                      label={t('publications.type_label')}
                      placeholder={t('publications.type_placeholder')}
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      isRequired
                    >
                      <option value="">{t('publications.select_type')}</option>
                      {TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                    
                    <div>
                      <label htmlFor="publicationDate" className="amplify-field">
                        <span>{t('publications.date_label')} *</span>
                        <div className="date-field">
                          <input
                            id="publicationDate"
                            type="date"
                            value={publicationDate}
                            onChange={(e) => setPublicationDate(e.target.value)}
                            required
                          />
                        </div>
                      </label>
                    </div>
                    
                    <TextField
                      label={t('publications.url_label')}
                      placeholder={t('publications.url_placeholder')}
                      value={publicationUrl}
                      onChange={(e) => setPublicationUrl(e.target.value)}
                      isRequired
                    />
                  </View>
                </Flex>
                
                <Divider />

                {/* Botones de acción */}
                <Flex 
                  direction={{ base: 'column', medium: 'row' }}
                  justifyContent="space-between" 
                  gap="medium"
                >
                  <Button
                    onClick={() => router.push(getLocalizedPath('/admin/recognitions'))}
                    disabled={loading}
                    style={{
                      backgroundColor: 'transparent',
                      color: isDark ? '#CBD5E1' : '#64748B',
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '0.75rem 1.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    {t('cancel')}
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading || success || !title || !description || !source || !type || !publicationDate || !publicationUrl}
                    style={{
                      backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.75rem 1.5rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: (loading || success || !title || !description || !source || !type || !publicationDate || !publicationUrl) ? 0.6 : 1,
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
                    {loading ? t('saving') : t('save')}
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
        </Card>
      </View>
    </>
  );
};

// Heading component
const Heading = ({ level, children, ...props }: { level: 1 | 2 | 3 | 4 | 5 | 6, children: React.ReactNode, [key: string]: any }) => {
  const Component = `h${level}` as keyof React.JSX.IntrinsicElements;
  return React.createElement(Component, props, children);
};

export default EditPublicationClient;
