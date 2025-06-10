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
  Alert
} from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import { useRouter } from 'next/navigation';

const client = generateClient<Schema>();

export default function RecognitionsAdmin() {
  const [recognitions, setRecognitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecognition, setCurrentRecognition] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    issuerUrl: '',
    badgeImageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();

  // Fetch recognitions on component mount
  useEffect(() => {
    fetchRecognitions();
  }, []);

  async function fetchRecognitions() {
    setLoading(true);
    setError(null);
    try {
      const recognitionsData = await client.models.Recognitions.list();
      setRecognitions(recognitionsData.data);
    } catch (err: any) {
      console.error('Error fetching recognitions:', err);
      setError(err.message || 'Failed to load recognitions');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const fileName = `recognitions/${Date.now()}-${file.name}`;
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
      let badgeImageUrl = formData.badgeImageUrl;
      
      // If there's a selected file, upload it first
      if (selectedFile) {
        badgeImageUrl = await handleFileUpload(selectedFile);
      }
        
      const recognitionData = {
        ...formData,
        badgeImageUrl,
        issueDate: new Date(formData.issueDate).toISOString()
      };
      
      if (isEditing && currentRecognition) {
        // Update existing recognition
        await client.models.Recognitions.update({
          id: currentRecognition.id,
          ...recognitionData
        });
        setSuccessMessage('Recognition updated successfully!');
      } else {
        // Create new recognition
        await client.models.Recognitions.create(recognitionData);
        setSuccessMessage('Recognition created successfully!');
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        issuer: '',
        issueDate: '',
        credentialId: '',
        issuerUrl: '',
        badgeImageUrl: ''
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setIsEditing(false);
      setCurrentRecognition(null);
      
      // Refresh recognitions list
      fetchRecognitions();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error saving recognition:', err);
      setError(err.message || 'Failed to save recognition');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recognition: any) => {
    setIsEditing(true);
    setCurrentRecognition(recognition);
    
    // Format date for input field
    const issueDateFormatted = recognition.issueDate ? 
      new Date(recognition.issueDate).toISOString().split('T')[0] : '';
    
    setFormData({
      title: recognition.title || '',
      description: recognition.description || '',
      issuer: recognition.issuer || '',
      issueDate: issueDateFormatted,
      credentialId: recognition.credentialId || '',
      issuerUrl: recognition.issuerUrl || '',
      badgeImageUrl: recognition.badgeImageUrl || ''
    });
  };

  const handleDelete = async (recognitionId: string) => {
    if (!window.confirm('Are you sure you want to delete this recognition?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await client.models.Recognitions.delete({ id: recognitionId });
      setSuccessMessage('Recognition deleted successfully!');
      
      // Refresh recognitions list
      fetchRecognitions();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting recognition:', err);
      setError(err.message || 'Failed to delete recognition');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentRecognition(null);
    setFormData({
      title: '',
      description: '',
      issuer: '',
      issueDate: '',
      credentialId: '',
      issuerUrl: '',
      badgeImageUrl: ''
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
        <Heading level={2}>Recognitions Management</Heading>
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
          {isEditing ? 'Edit Recognition' : 'Add New Recognition'}
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
          
          <TextField
            label="Issuer"
            name="issuer"
            value={formData.issuer}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          />
          
          <TextField
            label="Issuer URL"
            name="issuerUrl"
            value={formData.issuerUrl}
            onChange={handleInputChange}
            marginBottom="1rem"
            type="url"
          />
          
          <Flex direction="column" marginBottom="1rem">
            <Text>Issue Date</Text>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={(e) => handleDateChange('issueDate', e.target.value)}
              required
              style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </Flex>
          
          <TextField
            label="Credential ID"
            name="credentialId"
            value={formData.credentialId}
            onChange={handleInputChange}
            marginBottom="1rem"
          />
          
          <Divider marginBottom="1rem" />
          
          <Heading level={5} marginBottom="0.5rem">Badge Image</Heading>
          
          {formData.badgeImageUrl && (
            <Image
              src={formData.badgeImageUrl}
              alt="Badge preview"
              width="200px"
              height="auto"
              objectFit="contain"
              marginBottom="1rem"
            />
          )}
          
          <TextField
            label="Badge Image URL"
            name="badgeImageUrl"
            value={formData.badgeImageUrl}
            onChange={handleInputChange}
            marginBottom="1rem"
            type="url"
            placeholder="Or upload an image below"
          />
          
          <View marginBottom="1rem">
            <Text>Upload Badge Image</Text>
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
              {isEditing ? 'Update Recognition' : 'Create Recognition'}
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
      
      <Heading level={3} marginBottom="1rem">Recognitions List</Heading>
      
      {loading && !isEditing ? (
        <Flex justifyContent="center" padding="2rem">
          <Loader size="large" />
        </Flex>
      ) : recognitions.length === 0 ? (
        <Text>No recognitions found. Create your first recognition above!</Text>
      ) : (
        <Collection
          items={recognitions}
          type="list"
          gap="1rem"
          wrap="wrap"
        >
          {(recognition, index) => (
            <Card key={index} variation="outlined">
              <Flex>
                {recognition.badgeImageUrl && (
                  <Image
                    src={recognition.badgeImageUrl}
                    alt={recognition.title}
                    width="120px"
                    height="120px"
                    objectFit="contain"
                  />
                )}
                <Flex direction="column" padding="1rem" flex={1}>
                  <Heading level={4}>{recognition.title}</Heading>
                  <Text marginBottom="0.5rem">
                    <strong>Issuer:</strong> {recognition.issuer}
                  </Text>
                  {recognition.issueDate && (
                    <Text marginBottom="0.5rem">
                      <strong>Issued:</strong> {formatDate(recognition.issueDate)}
                    </Text>
                  )}
                  <Text>{recognition.description.substring(0, 100)}{recognition.description.length > 100 ? '...' : ''}</Text>
                  
                  <Flex gap="0.5rem" marginTop="auto">
                    <Button
                      onClick={() => handleEdit(recognition)}
                      size="small"
                      variation="primary"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(recognition.id)}
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
