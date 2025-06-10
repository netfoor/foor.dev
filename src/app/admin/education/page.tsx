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

export default function EducationAdmin() {
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<any>(null);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    description: '',
    location: '',
    recognition: [] as string[],
    CertificateURL: '',
    Photos: [] as string[]
  });
  const [recognitionInput, setRecognitionInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();

  // Fetch education entries on component mount
  useEffect(() => {
    fetchEducation();
  }, []);

  async function fetchEducation() {
    setLoading(true);
    setError(null);
    try {
      const educationData = await client.models.Education.list();
      setEducation(educationData.data);
    } catch (err: any) {
      console.error('Error fetching education:', err);
      setError(err.message || 'Failed to load education');
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

  const handleRecognitionAdd = () => {
    if (recognitionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        recognition: [...prev.recognition, recognitionInput.trim()]
      }));
      setRecognitionInput('');
    }
  };

  const handleRecognitionRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recognition: prev.recognition.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const fileName = `education/${Date.now()}-${file.name}`;
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
      let photoUrl = '';
      
      // If there's a selected file, upload it and add to Photos array
      if (selectedFile) {
        photoUrl = await handleFileUpload(selectedFile);
        formData.Photos = [...formData.Photos, photoUrl];
      }
        
      const educationData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };
      
      if (isEditing && currentEducation) {
        // Update existing education
        await client.models.Education.update({
          id: currentEducation.id,
          ...educationData
        });
        setSuccessMessage('Education entry updated successfully!');
      } else {
        // Create new education entry
        await client.models.Education.create(educationData);
        setSuccessMessage('Education entry created successfully!');
      }
      
      // Reset form
      setFormData({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        description: '',
        location: '',
        recognition: [],
        CertificateURL: '',
        Photos: []
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setIsEditing(false);
      setCurrentEducation(null);
      
      // Refresh education list
      fetchEducation();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error saving education:', err);
      setError(err.message || 'Failed to save education');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (education: any) => {
    setIsEditing(true);
    setCurrentEducation(education);
    
    // Format dates for input fields
    const startDateFormatted = education.startDate ? 
      new Date(education.startDate).toISOString().split('T')[0] : '';
    const endDateFormatted = education.endDate ? 
      new Date(education.endDate).toISOString().split('T')[0] : '';
    
    setFormData({
      institution: education.institution || '',
      degree: education.degree || '',
      fieldOfStudy: education.fieldOfStudy || '',
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      description: education.description || '',
      location: education.location || '',
      recognition: education.recognition || [],
      CertificateURL: education.CertificateURL || '',
      Photos: education.Photos || []
    });
  };

  const handleDelete = async (educationId: string) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await client.models.Education.delete({ id: educationId });
      setSuccessMessage('Education entry deleted successfully!');
      
      // Refresh education list
      fetchEducation();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting education:', err);
      setError(err.message || 'Failed to delete education');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentEducation(null);
    setFormData({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
      location: '',
      recognition: [],
      CertificateURL: '',
      Photos: []
    });
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handlePhotoRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      Photos: prev.Photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <View padding="1rem">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={2}>Education Management</Heading>
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
          {isEditing ? 'Edit Education' : 'Add New Education'}
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Institution"
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          />
          
          <TextField
            label="Degree"
            name="degree"
            value={formData.degree}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          />
          
          <TextField
            label="Field of Study"
            name="fieldOfStudy"
            value={formData.fieldOfStudy}
            onChange={handleInputChange}
            marginBottom="1rem"
          />
          
          <TextField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            marginBottom="1rem"
          />
          
          <Flex gap="1rem" marginBottom="1rem">
            <Flex direction="column" flex={1}>
              <Text>Start Date</Text>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                required
                style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
              />
            </Flex>
            
            <Flex direction="column" flex={1}>
              <Text>End Date (leave blank if current)</Text>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
              />
            </Flex>
          </Flex>
          
          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            marginBottom="1rem"
          />
          
          <TextField
            label="Certificate URL"
            name="CertificateURL"
            value={formData.CertificateURL}
            onChange={handleInputChange}
            marginBottom="1rem"
            type="url"
          />
          
          <Heading level={5} marginBottom="0.5rem">Recognitions/Achievements</Heading>
          <Flex direction="row" alignItems="flex-end" gap="0.5rem" marginBottom="1rem">
            <TextField
              label="Add Recognition"
              value={recognitionInput}
              onChange={(e) => setRecognitionInput(e.target.value)}
            />
            <Button onClick={handleRecognitionAdd} variation="primary">
              Add
            </Button>
          </Flex>
          
          {formData.recognition.length > 0 && (
            <Flex wrap="wrap" gap="0.5rem" marginBottom="1rem">
              {formData.recognition.map((recognition, index) => (
                <Badge key={index} variation="info">
                  {recognition}
                  <Text 
                    as="span" 
                    marginLeft="0.5rem" 
                    fontWeight="bold" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRecognitionRemove(index)}
                  >
                    ×
                  </Text>
                </Badge>
              ))}
            </Flex>
          )}
          
          <Divider marginBottom="1rem" />
          
          <Heading level={5} marginBottom="0.5rem">Photos</Heading>
          
          {formData.Photos.length > 0 && (
            <Flex wrap="wrap" gap="1rem" marginBottom="1rem">
              {formData.Photos.map((photo, index) => (
                <View key={index} position="relative">
                  <Image
                    src={photo}
                    alt={`Education photo ${index + 1}`}
                    width="100px"
                    height="100px"
                    objectFit="cover"
                  />
                  <Button
                    size="small"
                    variation="destructive"
                    onClick={() => handlePhotoRemove(index)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      padding: '2px 6px',
                      minWidth: 'auto'
                    }}
                  >
                    ×
                  </Button>
                </View>
              ))}
            </Flex>
          )}
          
          <View marginBottom="1rem">
            <Text>Upload Photo</Text>
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
              {isEditing ? 'Update Education' : 'Create Education'}
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
      
      <Heading level={3} marginBottom="1rem">Education List</Heading>
      
      {loading && !isEditing ? (
        <Flex justifyContent="center" padding="2rem">
          <Loader size="large" />
        </Flex>
      ) : education.length === 0 ? (
        <Text>No education entries found. Create your first education entry above!</Text>
      ) : (
        <Collection
          items={education}
          type="list"
          gap="1rem"
          wrap="wrap"
        >
          {(edu, index) => (
            <Card key={index} variation="outlined">
              <Flex>
                {edu.Photos && edu.Photos.length > 0 && (
                  <Image
                    src={edu.Photos[0]}
                    alt={edu.institution}
                    width="120px"
                    height="120px"
                    objectFit="cover"
                  />
                )}
                <Flex direction="column" padding="1rem" flex={1}>
                  <Heading level={4}>{edu.degree}</Heading>
                  <Text marginBottom="0.5rem">
                    <strong>{edu.institution}</strong>
                    {edu.location ? `, ${edu.location}` : ''}
                  </Text>
                  <Text marginBottom="0.5rem">
                    {edu.startDate && formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                  </Text>
                  {edu.fieldOfStudy && (
                    <Text marginBottom="0.5rem">Field: {edu.fieldOfStudy}</Text>
                  )}
                  
                  <Flex gap="0.5rem" marginTop="auto">
                    <Button
                      onClick={() => handleEdit(edu)}
                      size="small"
                      variation="primary"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(edu.id)}
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
