"use client"
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { 
  Button, 
  Card, 
  Collection, 
  Flex, 
  Heading, 
  Image, 
  Loader, 
  Text, 
  TextField, 
  TextAreaField,
  View,
  Badge,
  Divider,
  Alert,
  SelectField
} from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import { useRouter } from 'next/navigation';

const client = generateClient<Schema>();

export default function PublicationsAdmin() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPublication, setCurrentPublication] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    source: '',
    platform: '',
    image: '',
    description: '',
    publicationDate: '',
    type: '',
    publicationUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();

  const sourcePlatforms = ['LinkedIn', 'Twitter', 'GitHub', 'Blog', 'Youtube'];
  const publicationTypes = [
    'Article', 'Blog', 'Video', 'Podcast', 'Book', 'Course', 
    'Conference', 'Presentation', 'Research', 'Workshop', 'Other'
  ];

  // Fetch publications on component mount
  useEffect(() => {
    fetchPublications();
  }, []);

  async function fetchPublications() {
    setLoading(true);
    setError(null);
    try {
      const publicationsData = await client.models.SocialPublications.list();
      setPublications(publicationsData.data);
    } catch (err: any) {
      console.error('Error fetching publications:', err);
      setError(err.message || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const fileName = `publications/${Date.now()}-${file.name}`;
        await uploadData({
        key: fileName,
        data: file,
        options: {
          onProgress: (progress) => {
            const bytesTransferred = progress.transferredBytes || 0;
            const totalBytes = progress.totalBytes || 1;
            setUploadProgress(Math.round((bytesTransferred / totalBytes) * 100));
          }
        }
      });
      
      // Get the URL of the uploaded file
      const result = await getUrl({
        key: fileName,
      });
      
      return result.url.toString();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let imageUrl = formData.image;
      
      // If there's a selected file, upload it first
      if (selectedFile) {
        imageUrl = await handleFileUpload(selectedFile);
      }
        
      const publicationData = {
        ...formData,
        image: imageUrl,
        publicationDate: new Date(formData.publicationDate).toISOString(),
        // Convert string to enum type or null
        source: formData.source ? 
          (formData.source as "LinkedIn" | "Twitter" | "GitHub" | "Blog" | "Youtube") : 
          null,
        platform: formData.platform ? 
          (formData.platform as "LinkedIn" | "Twitter" | "GitHub" | "Blog" | "Youtube") : 
          null,
        type: formData.type ? 
          (formData.type as "Article" | "Blog" | "Video" | "Podcast" | "Book" | "Course" | "Conference" | "Presentation" | "Research" | "Workshop" | "Other") : 
          null
      };
      
      if (isEditing && currentPublication) {
        // Update existing publication
        await client.models.SocialPublications.update({
          id: currentPublication.id,
          ...publicationData
        });
        setSuccessMessage('Publication updated successfully!');
      } else {
        // Create new publication
        await client.models.SocialPublications.create(publicationData);
        setSuccessMessage('Publication created successfully!');
      }
      
      // Reset form
      setFormData({
        title: '',
        source: '',
        platform: '',
        image: '',
        description: '',
        publicationDate: '',
        type: '',
        publicationUrl: ''
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setIsEditing(false);
      setCurrentPublication(null);
      
      // Refresh publications list
      fetchPublications();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error saving publication:', err);
      setError(err.message || 'Failed to save publication');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (publication: any) => {
    setIsEditing(true);
    setCurrentPublication(publication);
    
    // Format date for input field
    const publicationDateFormatted = publication.publicationDate ? 
      new Date(publication.publicationDate).toISOString().split('T')[0] : '';
    
    setFormData({
      title: publication.title || '',
      source: publication.source || '',
      platform: publication.platform || '',
      image: publication.image || '',
      description: publication.description || '',
      publicationDate: publicationDateFormatted,
      type: publication.type || '',
      publicationUrl: publication.publicationUrl || ''
    });
  };

  const handleDelete = async (publicationId: string) => {
    if (!window.confirm('Are you sure you want to delete this publication?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await client.models.SocialPublications.delete({ id: publicationId });
      setSuccessMessage('Publication deleted successfully!');
      
      // Refresh publications list
      fetchPublications();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting publication:', err);
      setError(err.message || 'Failed to delete publication');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentPublication(null);
    setFormData({
      title: '',
      source: '',
      platform: '',
      image: '',
      description: '',
      publicationDate: '',
      type: '',
      publicationUrl: ''
    });
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View padding="1rem">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={2}>Publications Management</Heading>
        <Button onClick={() => router.push('/admin')}>Back to Dashboard</Button>
      </Flex>
      
      {successMessage && (
        <Alert variation="success" isDismissible={true} marginBottom="1rem">
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variation="error" isDismissible={true} marginBottom="1rem">
          {error}
        </Alert>
      )}
      
      <Card variation="outlined" marginBottom="2rem">
        <Heading level={3} marginBottom="1rem">
          {isEditing ? 'Edit Publication' : 'Add New Publication'}
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          />
          
          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          />
          
          <Flex gap="1rem" marginBottom="1rem">
            <SelectField
              label="Source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              flex={1}
            >
              <option value="">Select source</option>
              {sourcePlatforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </SelectField>
            
            <SelectField
              label="Platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              flex={1}
            >
              <option value="">Select platform</option>
              {sourcePlatforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </SelectField>
          </Flex>
          
          <SelectField
            label="Publication Type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            marginBottom="1rem"
          >
            <option value="">Select type</option>
            {publicationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectField>
          
          <TextField
            label="Publication URL"
            name="publicationUrl"
            value={formData.publicationUrl}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
            type="url"
          />
          
          <Flex direction="column" marginBottom="1rem">
            <Text>Publication Date</Text>
            <input
              type="date"
              name="publicationDate"
              value={formData.publicationDate}
              onChange={(e) => handleDateChange('publicationDate', e.target.value)}
              required
              style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </Flex>
          
          <Divider marginBottom="1rem" />
          
          <Heading level={5} marginBottom="0.5rem">Featured Image</Heading>
          
          {formData.image && (
            <Image
              src={formData.image}
              alt="Publication preview"
              width="200px"
              height="auto"
              objectFit="cover"
              marginBottom="1rem"
            />
          )}
          
          <TextField
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            marginBottom="1rem"
            type="url"
            placeholder="Or upload an image below"
          />
          
          <View marginBottom="1rem">
            <Text>Upload Image</Text>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginTop: '0.5rem' }}
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Text>Uploading: {uploadProgress}%</Text>
            )}
          </View>
          
          <Flex gap="1rem" marginTop="1rem">
            <Button
              type="submit"
              variation="primary"
              isLoading={loading}
              loadingText="Saving..."
            >
              {isEditing ? 'Update Publication' : 'Create Publication'}
            </Button>
            
            {isEditing && (
              <Button
                onClick={handleCancel}
                variation="warning"
              >
                Cancel Edit
              </Button>
            )}
          </Flex>
        </form>
      </Card>
      
      <Heading level={3} marginBottom="1rem">Publications List</Heading>
      
      {loading && !isEditing ? (
        <Flex justifyContent="center" padding="2rem">
          <Loader size="large" />
        </Flex>
      ) : publications.length === 0 ? (
        <Text>No publications found. Create your first publication above!</Text>
      ) : (
        <Collection
          items={publications}
          type="list"
          gap="1rem"
          wrap="wrap"
        >
          {(publication, index) => (
            <Card key={index} variation="outlined">
              <Flex>
                {publication.image && (
                  <Image
                    src={publication.image}
                    alt={publication.title}
                    width="120px"
                    height="120px"
                    objectFit="cover"
                  />
                )}
                <Flex direction="column" padding="1rem" flex={1}>
                  <Heading level={4}>{publication.title}</Heading>
                  
                  <Flex gap="0.5rem" marginBottom="0.5rem">
                    {publication.type && (
                      <Badge variation="info">
                        {publication.type}
                      </Badge>
                    )}
                    {publication.platform && (
                      <Badge variation="warning">
                        {publication.platform}
                      </Badge>
                    )}
                  </Flex>
                  
                  {publication.publicationDate && (
                    <Text marginBottom="0.5rem">
                      Published: {formatDate(publication.publicationDate)}
                    </Text>
                  )}
                  
                  <Text>{publication.description.substring(0, 100)}{publication.description.length > 100 ? '...' : ''}</Text>
                  
                  <Flex gap="0.5rem" marginTop="auto">
                    <Button
                      onClick={() => handleEdit(publication)}
                      size="small"
                      variation="primary"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(publication.id)}
                      size="small"
                      variation="destructive"
                    >
                      Delete
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          )}
        </Collection>
      )}
    </View>
  );
}
