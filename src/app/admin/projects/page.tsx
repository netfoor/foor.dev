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
  SelectField,
  Alert
} from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import { useRouter } from 'next/navigation';

const client = generateClient<Schema>();

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    place: '',
    projectUrl: '',
    photoUrl: '',
    categories: '',
    skills: [] as string[],
    gallery: [] as string[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();

  const projectCategories = [
    'Hackathon', 'Research', 'Professional', 'Academic', 'Personal'
  ];

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    setError(null);
    try {
      const projectsData = await client.models.Projects.list();
      setProjects(projectsData.data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      const fileName = `projects/${Date.now()}-${file.name}`;
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
      let photoUrl = formData.photoUrl;
      
      // If there's a selected file, upload it first
      if (selectedFile) {
        photoUrl = await handleFileUpload(selectedFile);
      }
        // Create projectData with type-safe categories
      const projectData = {
        ...formData,
        photoUrl,
        // Convert string to enum type or null
        categories: formData.categories ? 
          (formData.categories as "Hackathon" | "Research" | "Professional" | "Academic" | "Personal") : 
          null
      };
      
      if (isEditing && currentProject) {
        // Update existing project
        await client.models.Projects.update({
          id: currentProject.id,
          ...projectData
        });
        setSuccessMessage('Project updated successfully!');
      } else {
        // Create new project
        await client.models.Projects.create(projectData);
        setSuccessMessage('Project created successfully!');
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        place: '',
        projectUrl: '',
        photoUrl: '',
        categories: '',
        skills: [],
        gallery: []
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setIsEditing(false);
      setCurrentProject(null);
      
      // Refresh projects list
      fetchProjects();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: any) => {
    setIsEditing(true);
    setCurrentProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      place: project.place || '',
      projectUrl: project.projectUrl || '',
      photoUrl: project.photoUrl || '',
      categories: project.categories || '',
      skills: project.skills || [],
      gallery: project.gallery || []
    });
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await client.models.Projects.delete({ id: projectId });
      setSuccessMessage('Project deleted successfully!');
      
      // Refresh projects list
      fetchProjects();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentProject(null);
    setFormData({
      title: '',
      description: '',
      place: '',
      projectUrl: '',
      photoUrl: '',
      categories: '',
      skills: [],
      gallery: []
    });
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <View padding="1rem">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={2}>Projects Management</Heading>
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
          {isEditing ? 'Edit Project' : 'Add New Project'}
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
            label="Place"
            name="place"
            value={formData.place}
            onChange={handleInputChange}
            required
            marginBottom="1rem"
          />
          
          <TextField
            label="Project URL"
            name="projectUrl"
            value={formData.projectUrl}
            onChange={handleInputChange}
            marginBottom="1rem"
            type="url"
          />
          
          <SelectField
            label="Category"
            name="categories"
            value={formData.categories}
            onChange={handleInputChange}
            marginBottom="1rem"
          >
            <option value="">Select a category</option>
            {projectCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectField>
          
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
          
          <Heading level={5} marginBottom="0.5rem">Project Image</Heading>
          
          {formData.photoUrl && (
            <Image
              src={formData.photoUrl}
              alt="Project preview"
              width="200px"
              height="auto"
              objectFit="cover"
              marginBottom="1rem"
            />
          )}
          
          <TextField
            label="Image URL"
            name="photoUrl"
            value={formData.photoUrl}
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
              {isEditing ? 'Update Project' : 'Create Project'}
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
      
      <Heading level={3} marginBottom="1rem">Projects List</Heading>
      
      {loading && !isEditing ? (
        <Flex justifyContent="center" padding="2rem">
          <Loader size="large" />
        </Flex>
      ) : projects.length === 0 ? (
        <Text>No projects found. Create your first project above!</Text>
      ) : (
        <Collection
          items={projects}
          type="list"
          gap="1rem"
          wrap="wrap"
        >
          {(project, index) => (
            <Card key={index} variation="outlined">
              <Flex>
                {project.photoUrl && (
                  <Image
                    src={project.photoUrl}
                    alt={project.title}
                    width="120px"
                    height="120px"
                    objectFit="cover"
                  />
                )}
                <Flex direction="column" padding="1rem" flex={1}>
                  <Heading level={4}>{project.title}</Heading>
                  <Text marginBottom="0.5rem">{project.place}</Text>
                  <Text>{project.description.substring(0, 100)}{project.description.length > 100 ? '...' : ''}</Text>
                  
                  {project.categories && (
                    <Badge variation="info" marginTop="0.5rem">
                      {project.categories}
                    </Badge>
                  )}
                  
                  <Flex gap="0.5rem" marginTop="auto">
                    <Button
                      onClick={() => handleEdit(project)}
                      size="small"
                      variation="primary"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(project.id)}
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
