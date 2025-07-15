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
import { uploadData, remove, getUrl } from 'aws-amplify/storage';
import { v4 as uuidv4 } from 'uuid';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import { FileUploadInput } from '../../recognitions/new/FileUploadInput';

// Types for Publications model
type Publication = Schema["SocialPublications"]["type"];

// Publication source and type options
const SOURCE_OPTIONS = ['LinkedIn', 'Twitter', 'GitHub', 'Blog', 'Youtube'];
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
      // Normalize path - remove 'public/' if exists (for Gen 1 compatibility)
      const normalizedPath = photoKey.startsWith('public/') ? photoKey.slice(7) : photoKey;
      
      await remove({
        path: normalizedPath,
      });
      
      setPhotoKey(null);
      setPhotoPreview(null);
      setPhotoFile(null);
      
      console.log('✅ Photo deleted from S3:', normalizedPath);
      
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
    
    try {
      setLoading(true);
      setError(null);
      
      const client = generateClient<Schema>();
      let newPhotoKey = photoKey;
      
      // Upload new photo to S3 if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const s3Key = `publications/${fileName}`;
        
        await uploadData({
          path: s3Key,
          data: photoFile,
          options: {
            contentType: photoFile.type,
          }
        });
        
        // If we had a previous photo and uploaded a new one, delete the old one
        if (photoKey && photoKey !== s3Key) {
          try {
            const normalizedPath = photoKey.startsWith('public/') ? photoKey.slice(7) : photoKey;
            await remove({ path: normalizedPath });
            console.log('✅ Old photo deleted from S3:', normalizedPath);
          } catch (err) {
            console.error('Error deleting old photo (non-critical):', err);
          }
        }
        
        newPhotoKey = s3Key;
        console.log('✅ New photo uploaded to S3:', s3Key);
      }
      
      // Update publication in DynamoDB
      const updatedPublication = await client.models.SocialPublications.update({
        id: publicationId,
        title,
        description,
        source: source as any,
        type: type as any,
        publicationDate: new Date(publicationDate).toISOString(),
        publicationUrl,
        photoKey: newPhotoKey || undefined,
      });
      
      console.log('✅ Publication updated:', updatedPublication.data?.id);
      
      setSuccess(true);
      
      // Navigate to admin recognitions list after successful update
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/recognitions'));
      }, 1500);
      
    } catch (err) {
      console.error('Error updating publication:', err);
      setError(`${t('error_updating')}: ${err instanceof Error ? err.message : t('unknown_error')}`);
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

  return (
    <main className="p-6">
      <style>{editFormStyles}</style>
      
      {/* Back button */}
      <Button
        size="small"
        variation="link"
        onClick={() => router.push(getLocalizedPath('/admin/recognitions'))}
        marginBottom="1rem"
      >
        <ArrowLeft size={16} />
        <Text>{t('back_to_list')}</Text>
      </Button>
      
      <Card>
        <Flex direction="column" gap="16px">
          <AmplifyHeading level={1} marginBottom="1rem">
            <Flex alignItems="center" gap="8px">
              <BookOpen size={24} />
              <Text>{t('publications.edit')}</Text>
            </Flex>
          </AmplifyHeading>
          
          {error && (
            <Alert variation="error" isDismissible={false}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variation="success" isDismissible={false}>
              {t('publications.update_success')}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="edit-form">
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
            
            <Divider marginTop="2rem" marginBottom="2rem" />
            
            {/* Submit button */}
            <Flex justifyContent="flex-end" gap="1rem">
              <Button
                type="button"
                onClick={() => router.push(getLocalizedPath('/admin/recognitions'))}
                variation="link"
              >
                {t('cancel')}
              </Button>
              
              <Button
                type="submit"
                variation="primary"
                isDisabled={loading || success}
              >
                {loading ? (
                  <Flex alignItems="center" gap="8px">
                    <Loader size="small" />
                    <Text>{t('saving')}</Text>
                  </Flex>
                ) : (
                  <Flex alignItems="center" gap="8px">
                    <Save size={16} />
                    <Text>{t('save')}</Text>
                  </Flex>
                )}
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </main>
  );
};

// Heading component
const Heading = ({ level, children, ...props }: { level: 1 | 2 | 3 | 4 | 5 | 6, children: React.ReactNode, [key: string]: any }) => {
  const Component = `h${level}` as keyof React.JSX.IntrinsicElements;
  return React.createElement(Component, props, children);
};

export default EditPublicationClient;
