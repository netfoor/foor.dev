"use client"
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { 
  Button, 
  Card, 
  Collection, 
  Flex, 
  Heading, 
  Loader, 
  Text, 
  TextField, 
  View,
  Alert,
  SelectField
} from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import { useRouter } from 'next/navigation';

const client = generateClient<Schema>();

export default function LanguagesAdmin() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<any>(null);
  const [formData, setFormData] = useState({
    language: '',
    proficiency: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();
  
  const proficiencyLevels = ['Basic', 'Conversational', 'Fluent', 'Native'];

  // Fetch languages on component mount
  useEffect(() => {
    fetchLanguages();
  }, []);

  async function fetchLanguages() {
    setLoading(true);
    setError(null);
    try {
      const languagesData = await client.models.Languages.list();
      setLanguages(languagesData.data);
    } catch (err: any) {
      console.error('Error fetching languages:', err);
      setError(err.message || 'Failed to load languages');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const languageData = {
        ...formData,
        // Convert string to enum type or null
        proficiency: formData.proficiency ? 
          (formData.proficiency as "Basic" | "Conversational" | "Fluent" | "Native") : 
          null
      };
      
      if (isEditing && currentLanguage) {
        // Update existing language
        await client.models.Languages.update({
          id: currentLanguage.id,
          ...languageData
        });
        setSuccessMessage('Language updated successfully!');
      } else {
        // Create new language
        await client.models.Languages.create(languageData);
        setSuccessMessage('Language created successfully!');
      }
      
      // Reset form
      setFormData({
        language: '',
        proficiency: ''
      });
      setIsEditing(false);
      setCurrentLanguage(null);
      
      // Refresh languages list
      fetchLanguages();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error saving language:', err);
      setError(err.message || 'Failed to save language');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (language: any) => {
    setIsEditing(true);
    setCurrentLanguage(language);
    setFormData({
      language: language.language || '',
      proficiency: language.proficiency || ''
    });
  };

  const handleDelete = async (languageId: string) => {
    if (!window.confirm('Are you sure you want to delete this language?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await client.models.Languages.delete({ id: languageId });
      setSuccessMessage('Language deleted successfully!');
      
      // Refresh languages list
      fetchLanguages();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting language:', err);
      setError(err.message || 'Failed to delete language');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentLanguage(null);
    setFormData({
      language: '',
      proficiency: ''
    });
  };

  const getProficiencyColorVariation = (proficiency: string) => {
    switch(proficiency) {
      case 'Native':
        return 'success';
      case 'Fluent':
        return 'info';
      case 'Conversational':
        return 'warning';
      case 'Basic':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <View padding="1rem">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={2}>Languages Management</Heading>
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
          {isEditing ? 'Edit Language' : 'Add New Language'}
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Language Name"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
            placeholder="e.g., English, Spanish, French"
          />
          
          <SelectField
            label="Proficiency Level"
            name="proficiency"
            value={formData.proficiency}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          >
            <option value="">Select proficiency level</option>
            {proficiencyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </SelectField>
          
          <Flex gap="1rem" marginTop="1rem">
            <Button
              type="submit"
              variation="primary"
              isLoading={loading}
              loadingText="Saving..."
            >
              {isEditing ? 'Update Language' : 'Create Language'}
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
      
      <Heading level={3} marginBottom="1rem">Languages List</Heading>
      
      {loading && !isEditing ? (
        <Flex justifyContent="center" padding="2rem">
          <Loader size="large" />
        </Flex>
      ) : languages.length === 0 ? (
        <Text>No languages found. Add your first language above!</Text>
      ) : (
        <Collection
          items={languages}
          type="list"
          gap="1rem"
          wrap="wrap"
        >
          {(language, index) => (
            <Card key={index} variation="outlined">
              <Flex justifyContent="space-between" alignItems="center" padding="1rem">
                <Flex direction="column">
                  <Heading level={4}>{language.language}</Heading>
                  {language.proficiency && (
                    <Text
                      backgroundColor={getProficiencyColorVariation(language.proficiency)}
                      padding="0.25rem 0.5rem"
                      borderRadius="4px"
                      color={language.proficiency === 'Basic' ? 'black' : 'white'}
                      fontSize="0.8rem"
                      fontWeight="bold"
                      display="inline-block"
                    >
                      {language.proficiency}
                    </Text>
                  )}
                </Flex>
                
                <Flex gap="0.5rem">
                  <Button
                    onClick={() => handleEdit(language)}
                    size="small"
                    variation="primary"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(language.id)}
                    size="small"
                    variation="destructive"
                  >
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Card>
          )}
        </Collection>
      )}
    </View>
  );
}
