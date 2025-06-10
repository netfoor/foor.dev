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
  TextAreaField,
  View,
  Badge,
  Divider,
  Alert
} from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import { useRouter } from 'next/navigation';

const client = generateClient<Schema>();

export default function ExperienceAdmin() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<any>(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    location: '',
    skills: [] as string[],
    activities: [] as string[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [activityInput, setActivityInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();

  // Fetch experiences on component mount
  useEffect(() => {
    fetchExperiences();
  }, []);

  async function fetchExperiences() {
    setLoading(true);
    setError(null);
    try {
      const experiencesData = await client.models.Experiences.list();
      setExperiences(experiencesData.data);
    } catch (err: any) {
      console.error('Error fetching experiences:', err);
      setError(err.message || 'Failed to load experiences');
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

  const handleActivityAdd = () => {
    if (activityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        activities: [...prev.activities, activityInput.trim()]
      }));
      setActivityInput('');
    }
  };

  const handleActivityRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const experienceData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };
      
      if (isEditing && currentExperience) {
        // Update existing experience
        await client.models.Experiences.update({
          id: currentExperience.id,
          ...experienceData
        });
        setSuccessMessage('Experience updated successfully!');
      } else {
        // Create new experience
        await client.models.Experiences.create(experienceData);
        setSuccessMessage('Experience created successfully!');
      }
      
      // Reset form
      setFormData({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        location: '',
        skills: [],
        activities: []
      });
      setIsEditing(false);
      setCurrentExperience(null);
      
      // Refresh experiences list
      fetchExperiences();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error saving experience:', err);
      setError(err.message || 'Failed to save experience');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (experience: any) => {
    setIsEditing(true);
    setCurrentExperience(experience);
    
    // Format dates for input fields
    const startDateFormatted = experience.startDate ? 
      new Date(experience.startDate).toISOString().split('T')[0] : '';
    const endDateFormatted = experience.endDate ? 
      new Date(experience.endDate).toISOString().split('T')[0] : '';
    
    setFormData({
      company: experience.company || '',
      position: experience.position || '',
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      description: experience.description || '',
      location: experience.location || '',
      skills: experience.skills || [],
      activities: experience.activities || []
    });
  };

  const handleDelete = async (experienceId: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await client.models.Experiences.delete({ id: experienceId });
      setSuccessMessage('Experience deleted successfully!');
      
      // Refresh experiences list
      fetchExperiences();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting experience:', err);
      setError(err.message || 'Failed to delete experience');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentExperience(null);
    setFormData({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      location: '',
      skills: [],
      activities: []
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View padding="1rem">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={2}>Experience Management</Heading>
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
          {isEditing ? 'Edit Experience' : 'Add New Experience'}
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Company/Organization"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          />
          
          <TextField
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            required
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
          
          <Heading level={5} marginBottom="0.5rem">Activities/Responsibilities</Heading>
          <Flex direction="row" alignItems="flex-end" gap="0.5rem" marginBottom="1rem">
            <TextField
              label="Add Activity"
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
            />
            <Button onClick={handleActivityAdd} variation="primary">
              Add
            </Button>
          </Flex>
          
          {formData.activities.length > 0 && (
            <View marginBottom="1rem">
              <ul style={{ paddingLeft: '1.5rem' }}>
                {formData.activities.map((activity, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <Flex alignItems="center">
                      <Text>{activity}</Text>
                      <Button
                        size="small"
                        variation="link"
                        onClick={() => handleActivityRemove(index)}
                        style={{ padding: '0 0.5rem' }}
                      >
                        Remove
                      </Button>
                    </Flex>
                  </li>
                ))}
              </ul>
            </View>
          )}
          
          <Flex gap="1rem" marginTop="1rem">
            <Button
              type="submit"
              variation="primary"
              isLoading={loading}
              loadingText="Saving..."
            >
              {isEditing ? 'Update Experience' : 'Create Experience'}
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
      
      <Heading level={3} marginBottom="1rem">Experience List</Heading>
      
      {loading && !isEditing ? (
        <Flex justifyContent="center" padding="2rem">
          <Loader size="large" />
        </Flex>
      ) : experiences.length === 0 ? (
        <Text>No experiences found. Create your first experience above!</Text>
      ) : (
        <Collection
          items={experiences}
          type="list"
          gap="1rem"
          wrap="wrap"
        >
          {(experience, index) => (
            <Card key={index} variation="outlined">
              <Flex direction="column" padding="1rem">
                <Heading level={4}>{experience.position}</Heading>
                <Text marginBottom="0.5rem">
                  <strong>{experience.company}</strong>
                  {experience.location ? `, ${experience.location}` : ''}
                </Text>
                <Text marginBottom="0.5rem">
                  {experience.startDate && formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
                </Text>
                
                {experience.description && (
                  <Text marginBottom="0.5rem">
                    {experience.description.substring(0, 100)}
                    {experience.description.length > 100 ? '...' : ''}
                  </Text>
                )}
                
                {experience.skills && experience.skills.length > 0 && (
                  <Flex wrap="wrap" gap="0.5rem" marginBottom="0.5rem">
                    {experience.skills.map((skill: string, i: number) => (
                      <Badge key={i} variation="info">
                        {skill}
                      </Badge>
                    ))}
                  </Flex>
                )}
                
                <Flex gap="0.5rem" marginTop="auto">
                  <Button
                    onClick={() => handleEdit(experience)}
                    size="small"
                    variation="primary"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(experience.id)}
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
