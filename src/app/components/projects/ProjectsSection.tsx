'use client';

import React from 'react';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  View, 
  useTheme 
} from '@aws-amplify/ui-react';
import ProjectCard from './ProjectCard';
import Container from '../Container';
import { ProjectsSectionProps } from './types';

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  projects, 
  showAll = false,
  maxDisplay = 4 
}) => {
  const { tokens } = useTheme();
  
  const displayedProjects = showAll 
    ? projects 
    : projects.slice(0, maxDisplay);

  const handleSeeAll = () => {
    // Navigate to /projects page
    window.location.href = '/projects';
  };

  return (
    <View
      as="section"
      id="projects"
      paddingTop={tokens.space.xl}
      paddingBottom={tokens.space.xl}
      backgroundColor={tokens.colors.background.primary}
    >
      <Container>
        <Flex direction="column" alignItems="center" textAlign="center">
          {/* Section Header */}
          <Heading
            level={2}
            fontSize={{ base: tokens.fontSizes.xxl, large: tokens.fontSizes.xxxl }}
            color={tokens.colors.font.primary}
            marginBottom={tokens.space.xs}
            fontWeight={tokens.fontWeights.bold}
          >
            Featured Projects
          </Heading>
          
          <Text
            fontSize={tokens.fontSizes.medium}
            color={tokens.colors.font.secondary}
            maxWidth="700px"
            marginBottom={tokens.space.medium}
            lineHeight={tokens.lineHeights.medium}
          >
            A collection of projects I've worked on, ranging from research initiatives 
            and professional work to hackathon challenges and personal developments.
          </Text>

          {/* Accent Divider */}
          <View
            height="3px"
            width="60px"
            backgroundColor="var(--amplify-colors-primary-80)"
            borderRadius={tokens.radii.small}
            marginBottom={tokens.space.large}
          />

          {/* Projects Feed */}
          <Flex
            direction="column"
            gap={tokens.space.medium}
            width="100%"
            maxWidth="900px"
          >
            {displayedProjects.map((project, index) => (
              <ProjectCard 
                key={`project-${index}`} 
                {...project} 
              />
            ))}
          </Flex>

          {/* See All Button */}
          {!showAll && projects.length > maxDisplay && (
            <Flex direction="column" alignItems="center" marginTop={tokens.space.large}>
              <View
                height="3px"
                width="60px"
                backgroundColor="var(--amplify-colors-primary-80)"
                borderRadius={tokens.radii.small}
                marginBottom={tokens.space.medium}
              />
              <Button
                variation="primary"
                size="large"
                onClick={handleSeeAll}
                backgroundColor="var(--amplify-colors-primary-80)"
                className="project-button-hover"
              >
                View All Projects ({projects.length})
              </Button>
            </Flex>
          )}
        </Flex>
      </Container>
    </View>
  );
};

export default ProjectsSection;
