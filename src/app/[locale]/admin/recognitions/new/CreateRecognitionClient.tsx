'use client';

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card, 
  Heading,
  TextField,
  TextAreaField,
  SwitchField,
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
  Award,
  Link as LinkIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';
import { v4 as uuidv4 } from 'uuid';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { FileUploadInput } from './FileUploadInput';

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

interface CreateRecognitionClientProps {}

const CreateRecognitionClient: React.FC<CreateRecognitionClientProps> = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [issuerUrl, setIssuerUrl] = useState('');
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
    if (!title || !description || !issuer || !issueDate) {
      setError(t('required_fields'));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const client = generateClient<Schema>();
      let photoKey: string | undefined;
      
      // Upload photo to S3 if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const s3Key = `recognitions/${fileName}`;
        
        await uploadData({
          path: s3Key,
          data: photoFile,
          options: {
            contentType: photoFile.type,
          }
        });
        
        photoKey = s3Key;
        console.log('✅ Photo uploaded to S3:', s3Key);
      }
      
      // Create recognition in DynamoDB
      const newRecognition = await client.models.Recognitions.create({
        title,
        description,
        issuer,
        issueDate: new Date(issueDate).toISOString(),
        credentialId: credentialId || undefined,
        issuerUrl: issuerUrl || undefined,
        photoKey: photoKey || undefined,
      });
      
      console.log('✅ Recognition created:', newRecognition.data?.id);
      
      setSuccess(true);
      
      // Navigate to admin recognitions list after successful creation
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/recognitions'));
      }, 1500);
      
    } catch (err) {
      console.error('Error creating recognition:', err);
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
        onClick={() => router.push(getLocalizedPath('/admin/recognitions'))}
        marginBottom="1rem"
      >
        <ArrowLeft size={16} />
        <Text>{t('back_to_list')}</Text>
      </Button>
      
      <Card>
        <Flex direction="column" gap="16px">
          <Heading level={1} marginBottom="1rem">
            <Flex alignItems="center" gap="8px">
              <Award size={24} />
              <Text>{t('recognitions.create_new')}</Text>
            </Flex>
          </Heading>
          
          {error && (
            <Alert variation="error" isDismissible={false}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variation="success" isDismissible={false}>
              {t('recognitions.create_success')}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="create-form">
            <Flex direction={{ base: 'column', large: 'row' }} gap="2rem">
              {/* Left column - Photo upload */}
              <View width={{ base: '100%', large: '35%' }}>
                <Text fontWeight="bold" marginBottom="0.5rem">
                  {t('recognitions.photo')}
                </Text>
                
                <div className="image-preview">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Recognition Preview" />
                  ) : (
                    <Flex direction="column" alignItems="center" gap="8px">
                      <Award size={48} />
                      <Text>{t('recognitions.add_photo')}</Text>
                    </Flex>
                  )}
                </div>
                
                <FileUploadInput
                  id="recognition-photo"
                  onChange={handlePhotoChange}
                  accept="image/*"
                  label={t('recognitions.upload_photo')}
                />
                
                <Text fontSize="0.8rem" color="var(--amplify-colors-font-tertiary)" marginTop="0.5rem">
                  {t('recognitions.photo_description')}
                </Text>
              </View>
              
              {/* Right column - Recognition details */}
              <View width={{ base: '100%', large: '65%' }}>
                <TextField
                  label={t('recognitions.title_label')}
                  placeholder={t('recognitions.title_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  isRequired
                />
                
                <TextAreaField
                  label={t('recognitions.description_label')}
                  placeholder={t('recognitions.description_placeholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  isRequired
                />
                
                <TextField
                  label={t('recognitions.issuer_label')}
                  placeholder={t('recognitions.issuer_placeholder')}
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  isRequired
                />
                
                <div>
                  <label htmlFor="issueDate" className="amplify-field">
                    <span>{t('recognitions.date_label')} *</span>
                    <div className="date-field">
                      <input
                        id="issueDate"
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        required
                      />
                    </div>
                  </label>
                </div>
                
                <TextField
                  label={t('recognitions.credential_id_label')}
                  placeholder={t('recognitions.credential_id_placeholder')}
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                />
                
                <TextField
                  label={t('recognitions.issuer_url_label')}
                  placeholder={t('recognitions.issuer_url_placeholder')}
                  value={issuerUrl}
                  onChange={(e) => setIssuerUrl(e.target.value)}
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

export default CreateRecognitionClient;
