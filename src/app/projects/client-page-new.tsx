"use client";
import { useState, useMemo } from 'react';
import { 
  Loader, 
  View, 
  Text, 
  Heading, 
  Flex,
  Button
} from '@aws-amplify/ui-react';
import ProjectsSection from '../components/projects/ProjectsSection';
import Container from '../components/Container';
import { useAmplifyData } from '../../utils/data-loader/common-data-hooks';
import { ProjectItem } from '../components/projects/types';

// Define the Project type
interface Project {
  id: string;
  title: string;
  photoUrl?: string;
  description?: string;
  place?: string;
  projectUrl?: string;
  skills?: string[];
  gallery?: string[];
  categories?: string;
}

export default function ProjectsClient() {
  const [activeTab, setActiveTab] = useState('all');

  // Use our custom hook to fetch data
  const { data: projects, loading, error } = useAmplifyData<Project>(
    'Projects'
  );

  // Format projects for our component
  const formattedProjects: ProjectItem[] = useMemo(() => {
    return projects.map(project => ({
      id: project.id,
      title: project.title,
      photoUrl: project.photoUrl,
      description: project.description || '',
      place: project.place || '',
      projectUrl: project.projectUrl,
      skills: project.skills || [],
      gallery: project.gallery || [],
      categories: project.categories || 'Other'
    }));
  }, [projects]);
  
  // Filter projects by category
  const professionalProjects = useMemo(() => 
    formattedProjects.filter(p => p.categories?.toLowerCase() === 'professional'), 
    [formattedProjects]
  );
  
  const researchProjects = useMemo(() => 
    formattedProjects.filter(p => p.categories?.toLowerCase() === 'research'), 
    [formattedProjects]
  );
  
  const hackathonProjects = useMemo(() => 
    formattedProjects.filter(p => p.categories?.toLowerCase() === 'hackathon'), 
    [formattedProjects]
  );
  
  const allProjects = formattedProjects;

  // Get the current projects based on the active tab
  const getCurrentProjects = () => {
    switch (activeTab) {
      case 'professional':
        return professionalProjects;
      case 'research':
        return researchProjects;
      case 'hackathon':
        return hackathonProjects;
      default:
        return allProjects;
    }
  };

  // Define tabs for filtering
  const tabs = [
    { value: 'all', label: 'All Projects', count: allProjects.length },
    { value: 'professional', label: 'Professional', count: professionalProjects.length },
    { value: 'research', label: 'Research', count: researchProjects.length },
    { value: 'hackathon', label: 'Hackathons', count: hackathonProjects.length },
  ];  

  if (loading) {
    return (
      <View padding="2rem" textAlign="center">
        <Loader size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View padding="2rem" textAlign="center">
        <Text variation="error">{error}</Text>
      </View>
    );
  }
  
  return (
    <View className="flex flex-col min-h-screen">
      <View paddingTop="xl" paddingBottom="medium">
        <Container>
          <View textAlign="center" marginBottom="large">
            <Heading level={1} marginBottom="small">
              All Projects
            </Heading>
            <Text fontSize="medium" color="font.secondary" maxWidth="700px" margin="0 auto">
              Explore my complete portfolio of projects across research, professional work, 
              and hackathon challenges. Each project represents a unique learning experience 
              and contribution to technology innovation.
            </Text>
          </View>
        </Container>
      </View>
      <Container>
        {/* Custom Tab Navigation */}
        <Flex
          justifyContent="center"
          marginBottom="large"
          gap="small"
          wrap="wrap"
        >
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variation={activeTab === tab.value ? 'primary' : 'link'}
              onClick={() => setActiveTab(tab.value)}
              backgroundColor={activeTab === tab.value ? 'var(--amplify-colors-primary-80)' : undefined}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </Flex>

        {/* Display projects for current tab */}
        <ProjectsSection projects={getCurrentProjects()} />
        
        {getCurrentProjects().length === 0 && (
          <Text textAlign="center" padding="2rem">
            No projects found in this category.
          </Text>
        )}
      </Container>
    </View>
  );
}
