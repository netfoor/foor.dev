'use client';

import React, { useState, useCallback } from 'react';
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
  Calendar,
  BookOpen,
  Link as LinkIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';
import { v4 as uuidv4 } from 'uuid';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { FileUploadInput } from '../../recognitions/new/FileUploadInput';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';

// Custom styles for consistent form appearance
const createFormStyles = `
  .create-form .amplify-field {
    margin-bottom: 1rem;
  }
  
  .create-form .amplify-field > label {
    color: var(--form-label-color) !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
    font-size: 0.95rem !important;
  }
  
  .create-form .amplify-input,
  .create-form .amplify-textarea,
  .create-form .amplify-select select {
    background-color: var(--form-input-bg) !important;
    border: 1px solid var(--form-input-border) !important;
    color: var(--form-input-text) !important;
    border-radius: 6px !important;
    padding: 0.75rem !important;
    font-size: 0.9rem !important;
  }
  
  .create-form .amplify-input::placeholder,
  .create-form .amplify-textarea::placeholder {
    color: var(--form-placeholder-color) !important;
    opacity: 0.8 !important;
    font-weight: 400 !important;
  }
  
  .create-form .amplify-input:focus,
  .create-form .amplify-textarea:focus,
  .create-form .amplify-select select:focus {
    border-color: var(--form-focus-border) !important;
    box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
    outline: none !important;
  }
  
  .create-form .amplify-field-group__control .amplify-field__description {
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

// Publication source and type options
const SOURCE_OPTIONS = ['LinkedIn', 'Twitter', 'GitHub', 'Blog', 'Youtube'];
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
  const [success, setSuccess] = useState(false);
  
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

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
    } else {
      setPhotoPreview(null);
    }
  }, []);

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
      
      // First create the publication without the image
      const newPublication = await client.models.SocialPublications.create({
        title,
        source: source as any,
        type: type as any,
        description,
        publicationDate,
        publicationUrl
      });
      
      if (!newPublication.data) {
        throw new Error(t('error_creating_publication'));
      }
      
      const publicationId = newPublication.data.id;
      
      // Upload photo to S3 if provided
      if (photoFile && publicationId) {
        // Use the helper that adds metadata for Lambda processing
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
        });
        
        console.log('✅ Photo uploaded with metadata for Lambda processing');
      }
      
      // Validate and format the date
      let formattedDate: string;
      try {
        // Check if the date is valid
        if (!publicationDate || publicationDate.trim() === '') {
          throw new Error('Date is required');
        }
        
        // Format date correctly for ISO string conversion
        // Make sure we have a valid date format: YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(publicationDate)) {
          throw new Error('Invalid date format');
        }
        
        // Parse the date with UTC time to avoid timezone issues
        const dateObj = new Date(publicationDate + 'T12:00:00Z');
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date');
        }
        
        // The schema expects a date in 'YYYY-MM-DD' format.
        // The input 'publicationDate' is already in this format, so no conversion is needed.
        formattedDate = publicationDate;
        console.log('Formatted date for submission:', formattedDate);
      } catch (dateErr) {
        console.error('Date error:', dateErr);
        setError(t('publications.invalid_date'));
        setLoading(false);
        return;
      }
      
      // Create publication in DynamoDB with proper typing
      const createData = {
        title,
        description,
        source: source as "LinkedIn" | "Twitter" | "GitHub" | "Blog" | "Youtube",
        type: type as "Article" | "Blog" | "Video" | "Podcast" | "Book" | "Course" | "Conference" | "Presentation" | "Research" | "Workshop" | "Other",
        publicationDate: formattedDate,
        publicationUrl
      };
      
      console.log('✅ Publication created successfully');
      
      setSuccess(true);
      
      // Navigate to admin publications list after successful creation
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/publications'));
      }, 1500);
      
    } catch (err) {
      console.error('Error creating publication:', err);
      setError(`${t('error_creating')}: ${err instanceof Error ? err.message : t('unknown_error')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      <style>{createFormStyles}</style>
      
      {/* Back button */}
      <Button
        size="small"
        variation="link"
        onClick={() => router.push(getLocalizedPath('/admin/publications'))}
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
              <Text>{t('publications.create_new')}</Text>
            </Flex>
          </AmplifyHeading>
          
          {error && (
            <Alert variation="error" isDismissible={false}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variation="success" isDismissible={false}>
              {t('publications.create_success')}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="create-form">
            <Flex direction={{ base: 'column', large: 'row' }} gap="2rem">
              {/* Left column - Photo upload */}
              <View width={{ base: '100%', large: '35%' }}>
                <Text fontWeight="bold" marginBottom="0.5rem">
                  {t('publications.photo')}
                </Text>
                
                <div className="image-preview">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Publication Preview" />
                  ) : (
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
                  label={t('publications.upload_photo')}
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
const Heading = ({ level, children, ...props }: { level: number, children: React.ReactNode, [key: string]: any }) => {
  const Tag = (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
  return <Tag {...props}>{children}</Tag>;
};

export default CreatePublicationClient;
