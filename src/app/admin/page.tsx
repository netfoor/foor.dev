"use client"
import { useState, useEffect } from 'react';
import { Heading, View, Card, Grid, Flex, Text, Button } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';

// Custom TabItem component since TabItem doesn't exist in Amplify UI React
const TabItem = ({ 
  title, 
  isSelected, 
  onClick, 
  children 
}: { 
  title: string, 
  isSelected: boolean, 
  onClick: () => void, 
  children: React.ReactNode 
}) => {
  return (
    <View>
      <Button
        onClick={onClick}
        variation={isSelected ? "primary" : "link"}
        style={{
          margin: '0 0.5rem',
          borderRadius: isSelected ? '4px 4px 0 0' : '4px',
          borderBottom: isSelected ? 'none' : undefined,
        }}
      >
        {title}
      </Button>
      {isSelected && (
        <View
          padding="1.5rem"
          backgroundColor="var(--amplify-colors-background-secondary)"
          borderRadius="0 4px 4px 4px"
          marginTop="0"
          style={{ borderTop: '2px solid var(--amplify-colors-brand-primary)' }}
        >
          {children}
        </View>
      )}
    </View>
  );
};

// Custom Tabs component
const Tabs = ({ 
  children, 
  marginBottom 
}: { 
  children: React.ReactNode, 
  marginBottom: string 
}) => {
  return (
    <View marginBottom={marginBottom}>
      <Flex direction="column">
        <Flex>
          {children}
        </Flex>
      </Flex>
    </View>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  return (
    <View padding="1rem">
      <Heading level={2} marginBottom="1rem">Admin Dashboard</Heading>
        <Tabs
        marginBottom="1.5rem"
      >
        <TabItem title="Dashboard" isSelected={activeTab === 0} onClick={() => setActiveTab(0)}>
          <AdminOverview router={router} />
        </TabItem>        <TabItem title="Projects" isSelected={activeTab === 1} onClick={() => setActiveTab(1)}>
          <Heading level={3}>Projects Management</Heading>
          <Text>Create and manage your projects here.</Text>
          <Button 
            variation="primary" 
            marginTop="1rem"
            onClick={() => router.push('/admin/projects')}
          >
            Manage Projects
          </Button>
        </TabItem>
        <TabItem title="Certifications" isSelected={activeTab === 2} onClick={() => setActiveTab(2)}>
          <Heading level={3}>Certifications Management</Heading>
          <Text>Create and manage your certifications here.</Text>
          <Button 
            variation="primary" 
            marginTop="1rem"
            onClick={() => router.push('/admin/certifications')}
          >
            Manage Certifications
          </Button>
        </TabItem>        <TabItem title="Recognitions" isSelected={activeTab === 3} onClick={() => setActiveTab(3)}>
          <Heading level={3}>Recognitions Management</Heading>
          <Text>Create and manage your recognitions and awards here.</Text>
          <Button 
            variation="primary" 
            marginTop="1rem"
            onClick={() => router.push('/admin/recognitions')}
          >
            Manage Recognitions
          </Button>
        </TabItem>
        <TabItem title="Education" isSelected={activeTab === 4} onClick={() => setActiveTab(4)}>
          <Heading level={3}>Education Management</Heading>
          <Text>Create and manage your education history here.</Text>
          <Button 
            variation="primary" 
            marginTop="1rem"
            onClick={() => router.push('/admin/education')}
          >
            Manage Education
          </Button>
        </TabItem>
        <TabItem title="Experience" isSelected={activeTab === 5} onClick={() => setActiveTab(5)}>
          <Heading level={3}>Experience Management</Heading>
          <Text>Create and manage your work experience here.</Text>
          <Button 
            variation="primary" 
            marginTop="1rem"
            onClick={() => router.push('/admin/experience')}
          >
            Manage Experience
          </Button>
        </TabItem>
        <TabItem title="Publications" isSelected={activeTab === 6} onClick={() => setActiveTab(6)}>
          <Heading level={3}>Publications Management</Heading>
          <Text>Create and manage your social publications here.</Text>
          <Button 
            variation="primary" 
            marginTop="1rem"
            onClick={() => router.push('/admin/publications')}
          >
            Manage Publications
          </Button>
        </TabItem>
        <TabItem title="Languages" isSelected={activeTab === 7} onClick={() => setActiveTab(7)}>
          <Heading level={3}>Languages Management</Heading>
          <Text>Create and manage your language proficiencies here.</Text>
          <Button 
            variation="primary" 
            marginTop="1rem"
            onClick={() => router.push('/admin/languages')}
          >
            Manage Languages
          </Button>
        </TabItem>
      </Tabs>
    </View>
  );
}

function AdminOverview({ router }: { router: any }) {
  const [counts, setCounts] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCounts() {
      try {
        const client = generateClient<Schema>();
        
        // Fetch counts for all content types
        const [
          projects,
          certifications,
          recognitions,
          education,
          experiences,
          publications,
          languages
        ] = await Promise.all([
          client.models.Projects.list(),
          client.models.Certifications.list(),
          client.models.Recognitions.list(),
          client.models.Education.list(),
          client.models.Experiences.list(),
          client.models.SocialPublications.list(),
          client.models.Languages.list()
        ]);
        
        setCounts({
          Projects: projects.data.length.toString(),
          Certifications: certifications.data.length.toString(),
          Recognitions: recognitions.data.length.toString(),
          Education: education.data.length.toString(),
          Experience: experiences.data.length.toString(),
          Publications: publications.data.length.toString(),
          Languages: languages.data.length.toString()
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCounts();
  }, []);

  const sections = [
    { title: 'Projects', description: 'Manage your portfolio projects', count: counts.Projects || '0', path: '/admin/projects' },
    { title: 'Certifications', description: 'Manage your certifications', count: counts.Certifications || '0', path: '/admin/certifications' },
    { title: 'Recognitions', description: 'Manage your awards and recognitions', count: counts.Recognitions || '0', path: '/admin/recognitions' },
    { title: 'Education', description: 'Manage your education history', count: counts.Education || '0', path: '/admin/education' },
    { title: 'Experience', description: 'Manage your work experience', count: counts.Experience || '0', path: '/admin/experience' },
    { title: 'Publications', description: 'Manage your social publications', count: counts.Publications || '0', path: '/admin/publications' },
    { title: 'Languages', description: 'Manage your language proficiencies', count: counts.Languages || '0', path: '/admin/languages' },
  ];

  return (
    <View>
      <Heading level={3} marginBottom="1rem">Portfolio Overview</Heading>
      
      <Grid
        templateColumns={{ base: '1fr', medium: '1fr 1fr', large: '1fr 1fr 1fr' }}
        gap="1rem"
      >
        {sections.map((section, index) => (
          <Card key={index} variation="outlined">
            <Flex direction="column" padding="1rem">
              <Heading level={4}>{section.title}</Heading>
              <Text>{section.description}</Text>
              <Flex justifyContent="space-between" alignItems="center" marginTop="1rem">
                <Text fontWeight="bold">
                  Count: {loading ? <Text as="span">Loading...</Text> : section.count}
                </Text>
                <Button 
                  variation="link" 
                  onClick={() => router.push(section.path)}
                >
                  Manage →
                </Button>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Grid>
    </View>
  );
}
