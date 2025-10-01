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
  SelectField,
  Alert,
  Heading
} from '@aws-amplify/ui-react';
import '../../admin.css';
import { 
  ArrowLeft, 
  Save, 
  BookOpen,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { FileUploadInput } from '../../projects/new/FileUploadInput';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';

// Publication source and type options
const SOURCE_OPTIONS = ['LinkedIn', 'Twitter', 'GitHub', 'Blog', 'Youtube', 'Instagram', 'Facebook'];
const TYPE_OPTIONS = [
  'Article', 'Blog', 'Video', 'Podcast', 'Book', 'Course', 
  'Conference', 'Presentation', 'Research', 'Workshop', 'Other'
];

interface CreatePublicationClientProps {}

const CreatePublicationClient: React.FC<CreatePublicationClientProps> = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [type, setType] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [publicationUrl, setPublicationUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

  // Handle file selection for photo
  const handlePhotoChange = useCallback((file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('publications.image_size_error') || 'Image cannot be larger than 5MB');
      return;
    }

    setPhotoFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [t]);

  // Remove photo
  const removePhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      setError(t('publications.error_title_required') || 'Title is required');
      return;
    }

    if (!description.trim()) {
      setError(t('publications.error_description_required') || 'Description is required');
      return;
    }

    if (!source) {
      setError(t('publications.error_source_required') || 'Source is required');
      return;
    }

    if (!type) {
      setError(t('publications.error_type_required') || 'Type is required');
      return;
    }

    if (!publicationDate) {
      setError(t('publications.error_date_required') || 'Publication date is required');
      return;
    }

    if (!publicationUrl.trim()) {
      setError(t('publications.error_url_required') || 'Publication URL is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const client = generateClient<Schema>();
      
      // First create the publication without the image
      const createData = {
        title: title.trim(),
        description: description.trim(),
        source: source as "LinkedIn" | "Twitter" | "GitHub" | "Blog" | "Youtube" | "Instagram" | "Facebook",
        type: type as "Article" | "Blog" | "Video" | "Podcast" | "Book" | "Course" | "Conference" | "Presentation" | "Research" | "Workshop" | "Other",
        publicationDate,
        publicationUrl: publicationUrl.trim()
      };
      
      const newPublication = await client.models.SocialPublications.create(createData, { authMode: 'userPool'});
      
      if (newPublication.errors) {
        throw new Error(newPublication.errors[0].message);
      }
      
      if (!newPublication.data) {
        throw new Error(t('publications.error_creating') || 'Error creating publication');
      }
      
      const publicationId = newPublication.data.id;
      
      // Upload photo to S3 if provided
      if (photoFile && publicationId) {
        const photoKey = await uploadImageWithMetadata(
          photoFile, 
          publicationId, 
          'SocialPublications', 
          'photoKey'
        );
        
        // Update the publication with the photoKey
        await client.models.SocialPublications.update({
          id: publicationId,
          photoKey
        }, { authMode: 'userPool' });
      }
      
      
      // Navigate to admin publications list after successful creation
      router.push(getLocalizedPath('/admin/recognitions'));
      
    } catch (err) {
      console.error('Error creating publication:', err);
      setError(`${t('publications.error_creating') || 'Error creating publication'}: ${err instanceof Error ? err.message : t('unknown_error') || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // CSS variables for dynamic theming
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
        .create-publication-form .amplify-field {
          margin-bottom: 1rem;
        }
        
        .create-publication-form .amplify-field > label {
          color: var(--form-label-color) !important;
          font-weight: 600 !important;
          margin-bottom: 0.5rem !important;
          display: block !important;
          font-size: 0.95rem !important;
        }
        
        .create-publication-form .amplify-input,
        .create-publication-form .amplify-textarea,
        .create-publication-form .amplify-select select {
          background-color: var(--form-input-bg) !important;
          border: 1px solid var(--form-input-border) !important;
          color: var(--form-input-text) !important;
          border-radius: 6px !important;
          padding: 0.75rem !important;
          font-size: 0.9rem !important;
        }
        
        .create-publication-form .amplify-input::placeholder,
        .create-publication-form .amplify-textarea::placeholder {
          color: var(--form-placeholder-color) !important;
          opacity: 0.8 !important;
          font-weight: 400 !important;
        }
        
        .create-publication-form .amplify-input:focus,
        .create-publication-form .amplify-textarea:focus,
        .create-publication-form .amplify-select select:focus {
          border-color: var(--form-focus-border) !important;
          box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
          outline: none !important;
        }
        
        .create-publication-form .amplify-field-group__control .amplify-field__description {
          color: var(--form-description-color) !important;
          font-size: 0.8rem !important;
          margin-top: 0.25rem !important;
          font-weight: 500 !important;
        }
        
        .create-publication-form .amplify-select select {
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
            onClick={() => router.push(getLocalizedPath('/admin/recognitions'))}
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
            {t('publications.create_new')}
          </Heading>
        </Flex>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="create-publication-form">
        <Flex direction="column" gap="2rem">
          
          {/* Basic Information */}
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
                {t('publications.basic_info') || 'Basic Information'}
              </Heading>

              <Flex direction="column" gap="1rem">
                <TextField
                  label={`${t('publications.title_label')} *`}
                  placeholder={t('publications.title_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <TextAreaField
                  label={`${t('publications.description_label')} *`}
                  placeholder={t('publications.description_placeholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />

                <Flex direction={{ base: 'column', medium: 'row' }} gap="1rem">
                  <SelectField
                    label={`${t('publications.source_label')} *`}
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    required
                  >
                    <option value="">{t('publications.select_source')}</option>
                    {SOURCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label={`${t('publications.type_label')} *`}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    <option value="">{t('publications.select_type')}</option>
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </SelectField>
                </Flex>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="1rem">
                  <TextField
                    label={`${t('publications.date_label')} *`}
                    type="date"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                    required
                  />

                  <TextField
                    label={`${t('publications.url_label')} *`}
                    placeholder={t('publications.url_placeholder')}
                    value={publicationUrl}
                    onChange={(e) => setPublicationUrl(e.target.value)}
                    required
                  />
                </Flex>
              </Flex>
            </View>
          </Card>

          {/* Publication Image */}
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
                {t('publications.photo')}
              </Heading>

              {photoPreview ? (
                <View>
                  <Text fontSize="0.875rem" marginBottom="0.5rem" style={{
                    color: mode === 'dark' ? '#CBD5E1' : '#64748B'
                  }}>
                    {t('publications.current_image') || 'Current Image:'}
                  </Text>
                  <View style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={photoPreview}
                      alt="Publication preview"
                      style={{
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)'
                      }}
                    />
                    <Button
                      onClick={removePhoto}
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
                  onFileSelect={handlePhotoChange}
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
                      <BookOpen size={48} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} style={{ margin: '0 auto 1rem' }} />
                      <Text style={{
                        color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}>
                        {t('publications.add_photo')}
                      </Text>
                      <Text style={{
                        color: mode === 'dark' ? '#9CA3AF' : '#6B7280',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem'
                      }}>
                        {t('publications.max_5mb') || '(max. 5MB)'}
                      </Text>
                    </View>
                  </Card>
                </FileUploadInput>
              )}
            </View>
          </Card>

        </Flex>

        {/* Action buttons */}
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
            onClick={() => router.push(getLocalizedPath('/admin/recognitions'))}
            style={{
              color: mode === 'dark' ? '#9CA3AF' : '#6B7280'
            }}
          >
            {t('cancel') || 'Cancel'}
          </Button>

          <Button
            type="submit"
            variation="primary"
            isLoading={loading}
            loadingText={t('saving') || 'Saving...'}
            style={{
              backgroundColor: mode === 'dark' ? '#22C55E' : '#16A34A',
              minWidth: '150px'
            }}
          >
            <Save size={16} style={{ marginRight: '0.5rem' }} />
            {t('save') || 'Save'}
          </Button>
        </Flex>
      </form>
    </View>
  );
};

export default CreatePublicationClient;
