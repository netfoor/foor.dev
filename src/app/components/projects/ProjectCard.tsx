'use client';

import React from 'react';
import { 
  Card, 
  Image, 
  Text, 
  Button, 
  Flex, 
  Heading, 
  View, 
  useTheme,
  Badge 
} from '@aws-amplify/ui-react';
import { ProjectCardProps } from './types';

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  photoUrl,
  description,
  projectUrl,
  place,
  skills,
  categories,
}) => {
  const { tokens } = useTheme();

  const handleViewProject = () => {
    if (projectUrl) {
      window.open(projectUrl, '_blank', 'noopener noreferrer');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'research':
        return '#8B5CF6'; // Purple
      case 'professional':
        return '#059669'; // Green
      case 'hackathon':
        return '#DC2626'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  return (
    <Card
      variation="elevated"
      padding={tokens.space.medium}
      borderRadius={tokens.radii.medium}
      backgroundColor={tokens.colors.background.primary}
      width="100%"
      maxWidth="800px"
      margin="0 auto"
      className="project-card-hover"
    >
      <Flex direction={{ base: 'column', medium: 'row' }} gap={tokens.space.medium}>        {/* Project Image */}        <Flex
          width={{ base: '100%', medium: '200px' }}
          height="140px"
          borderRadius={tokens.radii.small}
          overflow="hidden"
          backgroundColor={tokens.colors.background.secondary}
          justifyContent="center"
          alignItems="center"
          shrink="0"
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`${title} project`}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          ) : (            <Flex direction="column" alignItems="center" gap={tokens.space.xs}>
              <Flex
                width="40px"
                height="40px"
                borderRadius="50%"
                backgroundColor="var(--amplify-colors-primary-80)"
                justifyContent="center"
                alignItems="center"
              >                <Text color="white" fontSize={tokens.fontSizes.large}>📁</Text>
              </Flex>
              <Text
                fontSize={tokens.fontSizes.xs}
                color={tokens.colors.font.tertiary}
                textAlign="center"
              >
                Project Image
              </Text>
            </Flex>
          )}
        </Flex>

        {/* Project Content */}
        <Flex direction="column" flex="1" gap={tokens.space.xs}>
          {/* Header with category and location */}
          <Flex 
            justifyContent="space-between" 
            alignItems="flex-start"
            wrap="wrap"
            gap={tokens.space.xs}
          >
            <Badge
              backgroundColor={getCategoryColor(categories)}
              color="white"
              fontSize={tokens.fontSizes.xs}
              paddingInline={tokens.space.xs}
              paddingBlock={tokens.space.xxxs}
              borderRadius={tokens.radii.small}
            >
              {categories}
            </Badge>
            <Text
              fontSize={tokens.fontSizes.xs}
              color={tokens.colors.font.secondary}
              fontWeight={tokens.fontWeights.medium}
            >
              📍 {place}
            </Text>
          </Flex>

          {/* Project Title */}
          <Heading
            level={4}
            fontSize={tokens.fontSizes.large}
            color={tokens.colors.font.primary}
            lineHeight={tokens.lineHeights.medium}
            marginBottom={tokens.space.xs}
          >
            {title}
          </Heading>

          {/* Description */}
          <Text
            fontSize={tokens.fontSizes.small}
            color={tokens.colors.font.secondary}
            lineHeight={tokens.lineHeights.medium}
            marginBottom={tokens.space.small}
          >
            {description.length > 150 
              ? `${description.substring(0, 150)}...` 
              : description
            }
          </Text>

          {/* Skills Tags */}
          <Flex wrap="wrap" gap={tokens.space.xs} marginBottom={tokens.space.small}>
            {skills.slice(0, 4).map((skill, index) => (
              <Text
                key={index}
                fontSize={tokens.fontSizes.xs}
                color={tokens.colors.font.tertiary}
                backgroundColor={tokens.colors.background.secondary}
                paddingInline={tokens.space.xs}
                paddingBlock={tokens.space.xxxs}
                borderRadius={tokens.radii.small}
              >
                {skill}
              </Text>
            ))}
            {skills.length > 4 && (
              <Text
                fontSize={tokens.fontSizes.xs}
                color={tokens.colors.font.tertiary}
                fontStyle="italic"
              >
                +{skills.length - 4} more
              </Text>
            )}
          </Flex>

          {/* Action Button */}
          {projectUrl && (
            <Flex justifyContent="flex-start">
              <Button
                variation="primary"
                size="small"
                onClick={handleViewProject}
                backgroundColor="var(--amplify-colors-primary-80)"
                className="project-button-hover"
              >
                View Project →
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default ProjectCard;
