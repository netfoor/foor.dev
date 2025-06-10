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

export default function CertificationsAdmin() {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCertification, setCurrentCertification] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    credentialId: '',
    issueDate: '',
    expirationDate: '',
    badgeImageUrl: '',
    content: '',
    categoty: '',
    skills: [] as string[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();

  // Fetch certifications on component mount
  useEffect(() => {
    fetchCertifications();
  }, []);

  async function fetchCertifications() {
    setLoading(true);
    setError(null);
    try {
      const certificationsData = await client.models.Certifications.list();
      setCertifications(certificationsData.data);
    } catch (err: any) {
      console.error('Error fetching certifications:', err);
      setError(err.message || 'Failed to load certifications');
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

  const handleSkillAdd = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleSkillRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const fileName = `certifications/${Date.now()}-${file.name}`;
        await uploadData({
        key: fileName,
        data: file,
        options: {
          onProgress: (progress) => {
            // Handle progress using the bytes info instead of loaded/total
            const bytesTransferred = progress.transferredBytes || 0;
            const totalBytes = progress.totalBytes || 1; // Avoid division by zero
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
      
      const certificationData = {
        ...formData,
        badgeImageUrl
      };
      
      if (isEditing && currentCertification) {
        // Update existing certification
        await client.models.Certifications.update({
          id: currentCertification.id,
          ...certificationData
        });
        setSuccessMessage('Certification updated successfully!');
      } else {
        // Create new certification
        await client.models.Certifications.create(certificationData);
        setSuccessMessage('Certification created successfully!');
        
        // Después de crear la certificación
        const listResult = await client.models.Certifications.list();
        console.log("Certificaciones después de crear:", JSON.stringify(listResult));
      }
      
      // Reset form
      setFormData({
        title: '',
        issuer: '',
        credentialId: '',
        issueDate: '',
        expirationDate: '',
        badgeImageUrl: '',
        content: '',
        categoty: '',
        skills: []
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setIsEditing(false);
      setCurrentCertification(null);
      
      // Refresh certifications list
      fetchCertifications();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error saving certification:', err);
      setError(err.message || 'Failed to save certification');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (certification: any) => {
    setIsEditing(true);
    setCurrentCertification(certification);
    setFormData({
      title: certification.title || '',
      issuer: certification.issuer || '',
      credentialId: certification.credentialId || '',
      issueDate: certification.issueDate || '',
      expirationDate: certification.expirationDate || '',
      badgeImageUrl: certification.badgeImageUrl || '',
      content: certification.content || '',
      categoty: certification.categoty || '',
      skills: certification.skills || []
    });
  };

  const handleDelete = async (certificationId: string) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await client.models.Certifications.delete({ id: certificationId });
      setSuccessMessage('Certification deleted successfully!');
      
      // Refresh certifications list
      fetchCertifications();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting certification:', err);
      setError(err.message || 'Failed to delete certification');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentCertification(null);
    setFormData({
      title: '',
      issuer: '',
      credentialId: '',
      issueDate: '',
      expirationDate: '',
      badgeImageUrl: '',
      content: '',
      categoty: '',
      skills: []
    });
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <View padding="1rem">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={2}>Certifications Management</Heading>
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
          {isEditing ? 'Edit Certification' : 'Add New Certification'}
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
          
          <TextField
            label="Issuer"
            name="issuer"
            value={formData.issuer}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          />
          
          <TextField
            label="Credential ID"
            name="credentialId"
            value={formData.credentialId}
            onChange={handleInputChange}
            marginBottom="1rem"
          />
          
          <TextField
            label="Category"
            name="categoty"
            value={formData.categoty}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          />
            <View marginBottom="1rem">
            <Text>Issue Date</Text>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleDateChange('issueDate', e.target.value)}
              required
              style={{ marginTop: '0.5rem', padding: '0.5rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </View>
          
          <View marginBottom="1rem">
            <Text>Expiration Date (if applicable)</Text>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleDateChange('expirationDate', e.target.value)}
              style={{ marginTop: '0.5rem', padding: '0.5rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </View>
          
          <TextAreaField
            label="Content/Description"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            marginBottom="1rem"
          />
          
          <Heading level={5} marginBottom="0.5rem">Skills</Heading>
          <Flex direction="row" alignItems="flex-end" gap="0.5rem" marginBottom="1rem">
            <TextField
              label="Add Skill"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />
            <Button onClick={handleSkillAdd} variation="primary">
              Add
            </Button>
          </Flex>
          
          {formData.skills.length > 0 && (
            <Flex wrap="wrap" gap="0.5rem" marginBottom="1rem">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variation="info">
                  {skill}
                  <Text 
                    as="span" 
                    marginLeft="0.5rem" 
                    fontWeight="bold" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSkillRemove(index)}
                  >
                    ×
                  </Text>
                </Badge>
              ))}
            </Flex>
          )}
          
          <Divider marginBottom="1rem" />
          
          <Heading level={5} marginBottom="0.5rem">Badge Image</Heading>
          
          {formData.badgeImageUrl && (
            <Image
              src={formData.badgeImageUrl}
              alt="Badge preview"
              width="200px"
              height="auto"
              objectFit="cover"
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
              {isEditing ? 'Update Certification' : 'Create Certification'}
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
      
      <Heading level={3} marginBottom="1rem">Certifications List</Heading>
      
      {loading && !isEditing ? (
        <Flex justifyContent="center" padding="2rem">
          <Loader size="large" />
        </Flex>
      ) : certifications.length === 0 ? (
        <Text>No certifications found. Create your first certification above!</Text>
      ) : (
        <Collection
          items={certifications}
          type="list"
          gap="1rem"
          wrap="wrap"
        >
          {(certification, index) => (
            <Card key={index} variation="outlined">
              <Flex>
                {certification.badgeImageUrl && (
                  <Image
                    src={certification.badgeImageUrl}
                    alt={certification.title}
                    width="120px"
                    height="120px"
                    objectFit="cover"
                  />
                )}
                <Flex direction="column" padding="1rem" flex={1}>
                  <Heading level={4}>{certification.title}</Heading>
                  <Text marginBottom="0.5rem">
                    {certification.issuer} 
                    {certification.credentialId && ` • ID: ${certification.credentialId}`}
                  </Text>
                  <Text marginBottom="0.5rem">
                    Issued: {new Date(certification.issueDate).toLocaleDateString()}
                    {certification.expirationDate && ` • Expires: ${new Date(certification.expirationDate).toLocaleDateString()}`}
                  </Text>
                  
                  {certification.categoty && (
                    <Badge variation="info" marginTop="0.5rem">
                      {certification.categoty}
                    </Badge>
                  )}
                  
                  <Flex gap="0.5rem" marginTop="auto">
                    <Button
                      onClick={() => handleEdit(certification)}
                      size="small"
                      variation="primary"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(certification.id)}
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
