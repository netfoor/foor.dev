'use client';

import { ProjectsSection, getProjects, getProjectsByCategory } from '@/app/components/projects';
import { View, Heading, Text, Button, Flex } from '@aws-amplify/ui-react';
import Container from '@/app/components/Container';
import { useState } from 'react';

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const allProjects = getProjects();
  const professionalProjects = getProjectsByCategory('Professional');
  const researchProjects = getProjectsByCategory('Research');
  const hackathonProjects = getProjectsByCategory('Hackathon');

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

  const tabs = [
    { value: 'all', label: 'All Projects', count: allProjects.length },
    { value: 'professional', label: 'Professional', count: professionalProjects.length },
    { value: 'research', label: 'Research', count: researchProjects.length },
    { value: 'hackathon', label: 'Hackathons', count: hackathonProjects.length },
  ];

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
        >          {tabs.map((tab) => (
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

        {/* Projects Display */}
        <ProjectsSection 
          projects={getCurrentProjects()}
          showAll={true}
        />
      </Container>
    </View>
  );
}
